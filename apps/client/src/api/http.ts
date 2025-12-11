const API_BASE = import.meta.env?.VITE_API_BASE ?? 'http://localhost:3000'

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include', // critical for cookie auth
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })
  // Return JSON or throw detailed error
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} - ${text}`)
  return JSON.parse(text)
}

