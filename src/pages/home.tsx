import { Root } from "../root.tsx";
import { model } from "../db.ts";

export function Home() {
	return (
		<Root title="Home">
			<h1>Home</h1>
			<ul>
				{model.all.list().map((e) => (
					<li>
						<p class="p-kind">{e.kind}</p>
						{e.kind === "article" && (
							<>
								<p class="dt-published">{e.date}</p>
								<a class="u-url" href={`/${e.kind}s/${e.slug}`}>
									{e.title}
								</a>
							</>
						)}
						{e.kind === "note" && <a class="u-url dt-published">{e.date}</a>}
						<p class="e-summary">{e.intro}</p>
					</li>
				))}
			</ul>
		</Root>
	);
}
