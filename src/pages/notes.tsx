import { model } from "../db.ts";
import { Root } from "../root.tsx";

export function Notes() {
	return (
		<Root title="Notes">
			<h1>Notes</h1>
			<ul>
				{model.notes.list().map((n) => (
					<li>
						<p class="p-kind">Note</p>
						<a class="dt-published u-uid u-url" href={"/note/" + n.slug}>
							{n.date}
						</a>
						<div class="e-content">{n.content}</div>
					</li>
				))}
			</ul>
		</Root>
	);
}
