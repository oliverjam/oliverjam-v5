import { Res } from "../http.ts";
import { model } from "../db.ts";
import { Root } from "./root.tsx";

export function Note(slug: string) {
	let entry = model.posts.read(slug);
	if (entry === null) return Res.missing();
	let { created, content } = entry;
	let tags = model.tags.post(slug);
	return (
		<Root title={content.slice(0, 60) + "⋯"}>
			<header>
				<p class="p-kind">Article</p>
				<p class="dt-published">{new Date(created).toLocaleDateString()}</p>
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
