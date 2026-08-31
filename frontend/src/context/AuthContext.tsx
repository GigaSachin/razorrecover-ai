import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '@/services/api'

export interface User {
  username: string
  role: 'admin' | 'analyst'
  name: string
  email: string
  token: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  quickLogin: (role: 'admin' | 'analyst') => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEFAULT_ADMIN: User = {
  username: 'admin',
  role: 'admin',
  name: 'Razorpay Operations Lead',
  email: 'admin@razorpay.com',
  token: 'mock_admin_token',
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('razorrecover_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return DEFAULT_ADMIN
      }
    }
    return DEFAULT_ADMIN
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('razorrecover_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('razorrecover_user')
    }
  }, [user])

  const login = async (username: string, password: string) => {
    try {
      const res = await api.login({ username, password })
      setUser({
        username: res.username,
        role: res.role as 'admin' | 'analyst',
        name: res.name,
        email: res.email,
        token: res.token,
      })
    } catch (err: any) {
      // Fallback local authentication if backend is unreachable
      if (username === 'admin' && password === 'admin123') {
        setUser(DEFAULT_ADMIN)
      } else if (username === 'analyst' && password === 'analyst123') {
        setUser({
          username: 'analyst',
          role: 'analyst',
          name: 'Recovery Specialist',
          email: 'analyst@razorpay.com',
          token: 'mock_analyst_token',
        })
      } else {
        throw new Error(err.message || 'Invalid credentials')
      }
    }
  }

  const quickLogin = async (role: 'admin' | 'analyst') => {
    if (role === 'admin') {
      await login('admin', 'admin123')
    } else {
      await login('analyst', 'analyst123')
    }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        quickLogin,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
