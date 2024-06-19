import { app } from "./app.tsx";

let server = Bun.serve({ fetch: app.fetch, port: 8080 });

console.log(`Running → http://localhost:${server.port}`);
