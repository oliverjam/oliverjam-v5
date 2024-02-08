import { model } from "../db.ts";
import { Entry } from "../ui.tsx";
import { Root } from "./root.tsx";

export function Tag(tag: string) {
	let posts = model.tags.posts(tag);
	return (
		<Root title={"#" + tag} class="space-y-8 p-8 max-w-2xl">
			<h1>#{tag}</h1>
			{posts.map((p) => (
				<Entry {...p} />
			))}
		</Root>
	);
}
