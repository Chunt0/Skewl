// basic index.ts for express app with a simple health check
import express from "express";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// simple health check route
app.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// default root route
app.get("/", (_req, res) => {
        res.send("Hello from Express on Bun!");
});

// start server
app.listen(port, () => {
        // log listening URL
        // eslint-disable-next-line no-console
        console.log(`Server listening on http://localhost:${port}`);
});

