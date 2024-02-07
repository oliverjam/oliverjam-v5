import { Res } from "./http.ts";
import { Public } from "./pages/public.ts";
import { Home } from "./pages/home.tsx";
import { Notes } from "./pages/notes.tsx";
import { Note } from "./pages/note.tsx";
import { Articles } from "./pages/articles.tsx";
import { CreateArticle } from "./pages/article.tsx";
import { Tags } from "./pages/tags.tsx";
import { Tag } from "./pages/tag.tsx";
import { Missing } from "./pages/missing.tsx";
import { Root } from "./pages/root.tsx";
import { model } from "./database/db.ts";
import { Entry, Article } from "./ui.tsx";

export async function App(req: Request): Promise<Response> {
	try {
		let url = new URL(req.url);
		let body = await router(req, url);
		return body instanceof Response ? body : Res.html(body);
	} catch (error) {
		console.error(error);
		return new Response("Server error", { status: 500 });
		// return Res.html(Missing());
	}
}

async function router(req: Request, url: URL): Promise<string | Response> {
	let p = url.pathname;

	if (req.method === "GET") {
		if (p.startsWith("/public")) return Public(p);

		if (p === "/") {
			return (
				<Root title="Home" class="space-y-8 p-8 max-w-2xl">
					<h1>Home</h1>
					{model.posts.list().map((e) => (
						<Entry {...e} />
					))}
				</Root>
			);
		}

		// if (p === "/notes/") return Notes();
		if (p.startsWith("/notes/")) {
			let slug = p.slice(7);
			let e = model.notes.read(slug);
			if (!e) return Res.missing();
			return (
				<Root
					title={e.note!.content.slice(0, 60) + "⋯"}
					class="max-w-3xl py-12 px-6 md:p-12"
				>
					<Entry {...e} article={null} />
				</Root>
			);
		}

		// if (p === "/articles/") return Articles();
		if (p.startsWith("/articles/")) {
			let slug = p.slice(10);
			let e = model.articles.read(slug);
			if (!e) return Res.missing();
			return (
				<Root title={e.article!.title} class="max-w-3xl py-12 px-6 md:p-12">
					<Article {...e} />
				</Root>
			);
		}

		// if (p === "/tags/") return Tags();
		// if (p.startsWith("/tags/")) return Tag(p.slice(6));
	}
	if (req.method === "POST") {
		let body = await req.formData();
		if (p.startsWith("/articles/")) return CreateArticle(body, p.slice(10));
	}

	return (
		<Root title="Page not found">
			<div class="min-h-screen grid place-content-center">
				<h1 class="text-9xl font-black font-mono bg-gradient-to-t from-teal-700 via-green-400 bg-clip-text text-transparent">
					404
				</h1>
			</div>
		</Root>
	);
}

export function invariant(cond: unknown, msg?: string): asserts cond {
	if (!cond) throw new Error(msg);
}
