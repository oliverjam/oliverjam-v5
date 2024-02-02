import { model } from "../db.ts";
import { Root } from "./root.tsx";

export function Tag(slug: string) {
	let articles = model.articles.tags.read(slug);
	return (
		<Root title={"#" + slug} class="space-y-8 p-8 max-w-2xl">
			<h1>#{slug}</h1>
			{/* {articles.map((e) => )} */}
		</Root>
	);
}
