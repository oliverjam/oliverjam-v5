import { missing } from "../app.tsx";
import { model } from "../db.ts";
import { Root } from "../root.tsx";

export function Article(slug: string) {
	let entry = model.articles.read(slug);
	if (entry === null) throw missing();
	let { title, date, time, intro, content: body } = entry;
	let tags = model.tags.article(slug);
	return (
		<Root title={title}>
			<header>
				<p class="p-kind">Article</p>
				<p class="dt-published">{new Date(date).toLocaleDateString()}</p>
				<p>{(time / 60).toFixed(1)} minute read</p>
				<h1 class="p-name">{title}</h1>
				<div class="flex gap-1">
					{tags.map((t) => (
						<a class="p-category" href={`/tags/${t.slug}`}>
							#{t.slug}
						</a>
					))}
				</div>
			</header>
			<p>{intro}</p>
			{body}
		</Root>
	);
}
