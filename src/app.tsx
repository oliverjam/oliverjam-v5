import { Res } from "./http.ts";
import { Public } from "./pages/public.ts";
import { Home } from "./pages/home.tsx";
import { Notes } from "./pages/notes.tsx";
import { Note } from "./pages/note.tsx";
import { Articles } from "./pages/articles.tsx";
import { Article } from "./pages/article.tsx";
import { Missing } from "./pages/missing.tsx";

export async function App(req: Request): Promise<Response> {
	try {
		let url = new URL(req.url);
		let body = await router(req, url);
		return body instanceof Response ? body : Res.html(body);
	} catch (error) {
		console.error(error);
		return Res.html(Missing());
	}
}

async function router(req: Request, url: URL): Promise<string | Response> {
	let p = url.pathname;
	if (p.startsWith("/public")) return Public(p);
	if (p === "/") return Home();
	if (p === "/notes/") return Notes();
	if (p === "/articles/") return Articles();
	if (p.startsWith("/notes/")) return Note(p.slice(6));
	if (p.startsWith("/articles/")) return Article(p.slice(10));
	return Missing();
}

export function invariant(cond: unknown, msg?: string): asserts cond {
	if (!cond) throw new Error(msg);
}

