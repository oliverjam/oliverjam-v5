import { Res } from "../http.ts";
import { model } from "../database/db.ts";
import { Root } from "./root.tsx";

export function Note(slug: string) {
	let entry = model.notes.read(slug);
	if (entry === null) return Res.missing();
	let { date, content } = entry;
	let tags = model.tags.article(slug);
	return (
		<Root title={content.slice(0, 60) + "⋯"}>
			<header>
				<p class="p-kind">Article</p>
				<p class="dt-published">{new Date(date).toLocaleDateString()}</p>
				<div class="flex gap-1">
					{tags.map((t) => (
						<a class="p-category" href={`/tags/${t.slug}`}>
							#{t.slug}
						</a>
					))}
				</div>
			</header>
			{content}
		</Root>
	);
}
