export let schema = /*sql*/ `
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

export type Note = {
  type: "note";
  slug: string;
  created: string;
  draft: 0 | 1;
  content: string;
};

export type Post = Article | Note;

export type PostType = Post["type"];

export type In<T> = Omit<T, "created"> & { created: string | null };

export type Tag = { slug: string };

export type Tags = Array<Tag>;

export type PostTag = { tag: string; count: number };

export type PostTags = Array<PostTag>;

export type N<T> = T | null;
