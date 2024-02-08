import type { Post, Article, Tags } from "./db.ts";
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

export function Article({
	title,
	created,
	time,
	intro,
	content,
	tags,
}: Article & { tags: Tags }) {
	return (
		<>
			<header class="space-y-3 text-sm">
				<Row class="gap-4 font-mono">
					<Row>
						<Icon name="document-text" />
						<span class="p-kind sr-only">Article</span>
						<ReadableDate class="dt-published">{created}</ReadableDate>
					</Row>
					<Row>
						<Icon name="clock" />
						<span>{(time / 60).toFixed(1)} minute read</span>
					</Row>
				</Row>
				<h1 class="p-name leading-none text-3xl md:text-4xl font-display text-balance">
					{title}
				</h1>
				<Row class="font-mono">
					{tags.map((t) => (
						<a class="p-category" href={`/tags/${t.slug}`}>
							#{t.slug}
						</a>
					))}
				</Row>
			</header>
			<div class="mt-6 leading-relaxed font-serif Content">
				<p class="text-lg md:text-xl font-display">{intro}</p>
				{content}
			</div>
		</>
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
