import type { Post } from "./db.ts";
import { Icon } from "./icon.tsx";

type DateProps = { children: string; class: string };

export function Entry(props: Post) {
	let summary = props.type === "article" ? props.intro : props.content;
	return (
		<article class="h-entry space-y-1">
			<header class="text-sm flex items-center gap-1 font-mono">
				<Icon name={icons[props.type]} />
				<span class="p-kind sr-only">{props.type}</span>
				{props.type === "note" ? (
					<a class="u-url" href={props.slug}>
						<ReadableDate class="dt-published">{props.created}</ReadableDate>
					</a>
				) : (
					<ReadableDate class="dt-published">{props.created}</ReadableDate>
				)}
			</header>
			{props.type === "article" && (
				<h2 class="text-base">
					<a class="u-url p-name" href={`/${props.type}s/${props.slug}`}>
						{props.title}
					</a>
				</h2>
			)}
			<div class="e-summary">{summary}</div>
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
