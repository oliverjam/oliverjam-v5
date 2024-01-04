import { Root } from "../root.tsx";
import { model } from "../db.ts";

export function Home() {
	return (
		<Root title="Home">
			<h1>Home</h1>
			<ul>
				{model.all.list().map((e) => {
					if (e.kind === "article") {
						let tags = model.tags.article(e.slug);
						return (
							<li>
								<p class="p-kind">{e.kind}</p>
								<p class="dt-published">{e.date}</p>
								<a class="u-url" href={`/${e.kind}s/${e.slug}`}>
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
					}

					if (e.kind === "note") {
						let tags = model.tags.note(e.slug);
						return (
							<li>
								<p class="p-kind">{e.kind}</p>
								<a class="u-url dt-published" href={`/${e.kind}s/${e.slug}`}>
									{e.date}
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
					}
				})}
			</ul>
		</Root>
	);
}
