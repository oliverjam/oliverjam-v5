import { router } from "@oliverjam/hypa";
import { Root, Page } from "./root.tsx";
import { model, type Article as ArticleType, parse_article } from "./db.ts";
import { Entry, Article, Filters, HttpStatus } from "./ui.tsx";

export let app = router();

app.route("*").get((c) => {
	let time = new Date().toLocaleTimeString("en-GB");
	console.log(`${time} ${c.req.method} ${c.url}`);
});

app.route("/public/*").get(async (c) => {
	let file = Bun.file("." + c.url.pathname);
	if (await file.exists()) {
		return new Response(file, {
			headers: { "cache-control": `max-age=${60 * 60 * 24 * 365}, immutable` },
		});
	}
});

app.route("/").get((c) => {
	let tags = c.url.searchParams.getAll("tags");
	let type = c.url.searchParams.get("type") || null;
	invariant(type === "article" || type === "note" || type === null);

	let posts = model.posts.list(type, tags).map((e) => <Entry {...e} />);
	if (boosted(c.req)) return posts.join("");
	return (
		<Root title="Home">
			<div class="grid grid-cols-[20rem_1fr]">
				<aside class="p-8">
					<Filters type={type} tags={tags} all_tags={model.tags.list()} />
				</aside>
				<section id="posts" class="space-y-4 max-w-3xl p-8">
					{posts}
				</section>
			</div>
		</Root>
	);
});

app.route("/notes/:slug").get((c) => {
	if (c.params.slug) {
		let e = model.posts.read(c.params.slug);
		if (e) {
			return (
				<Root title={e.content.slice(0, 60) + "⋯"}>
					<Page>
						<Entry {...e} />
					</Page>
				</Root>
			);
		}
	}
});

app.route("/articles/:slug").get((c) => {
	let slug = c.params.slug;
	if (slug) {
		let e = model.posts.read<ArticleType>(slug);
		if (e) {
			let tags = model.tags.post(slug);
			return (
				<Root title={e.title} class="max-w-3xl py-12 px-6 md:p-12">
					<Page>
						<Article {...e} tags={tags} />
					</Page>
				</Root>
			);
		}
	}
});

app.route("/articles").post(async (c) => {
	try {
		let body = await c.req.formData();
		let [post, tags] = parse_article(body);
		model.posts.create(post, tags);
		return c.redirect(`/articles/${post.slug}`);
	} catch (e) {
		if (e instanceof Error) {
			return <HttpStatus status={400}>{e.message}</HttpStatus>;
		}
	}
});

app.route("/tags").get(() => {
	let tags = model.tags.list();
	return (
		<Root title="Tags">
			<Page>
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
			</Page>
		</Root>
	);
});

app.route("/tags/:slug").get((c) => {
	let tag = c.params.tag;
	if (tag) {
		let posts = model.tags.posts(tag);
		return (
			<Root title={"#" + tag}>
				<Page>
					<h1>#{tag}</h1>
					{posts.map((p) => (
						<Entry {...p} />
					))}
				</Page>
			</Root>
		);
	}
});

app.route("*").get((c) =>
	c.status(404).html(
		<Root title="Not found">
			<HttpStatus status={404}>Not found</HttpStatus>
		</Root>
	)
);

export function invariant(cond: unknown, msg?: string): asserts cond {
	if (!cond) throw new Error(msg);
}

function boosted(req: Request) {
	return req.headers.get("sec-fetch-dest") === "empty";
}
