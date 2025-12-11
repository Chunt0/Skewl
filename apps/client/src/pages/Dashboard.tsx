import React from 'react'
import { useAuth } from '../auth/AuthContext'

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth()
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

export default Dashboard

