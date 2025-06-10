import React from 'react'
import { useAuth } from './AuthContext'

export default function Home() {
  const { isLoggedIn, user } = useAuth();

  return (
    <div>
      {isLoggedIn && user?.name
        ? `Hello, ${user.name}`
        : 'Hello'}
    </div>
  )
}
