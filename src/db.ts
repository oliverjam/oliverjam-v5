import { Database } from "bun:sqlite";
import type { SQLQueryBindings } from "bun:sqlite";
import { invariant } from "./app.tsx";

let db = new Database("./data/blog.db");

function sql<Return, Bind extends SQLQueryBindings | SQLQueryBindings[] = []>(
	strings: TemplateStringsArray,
	...params: Array<unknown>
) {
	let query = String.raw(strings, ...params);
	return db.query<Return, Bind>(query);
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

export type ArticleIn = Omit<Article, "created"> & { created: string | null };

export type Note = {
	type: "note";
	slug: string;
	created: string;
	draft: 0 | 1;
	content: string;
};

type NoteIn = Omit<Note, "created">;

type Tag = { slug: string };
export type Tags = Array<Tag>;

type Insert<T> = {
	[K in keyof T as `$${string & K}`]: T[K];
};

type PostType<T extends Post["type"]> = T extends "article"
	? Article
	: T extends "note"
	? Note
	: Post;

export function parse_article(body: FormData): [ArticleIn, Array<string>] {
	let slug = body.get("slug");
	let title = body.get("title");
	let intro = body.get("intro");
	let draft = body.has("draft");
	let time = body.get("time");
	let content = body.get("content");
	let created = body.get("created");
	let tags = body.getAll("tags");
	invariant(typeof slug === "string", `Missing slug`);
	invariant(typeof title === "string", `Missing title`);
	invariant(typeof intro === "string", `Missing intro`);
	invariant(typeof time === "string", `Missing time`);
	invariant(typeof content === "string", `Missing content`);
	invariant(typeof created === "string" || created === null, `Missing created`);
	return [
		{
			slug,
			type: "article",
			title,
			intro,
			draft: draft ? 1 : 0,
			time: Number(time),
			content,
			created,
		},
		tags.map(String),
	];
}

export let model = {
	posts: {
		list<T extends Post["type"]>(type: T | null, tags: Array<string>) {
			if (tags.length) {
				let in_tags = [];
				for (let t of tags) in_tags.push(`'${t}'`);
				return sql<PostType<T>, [T | null]>`
					select * from posts join posts_tags on slug = post
					where draft = 0 and type = coalesce(?, type) and tag in (${in_tags.join(",")})
					group by slug having count(*) = ${in_tags.length}
					order by created desc
				`.all(type || null);
			} else {
				return sql<PostType<T>, [T | null]>`
					select * from posts
					where draft = 0 and type = coalesce(?, type)
					order by created desc
				`.all(type || null);
			}
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
					insert into posts (slug, type, draft, content, title, time, intro, created)
					values ($slug, $type, $draft, $content, $title, $time, $intro, coalesce($created, current_timestamp))
				`.run({
						$slug,
						$draft,
						$type: post.type,
						$content: post.content,
						$title: post.title,
						$time: post.time,
						$intro: post.intro,
						$created: post.created,
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
				order by count desc
			`.all();
		},
		posts(tag: string) {
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
