import type { JSX } from "@oliverjam/hypa/jsx-runtime";
import type { Post, Article, Tags, PostType } from "./types.ts";

type RootProps = {
	title: string;
	class?: string;
	children: unknown | Array<unknown>;
};

export function Root({ title, class: className = "", children }: RootProps) {
	return (
		<html lang="en">
			<head>
				<title>{`${title} - oliverjam.es`}</title>
				<link rel="icon" href="/public/favicon.svg" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="stylesheet" href="/public/app.css" />
				<meta name="color-scheme" content="light dark" />
				<script type="module" src="/public/transclusion.js"></script>
			</head>
			<body>
				<a
					class="absolute block top-2 left-2 p-2 invert-color [&:not(:focus)]:sr-only"
					href="#main"
				>
					Skip to content
				</a>
				<main
					id="main"
					tabindex="-1"
					class="max-w-3xl m-1 md:my-8 md:mx-auto md:border-2 md:p-1"
				>
					{children}
				</main>
			</body>
		</html>
	);
}

type DateProps = { children: string; class: string };

export function Entry(props: Post) {
	let summary = props.type === "article" ? props.intro : props.content;
	let date = <ReadableDate class="dt-published">{props.created}</ReadableDate>;
	return (
		<article class="h-entry space-y-1">
			<header class="text-sm flex items-center gap-1">
				<span class="p-kind sr-only">{props.type}</span>
				{props.type === "note" ? (
					<a class="u-url" href={props.slug}>
						{date}
					</a>
				) : (
					date
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
	intro,
	content,
	tags,
}: Article & { tags: Tags }) {
	return (
		<div class="space-y-1">
			<header class="border-2 p-6 space-y-3">
				<ReadableDate class="dt-published text-sm">{created}</ReadableDate>
				<h1 class="p-name leading-none text-3xl md:text-4xl text-balance">
					{title}
				</h1>
				<div class="flex gap-1">
					{tags.map((t) => (
						<a class="p-category text-sm" href={`/tags/${t.slug}`}>
							#{t.slug}
						</a>
					))}
				</div>
			</header>
			<p class="border-2 p-6 text-lg md:text-xl">{intro}</p>
			<div class="border-2 p-6 leading-relaxed Content font-serif">
				{content}
			</div>
		</div>
	);
}

type FiltersProps = {
	type: PostType | null;
	tags: Array<string>;
	all_tags: Array<{ tag: string; count: number }>;
};

export function Filters({ type, tags, all_tags }: FiltersProps) {
	let popular_tags = all_tags.slice(0, 7);
	return (
		<form
			data-boost
			data-target="#posts"
			data-history="replace"
			oninput="this.requestSubmit()"
			class="space-y-4"
		>
			<div role="radiogroup" aria-label="Type" class="flex gap-4">
				<Radio name="type" value="" checked={type === null}>
					All
				</Radio>
				<Radio name="type" value="article" checked={type === "article"}>
					Articles
				</Radio>
				<Radio name="type" value="note" checked={type === "note"}>
					Notes
				</Radio>
			</div>
			<div
				role="group"
				aria-label="Tags"
				class="mb-0 flex flex-wrap gap-x-3 gap-y-2"
			>
				{popular_tags.map((t) => (
					<Tag value={t.tag} checked={tags.includes(t.tag)}>
						#{t.tag}
					</Tag>
				))}
				<a href="/tags" class="">
					All tags →
				</a>
			</div>
			<button class="[@media(scripting:enabled)]:hidden">Filter</button>
		</form>
	);
}

type RadioProps = JSX.Props & JSX.HtmlInputTag;
function Radio({ children, ...rest }: RadioProps) {
	return (
		<label class="Toggle">
			<input {...rest} class="sr-only" type="radio" />
			<span class="Radio" aria-hidden="true" />
			{children}
		</label>
	);
}

type TagProps = { children: Array<string>; value: string; checked: boolean };
function Tag({ children, ...rest }: TagProps) {
	return (
		<label class="Toggle">
			<input type="checkbox" name="tags" class="sr-only" {...rest} />
			{children}
		</label>
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

type RowProps = JSX.Props<{ class?: string }>;
export function Row({ class: className, ...rest }: RowProps) {
	return <div {...rest} class={cn("flex items-center gap-1", className)} />;
}

type HttpStatusProps = JSX.Props<{ status: number }>;
export function HttpStatus({ status, children }: HttpStatusProps) {
	return (
		<header class="min-h-screen grid place-content-center place-items-center">
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
