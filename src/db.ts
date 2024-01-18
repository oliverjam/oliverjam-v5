import { Database } from "bun:sqlite";
import { markdown } from "./markdown.tsx";
import { invariant } from "./app.tsx";

let db = new Database("oliverjam.db");

let sql = String.raw;

db.run(sql`
  create table if not exists articles (
    slug text primary key,
    title text not null,
    time real not null,
    date text not null,
    intro text not null,
    content text not null,
    raw text not null,
    draft integer check (draft in (0, 1)),
    created text default current_timestamp
  ) strict;
`);
db.run(sql`
  create table if not exists notes (
    slug text primary key,
    date text not null,
    content text not null,
    raw text not null,
    draft integer check (draft in (0, 1)),
    created text default current_timestamp
  ) strict;
`);
db.run(sql`
  create table if not exists tags (slug text primary key) strict
`);
db.run(sql`
  create table if not exists articles_tags (
    article_slug text references articles(slug),
    tag_slug text references tags(slug),
    primary key (article_slug, tag_slug)
  ) strict
`);
db.run(sql`
  create table if not exists notes_tags (
    note_slug text references notes(slug),
    tag_slug text references tags(slug),
    primary key (note_slug, tag_slug)
  ) strict
`);

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
	$raw: string;
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
    insert into articles (slug, title, time, date, intro, content, raw, draft)
    values ($slug, $title, $time, $date, $intro, $content, $raw, $draft)
  `);
	create = async (slug: string, md: string) => {
		let { data, content, raw } = await markdown(md);
		let time = 100.1;
		let { title, draft, intro, date } = data;
		invariant(typeof title === "string", `${slug} missing title`);
		invariant(typeof intro === "string", `${slug} missing intro`);
		invariant(typeof date === "string", `${slug} missing date`);
		this.#create.run({
			$slug: slug,
			$title: title,
			$intro: intro,
			$draft: draft === true ? 1 : 0,
			$time: time,
			$date: date,
			$content: content,
			$raw: raw,
		});
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

	#article = db.query<Tag, [string]>(sql`
    select tag_slug as slug from articles_tags where article_slug = ?
  `);
	article = (slug: string) => this.#article.all(slug);

	#note = db.query<Tag, [string]>(sql`
    select tag_slug as slug from notes_tags where note_slug = ?
  `);
	note = (slug: string) => this.#note.all(slug);
}

type Entry = {
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
