import { app } from "./app.tsx";

let css = await Bun.$`bun run css`.quiet().nothrow();
if (css.exitCode !== 0) {
	console.log(css.stderr.toString());
	// process.exit(css.exitCode);
}

let server = Bun.serve(app);

let underline = (s: string) => `\x1b[4m${s}\x1b[24m`;
let cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;

console.log(cyan(`Running → ${underline(`http://localhost:${server.port}`)}`));
