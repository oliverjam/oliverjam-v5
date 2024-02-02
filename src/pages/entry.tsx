import { Icon } from "../icon.tsx";
import { ReadableDate } from "../ui.tsx";
import type { Entry } from "../db.ts";

export function Entry({ slug, kind, date, title, intro }: Entry) {
	return (
		<article class="h-entry space-y-1">
			<header class="text-sm flex items-center gap-1 font-mono">
				<Icon name={icons[kind]} />
				<span class="p-kind sr-only">{kind}</span>
				{kind === "note" ? (
					<a class="u-url" href={slug}>
						<ReadableDate class="dt-published">{date}</ReadableDate>
					</a>
				) : (
					<ReadableDate class="dt-published">{date}</ReadableDate>
				)}
			</header>
			{kind === "article" && (
				<h2 class="text-base">
					<a class="u-url p-name" href={`/${kind}s/${slug}`}>
						{title}
					</a>
				</h2>
			)}
			<div class="e-summary">{intro}</div>
		</article>
	);
}

let icons = {
	article: "document-text",
	note: "chat-bubble-oval-left-ellipsis",
} as const;
