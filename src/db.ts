import { Database } from "bun:sqlite";
import { schema } from "./types.ts";

let db = new Database("./data/blog.db", { strict: true });
db.run(schema);

export function sql(strings: TemplateStringsArray, ...subs: Array<unknown>) {
	return db.query(String.raw(strings, ...subs));
}

export function transaction(cb: () => void) {
	db.transaction(cb)();
}
