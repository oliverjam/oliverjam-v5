import { model } from "../database/db.ts";
import { Root } from "./root.tsx";

export function Tags() {
	let tags = model.articles.tags.list();
	return (
		<Root title="Tags" class="space-y-8 p-8 max-w-2xl">
			<h1>Tags</h1>
			<ul class="list-none p-0 space-y-4">
				{tags.map((t) => {
					return (
						<li>
							<a href={"/tags/" + t.slug.replace(/\W/g, "-")}>#{t.slug}</a>
							<p>{t.count} articles</p>
						</li>
					);
				})}
			</ul>
		</Root>
	);
}
