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

export type Tag = { slug: string };

export type Tags = Array<Tag>;
