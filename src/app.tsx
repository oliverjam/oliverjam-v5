import { router } from "@oliverjam/hypa";
import * as model from "./db.ts";
import { Root, Entry, ArticleEntry, Filters, HttpStatus } from "./ui.tsx";
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
	let tags = c.url.searchParams.getAll("tags");
	let type = c.url.searchParams.get("type") || null;
	check(type === "article" || type === "note" || type === null);

	let posts = "";
	for (let e of model.posts.list(type, tags)) posts += <Entry {...e} />;
	if (boosted(c.req)) return posts;
	return (
		<Root title="Home">
			<section class="border-2 p-6">
				<Filters type={type} tags={tags} all_tags={model.tags.list()} />
			</section>
			<section id="posts" class="space-y-8 mt-1 border-2 p-6">
				{posts.length > 0 ? posts : <p>No posts found</p>}
			</section>
		</Root>
	);
});

app.route("/notes/:slug").get((c) => {
	let e = model.posts.read<"note">(c.params.slug!);
	if (e) {
		return (
			<Root title={e.content.slice(0, 60) + "⋯"}>
				<Entry {...e} />
			</Root>
		);
	}
});

app.route("/articles/:slug").get((c) => {
	let e = model.posts.read<"article">(c.params.slug!);
	if (e) {
		let tags = model.tags.post(c.params.slug!);
		return (
			<Root title={e.title}>
				<ArticleEntry {...e} tags={tags} />
			</Root>
		);
	}
});

app.route("/articles").post(async (c) => {
	try {
		let body = await c.req.formData();
		let keys = ["slug", "title", "intro", "draft", "time", "content"] as const;
		let post = formdata(body, keys);
		let tag_names = body.getAll("tags").map(String);
		let created = body.get("created");
		check(typeof created === "string" || created === null, "Missing created");
		model.posts.create(
			{
				...post,
				created,
				type: "article",
				draft: post.draft ? 1 : 0,
				time: Number(post.time),
			},
			tag_names
		);
		return c.redirect(`/articles/${post.slug}`);
	} catch (e) {
		if (e instanceof Error) {
			return <HttpStatus status={400}>{e.message}</HttpStatus>;
		}
	}
});

app.route("/tags").get(() => (
	<Root title="Tags">
		<h1>Tags</h1>
		<ul class="list-none p-0 space-y-4">
			{model.tags.list().map((t) => {
				return (
					<li>
						<a href={"/tags/" + t.tag.replace(/\W/g, "-")}>#{t.tag}</a>
						<p>{t.count} posts</p>
					</li>
				);
			})}
		</ul>
	</Root>
));

app.route("/tags/:slug").get((c) => (
	<Root title={"#" + c.params.tag!}>
		<h1>#{c.params.tag!}</h1>
		{model.tags.posts(c.params.tag!).map((p) => (
			<Entry {...p} />
		))}
	</Root>
));

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

function formdata<K extends string>(data: FormData, keys: ReadonlyArray<K>) {
	let obj = {} as Record<K, string>;
	for (let key of keys) {
		let value = data.get(key);
		check(typeof value === "string", `Missing ${key}`);
		obj[key] = value;
	}
	return obj;
}
