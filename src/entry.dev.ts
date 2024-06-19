import { app } from "./app.tsx";

// @ts-ignore
let css = await Bun.$`bun run css`.quiet();
if (css.exitCode !== 0) console.error(css.stderr.toString());

let server = Bun.serve(app);

let underline = (s: string) => `\x1b[4m${s}\x1b[24m`;
let cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;

console.log(cyan(`Running → ${underline(`http://localhost:${server.port}`)}`));
