import { App } from "./app.tsx";

Bun.spawn(["bun", "run", "css"]);

let server = Bun.serve({ fetch: App });

console.log(`http://localhost:${server.port}`);
