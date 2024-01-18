import { missing } from "../app.tsx";
import { model } from "../db.ts";
import { ReadableDate, Row } from "../ui.tsx";
import { Root } from "./root.tsx";
import { Icon } from "../icon.tsx";

export function Article(slug: string) {
	let entry = model.articles.read(slug);
	if (entry === null) throw missing();
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
