import { api } from './http'

export type User = { id: string; name: string }

export async function fetchMe(): Promise<{ user: User }> {
  return api('/auth/me', { method: 'GET' })
}

export async function login(username: string, password: string): Promise<{ user: User }> {
  return api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
}

export async function logout(): Promise<{ ok: boolean }> {
  return api('/auth/logout', { method: 'POST' })
}

