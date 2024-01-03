import { Database } from "bun:sqlite";

let db = new Database("oliverjam.db");

db.run(/*sql*/ `
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
db.run(/*sql*/ `
  create table if not exists notes (
    slug text primary key,
    date text not null,
    content text not null,
    raw text not null,
    draft integer check (draft in (0, 1)),
    created text default current_timestamp
  ) strict;
`);
db.run(
  /*sql*`
  create table if not exists tags (slug text primary key) strict
`);
db.run(/*sql*/ `
  create table if not exists posts_tags (
    post_slug text references posts(slug),
    tag_slug text references tags(slug),
    primary key (post_slug, tag_slug)
  )
`,
);

type Article = {
  slug: string;
  title: string;
  time: number;
  date: string;
  intro: string;
  content: string;
  draft: 0 | 1;
};

class Articles {
  #list = db.query<Article, []>(/*sql*/ `
    select slug, title, intro, time, date from articles
    where draft = 0
    order by date desc
  `);
  list = () => this.#list.all();
  #read = db.query<Article, [string]>(/*sql*/ `
    select slug, title, intro, time, date, content from articles
    where slug = ?
    limit 1
  `);
  read = (slug: string) => this.#read.get(slug);
}

type Note = {
  slug: string;
  date: string;
  content: string;
  draft: 0 | 1;
};

class Notes {
  #list = db.query<Note, []>(/*sql*/ `
    select slug, date, content from notes
    where draft = 0
    order by date desc
  `);
  list = () => this.#list.all();
  #read = db.query<Note, [string]>(/*sql*/ `
    select slug, date, content from notes
    where slug = ?
    limit 1
  `);
  read = (slug: string) => this.#read.get(slug);
}

type Post = {
  slug: string;
  title: string | null;
  intro: string;
  date: string;
  kind: "article" | "note";
};

class All {
  #list = db.query<Post, []>(/*sql*/ `
    select slug, title, intro, date, 'article' as kind, draft  from articles
      where draft = 0
    union
    select slug, null as title, content as intro, date, 'note' as kind, draft from notes
      where draft = 0
    order by date desc
  `);
  list = () => this.#list.all();
}

export let model = {
  articles: new Articles(),
  notes: new Notes(),
  all: new All(),
};
