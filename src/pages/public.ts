import { Res } from "../http.ts";

export function Public(path: string) {
	let file = Bun.file("." + path);
	if (!file.exists) return Res.missing("");
	return new Response(file);
}
