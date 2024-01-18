import { Res } from "../http.ts";
import { model } from "../db.ts";
import { ReadableDate, Row } from "../ui.tsx";
import { Root } from "./root.tsx";
import { Icon } from "../icon.tsx";

export function Article(slug: string) {
	let entry = model.articles.read(slug);
	if (entry === null) return Res.missing();

	let { title, date, time, intro, content } = entry;
	let tags = model.tags.article(slug);
	return (
		<Root title={title} class="max-w-2xl p-8 space-y-4">
			<header class="space-y-3 text-sm">
				<Row class="gap-4 font-mono">
					<Row>
						<Icon name="document-text" />
						<span class="p-kind sr-only">Article</span>
						<ReadableDate class="dt-published">{date}</ReadableDate>
					</Row>
					<Row>
						<Icon name="clock" />
						<p>{(time / 60).toFixed(1)} minute read</p>
					</Row>
				</Row>
				<h1 class="p-name leading-none text-4xl font-serif text-balance">
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
			<div class="space-y-4 leading-relaxed font-serif">
				<p class="text-xl font-display">{intro}</p>
				{content}
			</div>
		</Root>
	);
}

export async function CreateArticle(body: FormData, slug: string) {
	let md = body.get("content");
	if (typeof md !== "string") return Res.bad("Invalid content");
	try {
		model.articles.create(slug, md);
		return Res.redirect(`/articles/${slug}`);
	} catch (e) {
		console.error(e);
		let msg = e instanceof Error ? e.message : String(e);
		return Res.bad(msg);
	}
}
