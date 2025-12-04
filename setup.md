# Monorepo Setup Guide

This document explains how to create a Bun-based monorepo with a React + Tailwind client and an Elysia server, how to configure workspace scripts to run client and server concurrently, and how to configure both apps to listen on 0.0.0.0 with explicit ports. It also includes a small Bun runner to replace the external "concurrently" dependency and a Pangolin reverse proxy example.

## 1. Initialize root monorepo

# Run these commands in a terminal:
# bun init
# bun add concurrently         # optional: we'll replace it with a Bun runner later
# rm src/index.ts             # remove default index file if present

# Root package.json (improved)
{
  "name": "skewl",
  "version": "0.0.0",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev:client": "bun run --cwd apps/client dev",
    "dev:server": "bun run --cwd apps/server dev",
    "dev": "bun run scripts/dev-runner.js",
    "build": "bun run build:client && bun run build:server",
    "build:client": "bun --cwd apps/client build",
    "build:server": "bun --cwd apps/server build"
  }
}

## 2. Create apps

# Create client and server apps:
# bun init --react=tailwind apps/client
# bun init elysia apps/server

# Remove per-app tsconfig.json so they inherit the root tsconfig:
# rm apps/client/tsconfig.json
# rm apps/server/tsconfig.json

## 3. Configure apps to listen on 0.0.0.0 with explicit ports

# apps/client/src/main.ts (or index.ts depending on template)
import { createApp } from 'vite' // placeholder; actual client template may differ

// Example Vite dev server config modification — if using a Vite-based template,
// update the dev server options to listen on 0.0.0.0:5173. For many Bun React templates,
// this is configured in vite.config.ts. Example below:

// apps/client/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})

# apps/server/src/index.ts (Elysia)
import { Elysia } from 'elysia'

const app = new Elysia()

app.get('/', () => 'Hello from Elysia')

// Listen on 0.0.0.0:3000
app.listen({ port: 3000, hostname: '0.0.0.0' })

## 4. Replace concurrently with a Bun runner

# scripts/dev-runner.js
// Small Bun runner to start client and server in parallel and forward output.
// Exits non-zero if any child exits with a non-zero code.
const procs = [
  Bun.spawn({
    cmd: ['bun', 'run', 'dev:server'],
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit'
  }),
  Bun.spawn({
    cmd: ['bun', 'run', 'dev:client'],
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit'
  })
]

// Wait for both to finish; if any fails, kill others and exit with that code.
async function main () {
  try {
    const results = await Promise.all(procs.map(p => p.finished.catch(e => e)))
    for (const r of results) {
      if (r && typeof r.exitCode === 'number' && r.exitCode !== 0) {
        for (const p of procs) {
          try { p.kill('SIGTERM') } catch {}
        }
        Bun.exit(r.exitCode)
      }
    }
  } catch (e) {
    // Ensure children are terminated on unexpected errors
    for (const p of procs) {
      try { p.kill('SIGTERM') } catch {}
    }
    throw e
  }
}

main()

## 5. Pangolin reverse proxy example

# Install pangolin in the root or a dedicated tooling package:
# bun add -w pangolin   # -w for workspace install

# pangolin/config.ts
import { createProxy } from 'pangolin' // placeholder API; adapt to actual Pangolin usage

// Example Pangolin config to reverse-proxy client (port 5173) and API (port 3000).
// Replace this with the actual Pangolin programmatic setup or config file format.
const proxy = createProxy({
  routes: [
    {
      path: '/',
      target: 'http://127.0.0.1:5173' // client dev server
    },
    {
      path: '/api',
      target: 'http://127.0.0.1:3000' // Elysia server
    }
  ],
  listen: {
    host: '0.0.0.0',
    port: 8080
  }
})

proxy.start()

## 6. Notes

# - The root "dev" script now runs scripts/dev-runner.js which starts client and server in parallel.
# - Vite dev server configuration may vary by template; ensure server.host and server.port are set.
# - Elysia app.listen accepts an options object; set hostname: '0.0.0.0' and port: 3000.
# - Pangolin config above is illustrative; consult Pangolin docs for exact API or config file syntax.

