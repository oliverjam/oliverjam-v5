import { Res } from "../http.ts";
import { model } from "../database/db.ts";
import { ReadableDate, Row } from "../ui.tsx";
import { Root } from "./root.tsx";
import { Icon } from "../icon.tsx";
import { invariant } from "../app.tsx";

export function Article(slug: string) {
	let entry = model.articles.read(slug);
	if (entry === null) return Res.missing();

	let { title, date, time, intro, content } = entry;
	let tags = model.articles.tags.read(slug);
	return (
		<Root title={title} class="max-w-3xl py-12 px-6 md:p-12">
			<header class="space-y-3 text-sm">
				<Row class="gap-4 font-mono">
					<Row>
						<Icon name="document-text" />
						<span class="p-kind sr-only">Article</span>
						<ReadableDate class="dt-published">{date}</ReadableDate>
					</Row>
					<Row>
						<Icon name="clock" />
						<span>{(time / 60).toFixed(1)} minute read</span>
					</Row>
				</Row>
				<h1 class="p-name leading-none text-3xl md:text-4xl font-display text-balance">
					{title}
				</h1>
				<Row class="font-mono">
					{tags.map((t) => (
						<a class="p-category" href={`/tags/${t.slug}`}>
							#{t.slug}
						</a>
					))}
				</Row>
			</header>
			<div class="mt-6 leading-relaxed font-serif Content">
				<p class="text-lg md:text-xl font-display">{intro}</p>
				{content}
			</div>
		</Root>
	);
}

export async function CreateArticle(body: FormData, $slug: string) {
	let $title = body.get("title");
	let $intro = body.get("intro");
	let $date = body.get("date");
	let draft = body.has("draft");
	let time = body.get("time");
	let tags = body.getAll("tag");
	let $content = body.get("content");
	try {
		invariant(typeof $title === "string", `Missing title`);
		invariant(typeof $intro === "string", `Missing intro`);
		invariant(typeof $date === "string", `Missing date`);
		invariant(typeof time === "string", `Missing time`);
		invariant(typeof $content === "string", `Missing content`);
		model.articles.create(
			{
				$slug,
				$title,
				$intro,
				$date,
				$draft: draft ? 1 : 0,
				$time: Number(time),
				$content,
			},
			tags
		);
		return Res.redirect(`/articles/${$slug}`);
	} catch (e) {
		console.error(e);
		let msg = e instanceof Error ? e.message : String(e);
		return Res.bad(msg);
	}
}
