import { parse } from "yaml";
import { marked } from "marked";

marked.use({
  renderer: {
    heading(text: string, level: number, raw: string) {
      let slug = slugify(raw);
      return `
      <h${level} id="${slug}"><a class="hash" href="#${slug}" aria-label="Link to heading"></a>${text}</h${level}>
    `;
    },
    code(code, info = "") {
      let [lang, file] = info.split(" ");
      // let grammar = lang && prism.languages[lang];
      // let highlighted = grammar ? prism.highlight(code, grammar, lang) : code;
      let highlighted = code;
      return `<div class="Code">
      ${
        file
          ? `<p class="CodeFile">
        <svg width="12" height="12" aria-hidden="true">
          <use href="/public/sprite.svg#file" />
        </svg>
        ${file}
      </p>`
          : ""
      }
      <pre><code class="CodeSyntax">${highlighted}</code></pre>
    </div>`;
    },
    image(_src, _title, _alt) {
      let motion = _src.endsWith(".mp4");
      if (motion) {
        return `<video src=${_src} controls autoplay muted loop playsinline></video>`;
      } else {
        let title = _title ? ` title="${_title}"` : "";
        let alt = _alt ? ` alt="${_alt}"` : "";
        return `<img src="${_src}"${alt}${title}>`;
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
