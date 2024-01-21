import { Missing } from "./pages/missing.tsx";

export class Res extends Response {
	static html(body: string, init?: ResponseInit | number) {
		if (typeof init === "number") init = { status: init };
		let r = new Response("<!doctype html>" + body, init);
		r.headers.set("content-type", "text/html; charset=utf-8");
		return r;
	}
	static bad(body: string, headers: HeadersInit = {}) {
		return new Response(body, { status: 400, headers });
	}
	static missing(body = Missing()) {
		return Res.html(body, 404);
	}
}
