import { model } from "../db.ts";
import { Root } from "./root.tsx";

export function Articles() {
	return (
		<Root title="Articles">
			<h1>Articles</h1>
			<ul>
				{model.posts.list("article").map((e) => {
					let tags = model.tags.post(e.slug);
					return (
						<li>
							<p class="p-kind">Article</p>
							<p class="dt-published">{e.created}</p>
							<a class="u-url" href={e.slug}>
								{e.title}
							</a>
							<p class="e-summary">{e.intro}</p>
							<div class="flex gap-1">
								{tags.map((t) => (
									<a class="p-category" href={`/tags/${t.slug}`}>
										#{t.slug}
									</a>
								))}
							</div>
						</li>
					);
				})}
			</ul>
		</Root>
	);
}
