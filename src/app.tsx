import { Article } from "./pages/article.tsx";
import { Home } from "./pages/home.tsx";
import { Articles } from "./pages/articles.tsx";
import { Notes } from "./pages/notes.tsx";
import { Missing } from "./pages/missing.tsx";

export async function App(req: Request) {
	try {
		let url = new URL(req.url);
		let { pathname } = url;
		if (pathname.startsWith("/public")) {
			let file = Bun.file("." + pathname);
			return new Response(file);
		}
		let body = await page({ req, url });
		return html(body);
	} catch (error) {
		console.error(error);
		return html(Missing());
	}
}

export function page({ req, url }: { req: Request; url: URL }) {
	let p = url.pathname;
	if (p === "/") return Home();
	if (p === "/notes") return Notes();
	if (p === "/articles") return Articles();
	if (p.startsWith("/articles")) return Article(p.slice(10));
	return Missing();
}

function html(body: string) {
	return new Response("<!doctype html>" + body, {
		headers: { "content-type": "text/html; charset=utf8" },
	});
}

let cn = (...args: Array<string | undefined | false>): string =>
	args.reduce<string>((c, x) => (!!x ? c + " " + x : c), "");

class MissingError extends Error {}
export let missing = () => new MissingError();
