/// <reference path="./jsx.d.ts" />

const VOIDS = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"source",
	"track",
	"wbr",
]);

type Props = Record<string, unknown> & { children?: unknown };
type Component = (props?: Props) => unknown;
type Type = string | Component;

function jsx(tag: Type, props: Props): string | string[] {
	if (typeof tag === "function") return filter(tag(props));
	let attrs = "";
	let { children = "", ...rest } = props;
	for (let [k, v] of Object.entries(rest)) {
		if (v === true) attrs += " " + k;
		else if (v !== false && v != null) attrs += " " + `${k}="${v}"`;
	}
	if (VOIDS.has(tag)) return `<${tag}${attrs}>`;
	return `<${tag}${attrs}>${filter(children)}</${tag}>`;
}

function filter(children: unknown): string {
	if (children == null || children == false) return "";
	if (Array.isArray(children)) return children.map(filter).join("");
	return String(children);
}

function Fragment(props: Props) {
	return filter(props.children || "");
}

export { Fragment, jsx, jsx as jsxDEV, jsx as jsxs };
