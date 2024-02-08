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
}

export class HttpError extends Error {
	status = 0;
	message = "";
}

export class MissingError extends HttpError {
	status = 404;
	message = "Page not found";
}

export class ServerError extends HttpError {
	status = 500;
	message = "Something went wrong";
}

export let errors = {
	missing() {
		return new MissingError();
	},
	server() {
		return new ServerError();
	},
};
