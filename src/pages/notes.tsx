import { model } from "../db.ts";
import { Root } from "./root.tsx";

export function Notes() {
	return (
		<Root title="Notes">
			<h1>Notes</h1>
			<ul>
				{model.posts.list("note").map((e) => {
					let tags = model.tags.post(e.slug);
					return (
						<li>
							<p class="p-kind">Note</p>
							<a class="dt-published u-uid u-url" href={e.slug}>
								{e.created}
							</a>
							<div class="e-content">{e.content}</div>
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
