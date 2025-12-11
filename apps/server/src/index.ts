import { Elysia } from "elysia"
import { cors } from '@elysiajs/cors'
import { readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const app = new Elysia({ prefix: '/api' })
        .use(cors({
                origin: 'https://skewl.putty-ai.com',
                credentials: true
        }))

function collectRouteFiles(dir: string): string[] {
        const files: string[] = []
        let entries: string[] = []
        try {
                entries = readdirSync(dir)
        } catch (err) {
                return files
        }


        for (const entry of entries) {
                const full = join(dir, entry)
                const stats = statSync(full)

                if (stats.isDirectory()) {
                        files.push(...collectRouteFiles(full))
                } else if (stats.isFile() && ['.ts', '.tsx'].includes(extname(full))) {
                        files.push(full)
                }
        }
        return files
}

async function loadRoutes() {
        const routesDir = join(import.meta.dir, 'routes')
        let files: string[] = []
        console.log('🔎 Scanning routes from:', routesDir)
        try {
                files = collectRouteFiles(routesDir)
        } catch (err) {
                console.log(`${err}: Could not collect files from ${routesDir}`)
                files = []
        }

        for (const file of files) {
                console.log(`📦 Importing route module: ${file}`)
                const mod = await import(file)

                for (const key of Object.keys(mod)) {
                        const exp = (mod as any)[key]
                        if (exp && typeof exp == 'object' && exp.constructor?.name === 'Elysia') {
                                app.use(exp)
                        }
                        else if (typeof exp === 'function') {
                                const result = exp(app)

                                if (result && typeof result === 'object' && result.constructor?.name === 'Elysia') {
                                        app.use(result)
                                }
                        }
                }
        }
}

await loadRoutes()

app.get("/health", () => ({ status: "ok", message: "skewl-backend server running" }))

app.listen({
        port: 3000,
        hostname: "0.0.0.0"
})

console.log(`skewl-backend running on ${app.server?.hostname}:${app.server?.port}`)
