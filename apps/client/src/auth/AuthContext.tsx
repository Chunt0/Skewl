import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchMe, login as apiLogin, logout as apiLogout, type User } from '../api/auth'

type AuthState = {
  user: User | null
  loading: boolean
  error?: string
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()

  const refresh = async () => {
    setLoading(true)
    setError(undefined)
    try {
      const { user } = await fetchMe()
      setUser(user)
    } catch (err: any) {
      setUser(null)
      if (!String(err?.message).startsWith('401')) {
        setError(err?.message ?? 'Failed to fetch session')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refresh() }, [])

  const login = async (username: string, password: string) => {
    setLoading(true)
    setError(undefined)
    try {
      const { user } = await apiLogin(username, password)
      setUser(user)
    } catch (err: any) {
      setError(err?.message ?? 'Login failed')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    setError(undefined)
    try {
      await apiLogout()
      setUser(null)
    } catch (err: any) {
      setError(err?.message ?? 'Logout failed')
    } finally {
      setLoading(false)
    }
  }

  const value = useMemo<AuthState>(() => ({
    user, loading, error, login, logout, refresh
  }), [user, loading, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

