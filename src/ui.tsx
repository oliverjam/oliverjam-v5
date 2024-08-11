import type { JSX } from "@oliverjam/hypa/jsx-runtime";
import type { Post, Article, Tags } from "./db.ts";
import { heroicons } from "./icon.tsx";

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

export function ArticleEntry({
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

type FiltersProps = {
	type: "article" | "note" | null;
	tags: Array<string>;
	all_tags: Array<{ tag: string; count: number }>;
};

export function Filters({ type, tags, all_tags }: FiltersProps) {
	let popular_tags = all_tags.slice(0, 8);
	let rest_tags = all_tags.slice(8);
	return (
		<form
			data-boost
			data-target="#posts"
			data-history="replace"
			oninput="this.requestSubmit()"
			class="text-sm space-y-4 sticky top-8"
		>
			<div role="radiogroup" aria-label="Type" class="flex gap-3">
				<label class="inline-flex items-center gap-1 group has-[:checked]:text-[AccentColor]">
					<input
						class="sr-only"
						type="radio"
						name="type"
						value=""
						checked={type === null}
					/>
					<Icon
						class="transition-opacity opacity-70 group-hover:opacity-100"
						name="folder-open"
					/>
					All
				</label>
				<label class="inline-flex items-center gap-1 group has-[:checked]:text-[AccentColor]">
					<input
						class="sr-only"
						type="radio"
						name="type"
						value="article"
						checked={type === "article"}
					/>
					<Icon
						class="transition-opacity opacity-70 group-hover:opacity-100"
						name={icons.article}
					/>
					Articles
				</label>
				<label class="inline-flex items-center gap-1 group has-[:checked]:text-[AccentColor]">
					<input
						class="sr-only"
						type="radio"
						name="type"
						value="note"
						checked={type === "note"}
					/>
					<Icon
						class="transition-opacity opacity-70 group-hover:opacity-100"
						name={icons.note}
					/>
					Notes
				</label>
			</div>
			<div role="group" aria-label="Tags" class="flex flex-wrap gap-3">
				{popular_tags.map((t) => (
					<Tag value={t.tag} checked={tags.includes(t.tag)}>
						#{t.tag} <small>({t.count})</small>
					</Tag>
				))}
			</div>
			<details>
				<summary>More tags</summary>
				<div role="group" aria-label="More tags" class="flex flex-wrap gap-3">
					{rest_tags.map((t) => (
						<Tag value={t.tag} checked={tags.includes(t.tag)}>
							#{t.tag} <small>({t.count})</small>
						</Tag>
					))}
				</div>
			</details>
			<button class="[@media(scripting:enabled)]:hidden">Filter</button>
		</form>
	);
}

type TagProps = { children: Array<string>; value: string; checked: boolean };
function Tag({ children, ...rest }: TagProps) {
	return (
		<label class="inline-flex gap-1 items-center">
			<input type="checkbox" name="tags" {...rest} />
			{children}
		</label>
	);
}

let icons = {
	article: "document-text",
	note: "chat-bubble-oval-left-ellipsis",
} as const;

type IconProps = {
	size?: number;
	name: keyof typeof heroicons;
	class?: string;
};

export function Icon({ size = 16, name, ...rest }: IconProps) {
	return (
		<svg
			fill="currentcolor"
			{...rest}
			width={size}
			height={size}
			aria-hidden="true"
		>
			{heroicons[name]}
		</svg>
	);
}

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

type HttpStatusProps = JSX.Props<{ status: number }>;
export function HttpStatus({ status, children }: HttpStatusProps) {
	return (
		<header class="min-h-screen grid place-content-center place-items-center font-mono">
			<p class="text-9xl font-black bg-gradient-to-t from-teal-700 via-green-400 bg-clip-text text-transparent">
				{status}
			</p>
			<h1>{children}</h1>
		</header>
	);
}

export function cn(...args: Array<string | undefined | null | false>): string {
	let classname = "";
	for (let c of args) {
		if (c != null && c !== false) classname += " " + c;
	}
	return classname;
}
