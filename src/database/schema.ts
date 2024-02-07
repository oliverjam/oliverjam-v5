import { sql, relations } from "drizzle-orm";
import {
	sqliteTable,
	text,
	real,
	integer,
	primaryKey,
} from "drizzle-orm/sqlite-core";

export let posts = sqliteTable("posts", {
	slug: text("slug").primaryKey().notNull(),
	kind: text("kind", { enum: ["article", "note"] }).notNull(),
	created: text("created")
		.notNull()
		.default(sql`current_timestamp`),
	draft: integer("draft", { mode: "boolean" }).notNull().default(false),
});

export let posts_relations = relations(posts, ({ one, many }) => ({
	article: one(articles),
	note: one(notes),
	tags: many(posts_tags),
	// article: one(articles, { fields: [posts.slug], references: [articles.slug] }),
	// note: one(notes, { fields: [posts.slug], references: [notes.slug] }),
}));

export let articles = sqliteTable("articles", {
	// slug: text("slug").primaryKey().notNull(),
	slug: text("slug").references(() => posts.slug),
	title: text("title").notNull(),
	// date: text("date").notNull(),
	intro: text("intro").notNull(),
	content: text("content").notNull(),
	time: real("time").notNull(),
	// draft: integer("draft", { mode: "boolean" }).notNull().default(false),
	// created: text("created").default(sql`current_timestamp`),
});

export let articles_relations = relations(articles, ({ one }) => ({
	post: one(posts, { fields: [articles.slug], references: [posts.slug] }),
	// tags: many(articles_tags),
}));

export let notes = sqliteTable("notes", {
	// slug: text("slug").primaryKey().notNull(),
	slug: text("slug").references(() => posts.slug),
	// date: text("date").notNull(),
	content: text("content").notNull(),
	// draft: integer("draft", { mode: "boolean" }).notNull().default(false),
	// created: text("created").default(sql`current_timestamp`),
});

export let notes_relations = relations(notes, ({ one }) => ({
	post: one(posts, { fields: [notes.slug], references: [posts.slug] }),
	// notes_tags: many(notes_tags),
}));

export let tags = sqliteTable("tags", {
	slug: text("slug").primaryKey().notNull(),
});

export let tags_relations = relations(tags, ({ many }) => ({
	posts: many(posts_tags),
	// articles: many(articles),
	// notes: many(notes),
}));

let tag_key = () => tags.slug;
let post_key = () => posts.slug;
// let article_key = () => articles.slug;
// let note_key = () => notes.slug;

export let posts_tags = sqliteTable(
	"posts_tags",
	{
		tag_slug: text("tag_slug").notNull().references(tag_key),
		post_slug: text("article_slug").notNull().references(post_key),
	},
	(t) => ({ pk: primaryKey(t.tag_slug, t.post_slug) })
);

export let posts_tags_relations = relations(posts_tags, ({ one }) => ({
	post: one(posts, {
		fields: [posts_tags.post_slug],
		references: [posts.slug],
	}),
	tag: one(tags, {
		fields: [posts_tags.tag_slug],
		references: [tags.slug],
	}),
	// article: one(posts, {
	// 	fields: [posts_tags.post_slug],
	// 	references: [posts.slug],
	// }),
	// tag: one(tags, {
	// 	fields: [posts_tags.tag_slug],
	// 	references: [tags.slug],
	// }),
}));

// export let articles_tags = sqliteTable(
// 	"articles_tags",
// 	{
// 		tag_slug: text("tag_slug").notNull().references(tag_key),
// 		article_slug: text("article_slug").notNull().references(article_key),
// 	},
// 	(t) => ({ pk: primaryKey(t.tag_slug, t.article_slug) })
// );

// export let articles_tags_relations = relations(articles_tags, ({ one }) => ({
// 	article: one(articles, {
// 		fields: [articles_tags.article_slug],
// 		references: [articles.slug],
// 	}),
// 	tag: one(tags, {
// 		fields: [articles_tags.tag_slug],
// 		references: [tags.slug],
// 	}),
// }));

// export let notes_tags = sqliteTable(
// 	"notes_tags",
// 	{
// 		tag_slug: text("tag_slug").notNull().references(tag_key),
// 		note_slug: text("note_slug").notNull().references(note_key),
// 	},
// 	(t) => ({ pk: primaryKey(t.tag_slug, t.note_slug) })
// );
