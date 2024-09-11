import { app } from "./app.tsx";

let server = Bun.serve({ fetch: app.fetch, port: 8080 });

if (Bun.env.NODE_ENV !== "production") {
	let css = await Bun.$`bun run css`.quiet().nothrow();
	if (css.exitCode !== 0) console.log(css.stderr.toString());

	let line = (s: string) => `\x1b[4m${s}\x1b[24m`;
	let cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;

	console.log(cyan(`Running → ${line(`http://localhost:${server.port}`)}`));
} else {
	console.log(`Running → http://localhost:${server.port}`);
}
