import { App } from "./app.tsx";

let server = Bun.serve({ fetch: App, port: 8080 });

console.log(`Running → http://localhost:${server.port}`);
