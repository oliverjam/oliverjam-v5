import { Res, errors, HttpError } from "./http.ts";
import { Root, Page } from "./root.tsx";
import { model, type Article as ArticleType, parse_article } from "./db.ts";
import { Entry, Article, Filters } from "./ui.tsx";

export async function App(req: Request): Promise<Response> {
	try {
		let url = new URL(req.url);
		let time = new Date().toLocaleTimeString("en-GB");
		console.log(`${time} ${req.method} ${url}`);

		let body = await router(req, url);
		return body instanceof Response ? body : Res.html(body);
	} catch (error) {
		let e = error instanceof HttpError ? error : errors.server();
		if (e.status !== 404) console.error(error);
		return Res.html(
			<Root title={e.message}>
				<header class="min-h-screen grid place-content-center place-items-center font-mono">
					<p class="text-9xl font-black bg-gradient-to-t from-teal-700 via-green-400 bg-clip-text text-transparent">
						{e.status}
					</p>
					<h1>{e.message}</h1>
				</header>
			</Root>
		);
	}
}

async function router(req: Request, url: URL): Promise<string | Response> {
	let p = url.pathname;
	if (req.method === "GET") {
		if (p.startsWith("/public")) {
			let file = Bun.file("." + p);
			if (!file.exists) throw errors.missing();
			return new Response(file);
		}

		if (p === "/") {
			let tags = url.searchParams.getAll("tags");
			let type = url.searchParams.get("type") || null;
			invariant(type === "article" || type === "note" || type === null);

			let posts = model.posts.list(type, tags).map((e) => <Entry {...e} />);
			if (boosted(req)) return posts.join("");
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
		}

		if (p.startsWith("/notes/")) {
			let slug = p.slice(7);
			let e = model.posts.read(slug);
			if (!e) throw errors.missing();
			return (
				<Root title={e.content.slice(0, 60) + "⋯"}>
					<Page>
						<Entry {...e} />
					</Page>
				</Root>
			);
		}

		if (p.startsWith("/articles/")) {
			let slug = p.slice(10);
			let e = model.posts.read<ArticleType>(slug);
			if (!e) throw errors.missing();
			let tags = model.tags.post(slug);
			return (
				<Root title={e.title} class="max-w-3xl py-12 px-6 md:p-12">
					<Page>
						<Article {...e} tags={tags} />
					</Page>
				</Root>
			);
		}

		if (p === "/tags/") {
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
		}

		if (p.startsWith("/tags/")) {
			let tag = p.slice(6);
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
	}

	if (req.method === "POST") {
		let body = await req.formData();
		if (p === "/articles/") {
			try {
				let [post, tags] = parse_article(body);
				model.posts.create(post, tags);
				return Res.redirect(`/articles/${post.slug}`);
			} catch (e) {
				throw errors.invalid(e instanceof Error ? e.message : String(e));
			}
		}
	}

	throw errors.missing();
}

export function invariant(cond: unknown, msg?: string): asserts cond {
	if (!cond) throw new Error(msg);
}

function boosted(req: Request) {
	return req.headers.get("sec-fetch-dest") === "empty";
}
