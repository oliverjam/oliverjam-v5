import { Root } from "./root.tsx";
import { model } from "../db.ts";
import { ReadableDate } from "../ui.tsx";

export function Home() {
	return (
		<Root title="Home" class="space-y-8 p-8 max-w-2xl">
			<h1>Home</h1>
			{model.all.list().map((e) => {
				return (
					<article class="h-entry space-y-1">
						<header class="text-sm flex items-center gap-1">
							<svg width="16" height="16" aria-hidden="true">
								<use href={"/public/sprite.svg#" + e.kind} />
							</svg>
							<span class="p-kind sr-only">{e.kind}</span>

							{e.kind === "note" ? (
								<a class="u-url" href={e.slug}>
									<ReadableDate class="dt-published">{e.date}</ReadableDate>
								</a>
							) : (
								<ReadableDate class="dt-published">{e.date}</ReadableDate>
							)}
						</header>
						{e.kind === "article" && (
							<h2 class="text-base">
								<a class="u-url p-name" href={`/${e.kind}s/${e.slug}`}>
									{e.title}
								</a>
							</h2>
						)}
						<div class="e-summary">{e.intro}</div>
					</article>
				);
			})}
		</Root>
	);
}
