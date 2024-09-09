import { Database } from "bun:sqlite";
import type { Article, Note, Post, PostType, Tag } from "./types.ts";

let db = new Database("./data/blog.db", { strict: true });

let sql = String.raw;

let schema = sql`
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

type In<T> = Omit<T, "created"> & { created: string | null };

type WhatPost<T extends PostType> = T extends "article"
	? Article
	: T extends "note"
	? Note
	: Post;

export let posts = {
	list<T extends PostType>(type: T | null, filters: Array<string>) {
		let query = "";
		if (filters.length) {
			let tags = [];
			for (let t of filters) tags.push(`'${t}'`);
			query = sql`
				select * from posts join posts_tags on slug = post
				where draft = 0 and type = coalesce(?, type) and tag in (${tags.join(",")})
				group by slug having count(*) = ${tags.length}
				order by created desc
			`;
		} else {
			query = sql`
				select * from posts
				where draft = 0 and type = coalesce(?, type)
				order by created desc
			`;
		}
		return db.query<WhatPost<T>, [T | null]>(query).all(type);
	},
	read<T extends PostType>(slug: string) {
		let query = sql`select * from posts where slug = ?`;
		return db.query<WhatPost<T>, string>(query).get(slug);
	},
	create(post: In<Article> | In<Note>, post_tags: Array<string>) {
		db.transaction(() => {
			let slug = post.slug.replace(/\W/g, "-");
			if (post.type === "article") {
				let query = sql`
					insert into posts (slug, type, draft, content, title, time, intro, created)
					values ($slug, $type, $draft, $content, $title, $time, $intro, coalesce($created, current_timestamp))
				`;
				db.query<void, In<Article>>(query).run({ ...post, slug });
			}
			if (post.type === "note") {
				let query = sql`
						insert into posts (slug, type, draft, content)
						values ($slug, $type, $draft, $content)
					`;
				db.query<void, In<Note>>(query).run({
					slug,
					created: post.created,
					draft: post.draft,
					type: post.type,
					content: post.content,
				});
			}
			for (let tag of post_tags) tags.create(tag, slug);
		})();
	},
};

export let tags = {
	list() {
		let q = sql`
			select tag, count(tag) as count from posts_tags group by tag
			order by count desc
		`;
		return db.query<{ tag: string; count: number }, []>(q).all();
	},
	posts(tag: string) {
		let q = sql`
			select posts.* from posts_tags join posts
			on post = slug
			where tag = ?
		`;
		return db.query<Post, string>(q).all(tag);
	},
	post(post_slug: string) {
		let q = sql`select tag as slug from posts_tags where post = ?`;
		return db.query<Tag, string>(q).all(post_slug);
	},
	create(tag: string, slug: string) {
		let insert_tag = sql`insert into tags values (?)`;
		let link_tag = sql`insert into posts_tags (tag, post) values (?, ?)`;
		db.query(insert_tag).run(tag);
		db.query(link_tag).run(tag, slug);
	},
};
