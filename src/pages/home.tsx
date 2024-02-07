import { Root } from "./root.tsx";
import { model } from "../database/db.ts";
import { Entry } from "../ui.tsx";

export function Home() {
	return (
		<Root title="Home" class="space-y-8 p-8 max-w-2xl">
			<h1>Home</h1>
			{model.all.list().map((e) => (
				<Entry {...e} />
			))}
		</Root>
	);
}
