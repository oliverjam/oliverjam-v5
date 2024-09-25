import { router } from "@oliverjam/hypa";
import { sql, transaction } from "./db.ts";
import { Root, Entry, ArticleEntry, Filters, HttpStatus } from "./ui.tsx";
import type { Article, In, Note, Post, PostTags, Tags } from "./types.ts";
import "./app.css"; // just for hot-reloading

export let app = router();

app.route("*").get((c) => console.log(`${time()} ${c.req.method} ${c.url}`));

let headers =
	Bun.env.NODE_ENV === "production"
		? { "cache-control": `max-age=${60 * 60 * 24 * 365}, immutable` }
		: undefined;

app.route("/public/*").get(async (c) => {
	let file = Bun.file("." + c.url.pathname);
	if (await file.exists()) return new Response(file, { headers });
});

app.route("/").get((c) => {
	let filters = c.url.searchParams.getAll("tags");
	let type = c.url.searchParams.get("type") || null;
	check(type === "article" || type === "note" || type === null);

	let tags = filters.map((f) => `'${f}'`);
	let query = tags.length
		? sql`
			select * from posts join posts_tags on slug = post
			where draft = 0 and type = coalesce(?, type) and tag in (${tags.join(",")})
			group by slug having count(*) = ${tags.length}
			order by created desc
		`
		: sql`
			select * from posts where draft = 0 and type = coalesce(?, type)
			order by created desc
		`;

	let posts = query.all(type) as Array<Post>;
	let entries = posts.map((p) => <Entry {...p} />).join("");
	if (boosted(c.req)) return entries;
	let q = sql`
		select tag, count(tag) as count from posts_tags group by tag
		order by count desc
	`;
	let all_tags = q.all() as PostTags;
	return (
		<Root title="Home">
			<section class="border-2 p-6">
				<Filters type={type} tags={filters} all_tags={all_tags} />
			</section>
			<section id="posts" class="space-y-8 mt-1 border-2 p-6">
				{entries.length > 0 ? entries : <p>No posts found</p>}
			</section>
		</Root>
	);
});

app.route("/notes/:slug").get((c) => {
	let e = sql`select * from posts where slug = ?`.get(c.params.slug!) as Note;
	if (e) {
		return (
			<Root title={e.content.slice(0, 60) + "⋯"}>
				<Entry {...e} />
			</Root>
		);
	}
});

app.route("/articles/:slug").get((c) => {
	let slug = c.params.slug!;
	let e = sql`select * from posts where slug = ?`.get(slug) as Article;
	if (e) {
		let q = sql`select tag as slug from posts_tags where post = ?`;
		let tags = q.all(slug) as Tags;
		return (
			<Root title={e.title}>
				<ArticleEntry {...e} tags={tags} />
			</Root>
		);
	}
});

app.route("/articles").post(async (c) => {
	try {
		let data = new SafeFormData(await c.req.formData());
		let slug = data.string("slug");
		let title = data.string("title");
		let intro = data.string("intro");
		const draft = data.binary("draft");
		let content = data.string("content");
		let time = data.number("time");
		let tags = data.strings("tags");
		let created = data.nullable("created");
		let article = {
			type: "article",
			slug,
			title,
			intro,
			draft,
			time,
			content,
			created,
		} satisfies In<Article>;
		transaction(() => {
			sql`
				insert into posts (slug, type, draft, content, title, time, intro, created)
				values ($slug, $type, $draft, $content, $title, $time, $intro, coalesce($created, current_timestamp))
			`.run(article);
			for (let t of tags) {
				sql`insert into tags values (?)`.run(t);
				sql`insert into posts_tags (tag, post) values (?, ?)`.run(t, slug);
			}
		});
		return c.redirect(`/articles/${slug}`);
	} catch (e) {
		if (e instanceof Error) {
			return <HttpStatus status={400}>{e.message}</HttpStatus>;
		}
	}
});

app.route("/notes").post(async (c) => {
	try {
		let data = new SafeFormData(await c.req.formData());
		let slug = data.string("slug");
		const draft = data.binary("draft");
		let content = data.string("content");
		let tags = data.strings("tags");
		let created = data.nullable("created");
		let note = {
			type: "note",
			slug,
			draft,
			content,
			created,
		} satisfies In<Note>;
		transaction(() => {
			sql`
				insert into posts (slug, type, draft, content)
				values ($slug, $type, $draft, $content)
			`.run(note);
			for (let t of tags) {
				sql`insert into tags values (?)`.run(t);
				sql`insert into posts_tags (tag, post) values (?, ?)`.run(t, slug);
			}
		});
		return c.redirect(`/notes/${slug}`);
	} catch (e) {
		if (e instanceof Error) {
			return <HttpStatus status={400}>{e.message}</HttpStatus>;
		}
	}
});

app.route("/tags").get(() => {
	let tags = sql`
		select tag, count(tag) as count from posts_tags
		group by tag order by count desc
	`.all() as Array<{ tag: string; count: number }>;
	return (
		<Root title="Tags">
			<h1>Tags</h1>
			<ul class="list-none p-0 space-y-4">
				{tags.map((t) => {
					return (
						<li>
							<a href={"/tags/" + t.tag.replace(/\W/g, "-")}>#{t.tag}</a>
							<p>{t.count} posts</p>
						</li>
					);
				})}
			</ul>
		</Root>
	);
});

app.route("/tags/:slug").get((c) => {
	let tags = sql`
		select posts.* from posts_tags join posts on post = slug where tag = ?
	`.all(c.params.slug!) as Array<Post>;
	return (
		<Root title={"#" + c.params.tag!}>
			<h1>#{c.params.tag!}</h1>
			{tags.map((p) => (
				<Entry {...p} />
			))}
		</Root>
	);
});

app.route("*").get((c) =>
	c.status(404).html(
		<Root title="Not found">
			<HttpStatus status={404}>Not found</HttpStatus>
		</Root>
	)
);

export function check(cond: unknown, msg?: string): asserts cond {
	if (!cond) throw new Error(msg);
}

function boosted(req: Request) {
	return req.headers.get("sec-fetch-dest") === "empty";
}

function time() {
	return new Date().toLocaleTimeString("en-GB");
}

class SafeFormData {
	data: FormData;
	constructor(data: FormData) {
		this.data = data;
	}
	string(key: string) {
		let value = this.data.get(key);
		check(typeof value === "string", `Missing ${key}`);
		return value;
	}
	strings(key: string) {
		return this.data.getAll(key).map(String);
	}
	nullable(key: string) {
		let value = this.data.get(key);
		check(typeof value === "string" || value === null, `Missing ${key}`);
		return value;
	}
	number(key: string) {
		let value = this.data.get(key);
		check(typeof value === "string", `Missing ${key}`);
		let num = Number(value);
		if (Number.isNaN(num)) throw new Error(`${key} '${value}' isn't a number`);
		return num;
	}
	binary(key: string) {
		let value = this.data.get(key);
		return value ? 1 : 0;
	}
}
