import { model } from "../db.ts";
import { Root } from "../root.tsx";

export function Articles() {
	return (
		<Root title="Articles">
			<h1>Articles</h1>
			<ul>
				{model.articles.list().map((a) => (
					<li>
						<p class="p-kind">Article</p>
						<p class="dt-published">{a.date}</p>
						<a class="u-url" href={"/article/" + a.slug}>
							{a.title}
						</a>
						<p class="e-summary">{a.intro}</p>
					</li>
				))}
			</ul>
		</Root>
	);
}
