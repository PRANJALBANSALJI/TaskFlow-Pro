"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
}

interface UserContextType {
  users: User[]
  createUser: (userData: Omit<User, "id"> & { password: string }) => void
  updateUser: (id: string, userData: Partial<User>) => void
  deleteUser: (id: string) => void
  getUserById: (id: string) => User | undefined
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUsers = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider")
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const usersWithoutPasswords = storedUsers.map((user: any) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })
    setUsers(usersWithoutPasswords)
    console.log("Loaded users:", usersWithoutPasswords) // Debug log
  }, [])

  const createUser = (userData: Omit<User, "id"> & { password: string }) => {
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const newUser = {
      ...userData,
      id: Date.now().toString(),
    }

    allUsers.push(newUser)
    localStorage.setItem("users", JSON.stringify(allUsers))

    const { password, ...userWithoutPassword } = newUser
    setUsers((prev) => [...prev, userWithoutPassword])
  }

  const updateUser = (id: string, userData: Partial<User>) => {
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const updatedUsers = allUsers.map((user: any) => (user.id === id ? { ...user, ...userData } : user))
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...userData } : user)))
  }

  const deleteUser = (id: string) => {
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const filteredUsers = allUsers.filter((user: any) => user.id !== id)
    localStorage.setItem("users", JSON.stringify(filteredUsers))

    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  const getUserById = (id: string) => {
    return users.find((user) => user.id === id)
  }

  return (
    <UserContext.Provider
      value={{
        users,
        createUser,
        updateUser,
        deleteUser,
        getUserById,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
