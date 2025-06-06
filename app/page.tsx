"use client"

import { AuthProvider } from "@/contexts/AuthContext"
import { TaskProvider } from "@/contexts/TaskContext"
import { UserProvider } from "@/contexts/UserContext"
import TaskManagementApp from "@/components/TaskManagementApp"

export default function Home() {
  return (
    <AuthProvider>
      <UserProvider>
        <TaskProvider>
          <TaskManagementApp />
        </TaskProvider>
      </UserProvider>
    </AuthProvider>
  )
}
