import { parse } from "yaml";
import { marked } from "marked";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";

let levels = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

marked.use({
	renderer: {
		heading(text: string, level: number, raw: string) {
			let slug = slugify(raw);
			let H = levels[level];
			return (
				<H id={slug}>
					<a class="hash" href={"#" + slug} aria-label="Link to heading"></a>
					{text}
				</H>
			);
		},
		code(_code, lang = "") {
			if (lang && !Prism.languages[lang]) loadLanguages([lang]);
			let grammar = lang && Prism.languages[lang];
			let code = grammar ? Prism.highlight(_code, grammar, lang) : _code;
			return (
				<pre>
					<code>{code}</code>
				</pre>
			);
		},
		image(src, title, alt) {
			let motion = src.endsWith(".mp4");
			if (motion) {
				return <video src={src} controls autoplay muted loop playsinline />;
			} else {
				return <img src={src} title={title || ""} alt={alt || ""} />;
			}
		},
	},
});

export async function markdown(raw: string) {
	let { fm, md } = frontmatter(raw);
	return {
		data: parse(fm),
		content: await marked.parse(md),
		raw: md,
	};
}

function frontmatter(raw: string) {
	const [first, ...lines] = raw.split(/\n/);
	let fm = "";
	let md = "";
	if (first !== "---") {
		md = raw;
	} else {
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line === "---") {
				md = lines.slice(i + 1).join("\n");
				break;
			}
			fm += line + "\n";
		}
	}
	return { fm, md };
}

function slugify(s: string) {
	return s.replace(/\W/g, "-");
}
