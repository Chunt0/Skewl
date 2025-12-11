import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'

const LoginPage: React.FC = () => {
  const { login, loading, error } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from?.pathname ?? '/'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(username, password)
    navigate(from, { replace: true })
  }

  return (
    <div style={{ maxWidth: 360, margin: '3rem auto' }}>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </div>
  )
}

export default LoginPage

