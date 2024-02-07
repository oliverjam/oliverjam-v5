import type { Entry } from "./db.ts";
import { Icon } from "./icon.tsx";

type DateProps = { children: string; class: string };

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

export function ReadableDate({ children, class: className }: DateProps) {
	let d = new Date(children);
	let current_year = d.getFullYear() === new Date().getFullYear();
	let readable = d.toLocaleDateString("en-GB", {
		year: current_year ? undefined : "numeric",
		month: "short",
		day: "numeric",
	});
	return (
		<time
			datetime={children.toString()}
			title={children.toString()}
			class={className}
		>
			{readable}
		</time>
	);
}

type RowProps = { class?: string; children: unknown };
export function Row({ class: className, ...rest }: RowProps) {
	return <div {...rest} class={cn("flex items-center gap-1", className)} />;
}

export let cn = (...args: Array<string | undefined | false>): string =>
	args.reduce<string>((c, x) => (!!x ? c + " " + x : c), "");
