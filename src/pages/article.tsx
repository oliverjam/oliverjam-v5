import { invariant } from "../app.tsx";
import { model } from "../db.ts";
import { Res } from "../http.ts";

export async function CreateArticle(body: FormData, slug: string) {
	let title = body.get("title");
	let intro = body.get("intro");
	let draft = body.has("draft");
	let time = body.get("time");
	let tags = body.getAll("tag");
	let content = body.get("content");
	try {
		invariant(typeof title === "string", `Missing title`);
		invariant(typeof intro === "string", `Missing intro`);
		invariant(typeof time === "string", `Missing time`);
		invariant(typeof content === "string", `Missing content`);
		model.posts.create(
			{
				slug,
				type: "article",
				title,
				intro,
				draft: draft ? 1 : 0,
				time: Number(time),
				content,
			},
			tags.map(String)
		);
		return Res.redirect(`/articles/${slug}`);
	} catch (e) {
		console.error(e);
		let msg = e instanceof Error ? e.message : String(e);
		return Res.bad(msg);
	}
}
