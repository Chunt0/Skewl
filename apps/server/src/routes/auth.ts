import { Elysia } from 'elysia'

const auth = new Elysia({ prefix: '/auth' })

auth.get('/health', () => ({ status: "ok", message: "skewl-backend auth route ok" }))

auth.post('/login', ({ body }) => ({ token: 'fake-token', user: body }))

auth.post('/logout', () => ({ ok: true }))

export default auth
