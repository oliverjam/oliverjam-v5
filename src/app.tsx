import { sql, transaction } from "./db.ts";
import { Root, Entry, ArticleEntry, Filters, HttpStatus } from "./ui.tsx";
import type { Article, In, N, Note, Post, PostTags, Tags } from "./types.ts";
import "./app.css"; // just for hot-reloading

function html(content: string, init: ResponseInit = {}) {
  init.headers = new Headers(init.headers);
  init.headers.set("content-type", "text/html; charset=utf-8");
  return new Response("<!doctype html>" + content, init);
}

let not_found = html(
  <Root title="Not found">
    <HttpStatus status={404}>Not found</HttpStatus>
  </Root>,
  { status: 404 }
);
let server_error = html(
  <Root title="Something went wrong">
    <HttpStatus status={500}>Something went wrong</HttpStatus>
  </Root>
);
let file = (path: string) => new Response(Bun.file(path));

export let server = Bun.serve({
  routes: {
    "/public/*": async (req) => file("." + new URL(req.url).pathname),
    "/": (req) => {
      let url = new URL(req.url);
      let filters = url.searchParams.getAll("tags");
      let type = url.searchParams.get("type") || null;
      check(type === "article" || type === "note" || type === null);
      let tags = filters.map((f) => `'${f}'`);
      let query = tags.length
        ? sql`
					select * from posts join posts_tags on slug = post
					where draft = 0 and type = coalesce(?, type) and tag in (${tags.join(",")})
					group by slug having count(*) = ${tags.length}
					order by created desc
				`
        : sql`
					select * from posts where draft = 0 and type = coalesce(?, type)
					order by created desc
				`;
      let posts = query.all(type) as Array<Post>;
      let entries = posts.map((p) => <Entry {...p} />).join("");
      if (boosted(req)) return html(entries);
      let q = sql`
				select tag, count(tag) as count from posts_tags group by tag
				order by count desc
			`;
      let all_tags = q.all() as PostTags;
      return html(
        <Root title="Home">
          <section class="border-2 p-6">
            <Filters type={type} tags={filters} all_tags={all_tags} />
          </section>
          <section id="posts" class="space-y-8 mt-1 border-2 p-6">
            {entries.length > 0 ? entries : <p>No posts found</p>}
          </section>
        </Root>
      );
    },
    "/notes/:slug": (req) => {
      let slug = req.params.slug;
      let e = sql`select * from posts where slug = ?`.get(slug) as N<Note>;
      if (!e) return not_found;
      return html(
        <Root title={e.content.slice(0, 60) + "⋯"}>
          <Entry {...e} />
        </Root>
      );
    },
    "/articles/:slug": (req) => {
      let slug = req.params.slug;
      let e = sql`select * from posts where slug = ?`.get(slug) as N<Article>;
      if (!e) return not_found;
      let q = sql`select tag as slug from posts_tags where post = ?`;
      let tags = q.all(slug) as Tags;
      return html(
        <Root title={e.title}>
          <ArticleEntry {...e} tags={tags} />
        </Root>
      );
    },
    "/articles": {
      POST: async (req) => {
        try {
          let data = new SafeFormData(await req.formData());
          let slug = data.string("slug");
          let tags = data.strings("tags");
          let article = {
            type: "article",
            slug,
            title: data.string("title"),
            intro: data.string("intro"),
            draft: data.binary("draft"),
            content: data.string("content"),
            time: data.number("time"),
            created: data.nullable("created"),
          } satisfies In<Article>;
          transaction(() => {
            sql`
							insert into posts (slug, type, draft, content, title, time, intro, created)
							values ($slug, $type, $draft, $content, $title, $time, $intro, coalesce($created, current_timestamp))
						`.run(article);
            for (let t of tags) {
              sql`insert into tags values (?)`.run(t);
              sql`insert into posts_tags (tag, post) values (?, ?)`.run(
                t,
                slug
              );
            }
          });
          return Response.redirect(`/articles/${slug}`);
        } catch (e) {
          if (e instanceof Error) {
            return html(
              <Root title={e.message}>
                <HttpStatus status={400}>{e.message}</HttpStatus>
              </Root>
            );
          }
          return server_error;
        }
      },
    },
    "/notes": async (req) => {
      try {
        let data = new SafeFormData(await req.formData());
        let slug = data.string("slug");
        let tags = data.strings("tags");
        let note = {
          type: "note",
          slug,
          draft: data.binary("draft"),
          content: data.string("content"),
          created: data.string("created"),
        } satisfies In<Note>;
        transaction(() => {
          sql`
						insert into posts (slug, type, draft, content)
						values ($slug, $type, $draft, $content)
					`.run(note);
          for (let t of tags) {
            sql`insert into tags values (?)`.run(t);
            sql`insert into posts_tags (tag, post) values (?, ?)`.run(t, slug);
          }
        });
        return Response.redirect(`/notes/${slug}`);
      } catch (e) {
        if (e instanceof Error) {
          return html(
            <Root title={e.message}>
              <HttpStatus status={400}>{e.message}</HttpStatus>
            </Root>
          );
        }
        return server_error;
      }
    },
    "/tags": () => {
      let tags = sql`
				select tag, count(tag) as count from posts_tags
				group by tag order by count desc
			`.all() as Array<{ tag: string; count: number }>;
      return html(
        <Root title="Tags">
          <h1>Tags</h1>
          <ul class="list-none p-0 space-y-4">
            {tags.map((t) => {
              return (
                <li>
                  <a href={"/tags/" + t.tag.replace(/\W/g, "-")}>#{t.tag}</a>
                  <p>{t.count} posts</p>
                </li>
              );
            })}
          </ul>
        </Root>
      );
    },
    "/tags/:slug": (req) => {
      let slug = req.params.slug;
      let tags = sql`
				select posts.* from posts_tags join posts on post = slug where tag = ?
			`.all(slug) as Array<Post>;
      return html(
        <Root title={"#" + slug}>
          <h1>#{slug}</h1>
          {tags.map((p) => (
            <Entry {...p} />
          ))}
        </Root>
      );
    },
    "/*": not_found,
  },
});

export function check(cond: unknown, msg?: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function boosted(req: Request) {
  return req.headers.get("sec-fetch-dest") === "empty";
}

class SafeFormData {
  data: FormData;
  constructor(data: FormData) {
    this.data = data;
  }
  string(key: string) {
    let value = this.data.get(key);
    check(typeof value === "string", `Missing ${key}`);
    return value;
  }
  strings(key: string) {
    return this.data.getAll(key).map(String);
  }
  nullable(key: string) {
    let value = this.data.get(key);
    check(typeof value === "string" || value === null, `Missing ${key}`);
    return value;
  }
  number(key: string) {
    let value = this.data.get(key);
    check(typeof value === "string", `Missing ${key}`);
    let num = Number(value);
    if (Number.isNaN(num)) throw new Error(`${key} '${value}' isn't a number`);
    return num;
  }
  binary(key: string) {
    let value = this.data.get(key);
    return value ? 1 : 0;
  }
}
