import { Home } from "./pages/home.tsx";
import { Notes } from "./pages/notes.tsx";
import { Note } from "./pages/note.tsx";
import { Articles } from "./pages/articles.tsx";
import { Article } from "./pages/article.tsx";
import { Missing } from "./pages/missing.tsx";

export async function App(req: Request) {
	try {
		let url = new URL(req.url);
		let body = await router(req, url);
		return send(body);
	} catch (error) {
		console.error(error);
		return send(Missing());
	}
}

function router(req: Request, url: URL) {
	let p = url.pathname;
	if (p.startsWith("/public")) {
		let file = Bun.file("." + p);
		if (!file.exists) return new Response(null, { status: 404 });
		return new Response(file);
	}
	if (p === "/") return Home();
	if (p === "/notes/") return Notes();
	if (p === "/articles/") return Articles();
	if (p.startsWith("/notes/")) return Note(p.slice(6));
	if (p.startsWith("/articles/")) return Article(p.slice(10));
	return Missing();
}

function send(body: string | Response) {
	if (body instanceof Response) return body;
	return new Response("<!doctype html>" + body, {
		headers: { "content-type": "text/html; charset=utf8" },
	});
}

class MissingError extends Error {}
export let missing = () => new MissingError();

function invariant(condition: unknown, message?: string): asserts condition {
	if (!condition) throw new Error(message);
}
