import { Database } from "bun:sqlite";
import type { SQLQueryBindings } from "bun:sqlite";

let db = new Database("./data/blog.db");

function sql<Return, Bind extends SQLQueryBindings | SQLQueryBindings[] = []>(
	strings: TemplateStringsArray
) {
	return db.query<Return, Bind>(strings.join(""));
}

let schema = /*sql*/ `
	create table if not exists posts (
		type text not null check(type in ('article', 'post')),
		slug text primary key not null,
		draft integer check (draft in (0, 1)) not null,
		created text default current_timestamp not null,
		title text,
		time real,
		intro text,
		content text
	) strict;

	create table if not exists tags (
		slug text primary key on conflict ignore
	) strict;

	create table if not exists posts_tags (
		post text references posts(slug),
		tag text references tags(slug),
		primary key (post, tag)
	) strict;
`;

db.run(schema);

export type Post = Article | Note;

export type Article = {
	type: "article";
	slug: string;
	created: string;
	draft: 0 | 1;
	title: string;
	time: number;
	intro: string;
	content: string;
};

type ArticleIn = Omit<Article, "created">;

export type Note = {
	type: "note";
	slug: string;
	created: string;
	draft: 0 | 1;
	content: string;
};

type NoteIn = Omit<Note, "created">;

type Tag = { slug: string };

type Insert<T> = {
	[K in keyof T as `$${string & K}`]: T[K];
};

type PostType<T extends Post["type"]> = T extends "article"
	? Article
	: T extends "note"
	? Note
	: Post;

export let model = {
	posts: {
		list<T extends Post["type"]>(type?: T) {
			return sql<PostType<T>, [T | null]>`
				select * from posts
				where draft = 0 and type = coalesce(?, type)
				order by created desc
			`.all(type || null);
		},
		read<T extends Post>(slug: string) {
			return sql<T, string>`
				select * from posts where slug = ?
			`.get(slug);
		},
		create(post: ArticleIn | NoteIn, tags: Array<string>) {
			db.transaction(() => {
				let $slug = post.slug.replace(/\W/g, "-");
				const $draft = post.draft ? 1 : 0;
				if (post.type === "article") {
					sql<void, Insert<ArticleIn>>`
					insert into posts (slug, type, draft, content, title, time, intro)
					values ($slug, $type, $draft, $content, $title, $time, $intro)
				`.run({
						$slug,
						$draft,
						$type: post.type,
						$content: post.content,
						$title: post.title,
						$time: post.time,
						$intro: post.intro,
					});
				}
				if (post.type === "note") {
					sql<void, Insert<NoteIn>>`
						insert into posts (slug, type, draft, content)
						values ($slug, $type, $draft, $content)
					`.run({ $slug, $type: post.type, $draft, $content: post.content });
				}
				for (let tag of tags) model.tags.create(tag, $slug);
			})();
		},
	},
	tags: {
		list() {
			return sql<{ tag: string; count: number }>`
				select tag, count(tag) as count from posts_tags group by tag
			`.all();
		},
		posts(tag: string) {
			console.log({ tag });
			return sql<Post, string>`
				select posts.* from posts_tags join posts on post = slug where tag = ?
			`.all(tag);
		},
		post(post_slug: string) {
			return sql<Tag, string>`
				select tag as slug from posts_tags where post = ?
			`.all(post_slug);
		},
		create(tag: string, slug: string) {
			sql<void, typeof tag>`insert into tags values (?)`.run(tag);
			sql<void, [typeof tag, typeof slug]>`
				insert into posts_tags (tag, post) values (?, ?)
			`.run(tag, slug);
		},
	},
};
