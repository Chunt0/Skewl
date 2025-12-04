import { Elysia } from "elysia"

const app = new Elysia()
  .get("/api/health", () => "Healthy")
  .listen({port: 3000, hostname: '0.0.0.0'})

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
