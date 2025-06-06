"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  role: "admin" | "user"
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const foundUser = users.find((u: any) => u.email === email && u.password === password)

    if (foundUser) {
      const userWithoutPassword = { ...foundUser }
      delete userWithoutPassword.password
      setUser(userWithoutPassword)
      localStorage.setItem("token", "mock-jwt-token")
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    if (users.find((u: any) => u.email === email)) {
      return false // User already exists
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      role: users.length === 0 ? "admin" : "user", // First user is admin
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    const userWithoutPassword = { ...newUser }
    delete userWithoutPassword.password
    setUser(userWithoutPassword)
    localStorage.setItem("token", "mock-jwt-token")
    localStorage.setItem("user", JSON.stringify(userWithoutPassword))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
