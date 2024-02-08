import { model } from "../db.ts";
import { Root } from "./root.tsx";

export function Tags() {
	let tags = model.tags.list();
	return (
		<Root title="Tags" class="space-y-8 p-8 max-w-2xl">
			<h1>Tags</h1>
			<ul class="list-none p-0 space-y-4">
				{tags.map((t) => {
					return (
						<li>
							<a href={"/tags/" + t.tag.replace(/\W/g, "-")}>#{t.tag}</a>
							<p>{t.count} posts</p>
						</li>
					);
				})}
			</ul>
		</Root>
	);
}
