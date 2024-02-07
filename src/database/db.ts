import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { desc, eq, placeholder } from "drizzle-orm";
import * as schema from "./schema.ts";

let driver = new Database("./data/blog.db");
let db = drizzle(driver, { schema, logger: true });

migrate(db, { migrationsFolder: "migrations" });

export let model = {
	posts: {
		list: () => _posts_list.all(),
	},
	articles: {
		list: () => _articles_list.all(),
		read: (slug: string) => _articles_read.all({ slug }).at(0),
	},
	notes: {
		list: () => _notes_list.all(),
		read: (slug: string) => _notes_read.all({ slug }).at(0),
	},
};

type X = typeof schema.posts.$inferSelect;

export type Post = NonNullable<ReturnType<typeof model.posts.list>[0]>;
export type Article = NonNullable<ReturnType<typeof model.articles.read>>;
export type Note = NonNullable<ReturnType<typeof model.notes.read>>;

let _posts_list = db
	.select()
	.from(schema.posts)
	.where(eq(schema.posts.draft, false))
	.leftJoin(schema.articles, eq(schema.posts.slug, schema.articles.slug))
	.leftJoin(schema.notes, eq(schema.posts.slug, schema.notes.slug))
	.orderBy(desc(schema.posts.created))
	.prepare();

let _posts_list1 = console.log(
	db.query.posts
		.findMany({
			where: (t, q) => q.eq(t.draft, false),
			orderBy: (t, q) => [q.desc(t.created)],
			with: { tags: true, article: true, note: true },
		})
		.toSQL().sql
);
// .prepare();

let _articles_list = db.query.posts
	.findMany({
		where: (t, q) => q.and(q.eq(t.kind, "article"), q.eq(t.draft, false)),
		orderBy: (t, q) => [q.desc(t.created)],
		with: { tags: true, article: true },
	})
	.prepare();

let _articles_read = db.query.posts
	.findMany({
		where: (t, q) => q.eq(t.slug, placeholder("slug")),
		with: { tags: true, article: true },
		limit: 1,
	})
	.prepare();

let _notes_list = db.query.posts
	.findMany({
		where: (t, q) => q.and(q.eq(t.kind, "note"), q.eq(t.draft, false)),
		orderBy: (t, q) => [q.desc(t.created)],
		with: { tags: true, note: true },
	})
	.prepare();

let _notes_read = db.query.posts
	.findMany({
		where: (t, q) => q.eq(t.slug, placeholder("slug")),
		with: { tags: true, note: true },
		limit: 1,
	})
	.prepare();

//     select slug, title, intro, date, 'article' as kind from articles
//     where draft = 0
//     union
//     select slug, null as title, content as intro, date, 'note' as kind from notes
//     where draft = 0
//     order by date desc

// class Articles {
// 	#list = db.query.articles
// 		.findMany({
// 			where: (t, q) => q.not(q.eq(t.draft, false)),
// 			orderBy: (t, q) => [q.desc(t.date)],
// 			with: { tags: true },
// 		})
// 		.prepare();
// 	list = () => this.#list.all();

// 	#read = db.query.articles
// 		.findMany({
// 			where: (t, q) => q.eq(t.slug, placeholder("slug")),
// 			limit: 1,
// 			with: { tags: true },
// 		})
// 		.prepare();
// 	read = (slug: string) => this.#read.all({ slug }).at(0);
// // };

// class Articles {
// 	#list = db.query.articles
// 		.findMany({
// 			where: (t, q) => q.not(q.eq(t.draft, false)),
// 			orderBy: (t, q) => [q.desc(t.date)],
// 			with: { tags: true },
// 		})
// 		.prepare();
// 	list = () => this.#list.all();

// 	#read = db.query.articles
// 		.findMany({
// 			where: (t, q) => q.eq(t.slug, placeholder("slug")),
// 			limit: 1,
// 			with: { tags: true },
// 		})
// 		.prepare();
// 	read = (slug: string) => this.#read.all({ slug }).at(0);

// #create = db.query<void, ArticleIn>(sql`
//   insert into articles (slug, title, time, date, intro, content, draft)
//   values ($slug, $title, $time, $date, $intro, $content, $draft)
// `);
// create = (article: ArticleIn, tags: Array<FormDataEntryValue>) => {
// 	this.#create.run(article);
// 	tags.forEach((t) => this.tags.create(String(t), article.$slug));
// };

// tags = new ArticlesTags();
// }

// class ArticlesTags {
// 	#list = db.query<{ slug: string; count: number }, []>(sql`
// 		select tag_slug as slug, count(tag_slug) as count
// 		from articles_tags
// 		group by tag_slug
// 		order by count desc
// 	`);
// 	list = () => this.#list.all();

// 	#read = db.query<Tag, [string]>(sql`
//     select tag_slug as slug from articles_tags where article_slug = ?
//   `);
// 	read = (slug: string) => this.#read.all(slug);

// 	#create = db.query<void, [string, string]>(sql`
// 		insert into articles_tags (tag_slug, article_slug) values (?, ?)
// 	`);
// 	create = (tag: string, article: string) => {
// 		this.#create.run(tag, article);
// 		model.tags.create(tag);
// 	};
// }

// type Note = {
// 	slug: string;
// 	date: string;
// 	content: string;
// 	draft: 0 | 1;
// };

// class Notes {
// 	#list = db.query.notes
// 		.findMany({
// 			where: (t, q) => q.not(q.eq(t.draft, false)),
// 			orderBy: (t, q) => [q.desc(t.date)],
// 		})
// 		.prepare();
// 	list = () => this.#list.all();

// 	#read = db.query.notes
// 		.findMany({ where: (t, q) => q.eq(t.slug, placeholder("slug")), limit: 1 })
// 		.prepare();
// 	read = (slug: string) => this.#read.all({ slug }).at(0);
// }

// export type Tag = {
// 	slug: string;
// };

// class Tags {
// 	#list = db.query<Tag, []>(sql`
//     select slug from tags
//   `);
// 	list = () => this.#list.all();

// 	#create = db.query<void, [string]>(sql`
// 		insert into tags values (?)
// 		on conflict do nothing
// 	`);
// 	create = (tag: string) => this.#create.run(tag);

// 	#article = db.query<Tag, [string]>(sql`
//     select tag_slug as slug from articles_tags where article_slug = ?
//   `);
// 	article = (slug: string) => this.#article.all(slug);

// 	#note = db.query<Tag, [string]>(sql`
//     select tag_slug as slug from notes_tags where note_slug = ?
//   `);
// 	note = (slug: string) => this.#note.all(slug);
// }

// export type Entry =
// 	| {
// 			slug: string;
// 			title: string;
// 			intro: string;
// 			date: string;
// 			kind: "article";
// 			tags: Array<Tag>;
// 	  }
// 	| {
// 			slug: string;
// 			title?: undefined;
// 			intro: string;
// 			date: string;
// 			kind: "note";
// 			tags: Array<Tag>;
// 	  };

// class All {
// 	#list = db.query<Entry, []>(sql`
//     select slug, title, intro, date, 'article' as kind from articles
//     where draft = 0
//     union
//     select slug, null as title, content as intro, date, 'note' as kind from notes
//     where draft = 0
//     order by date desc
//   `);
// 	list = () => this.#list.all();
// }

// export let model = {
// 	articles: new Articles(),
// 	notes: new Notes(),
// 	all: new All(),
// 	tags: new Tags(),
// };
