import { Database } from "bun:sqlite";

let db = new Database("./data/blog.db");

let sql = String.raw;

let schema = sql`
	create table if not exists articles (
		slug text primary key,
		title text not null,
		time real not null,
		date text not null,
		intro text not null,
		content text not null,
		draft integer check (draft in (0, 1)),
		created text default current_timestamp
	) strict;

	create table if not exists notes (
		slug text primary key,
		date text not null,
		content text not null,
		draft integer check (draft in (0, 1)),
		created text default current_timestamp
	) strict;

	create table if not exists tags (slug text primary key) strict;

	create table if not exists articles_tags (
		article_slug text references articles(slug),
		tag_slug text references tags(slug),
		primary key (article_slug, tag_slug)
	) strict;

	create table if not exists notes_tags (
		note_slug text references notes(slug),
		tag_slug text references tags(slug),
		primary key (note_slug, tag_slug)
	) strict;
`;

db.run(schema);

type Article = {
	slug: string;
	title: string;
	time: number;
	date: string;
	intro: string;
	content: string;
	draft: 0 | 1;
};

type ArticleIn = {
	$slug: string;
	$title: string;
	$time: number;
	$date: string;
	$intro: string;
	$content: string;
	$draft: 0 | 1;
};

class Articles {
	#list = db.query<Article, []>(sql`
    select slug, title, intro, time from articles
    where draft = 0
    order by date desc
  `);
	list = () => this.#list.all();

	#read = db.query<Article, [string]>(sql`
    select slug, title, intro, time, date, content from articles
    where slug = ?
    limit 1
  `);
	read = (slug: string) => this.#read.get(slug);

	#create = db.query<void, ArticleIn>(sql`
    insert into articles (slug, title, time, date, intro, content, draft)
    values ($slug, $title, $time, $date, $intro, $content, $draft)
  `);
	create = (article: ArticleIn, tags: Array<FormDataEntryValue>) => {
		this.#create.run(article);
		tags.forEach((t) => this.tags.create(String(t), article.$slug));
	};

	tags = new ArticlesTags();
}

class ArticlesTags {
	#list = db.query<{ slug: string; count: number }, []>(sql`
		select tag_slug as slug, count(tag_slug) as count
		from articles_tags
		group by tag_slug
		order by count desc
	`);
	list = () => this.#list.all();

	#read = db.query<Tag, [string]>(sql`
    select tag_slug as slug from articles_tags where article_slug = ?
  `);
	read = (slug: string) => this.#read.all(slug);

	#create = db.query<void, [string, string]>(sql`
		insert into articles_tags (tag_slug, article_slug) values (?, ?)
	`);
	create = (tag: string, article: string) => {
		this.#create.run(tag, article);
		model.tags.create(tag);
	};
}

type Note = {
	slug: string;
	date: string;
	content: string;
	draft: 0 | 1;
};

class Notes {
	#list = db.query<Note, []>(sql`
    select slug, date, content from notes
    where draft = 0
    order by date desc
  `);
	list = () => this.#list.all();

	#read = db.query<Note, [string]>(sql`
    select slug, date, content from notes
    where slug = ?
    limit 1
  `);
	read = (slug: string) => this.#read.get(slug);
}

type Tag = {
	slug: string;
};

class Tags {
	#list = db.query<Tag, []>(sql`
    select slug from tags
  `);
	list = () => this.#list.all();

	#create = db.query<void, [string]>(sql`
		insert into tags values (?)
		on conflict do nothing
	`);
	create = (tag: string) => this.#create.run(tag);

	#article = db.query<Tag, [string]>(sql`
    select tag_slug as slug from articles_tags where article_slug = ?
  `);
	article = (slug: string) => this.#article.all(slug);

	#note = db.query<Tag, [string]>(sql`
    select tag_slug as slug from notes_tags where note_slug = ?
  `);
	note = (slug: string) => this.#note.all(slug);
}

export type Entry = {
	slug: string;
	title: string | null;
	intro: string;
	date: string;
	kind: "article" | "note";
	tags: Array<Tag>;
};

class All {
	#list = db.query<Entry, []>(sql`
    select slug, title, intro, date, 'article' as kind from articles
    where draft = 0
    union
    select slug, null as title, content as intro, date, 'note' as kind from notes
    where draft = 0
    order by date desc
  `);
	list = () => this.#list.all();
}

export let model = {
	articles: new Articles(),
	notes: new Notes(),
	all: new All(),
	tags: new Tags(),
};
