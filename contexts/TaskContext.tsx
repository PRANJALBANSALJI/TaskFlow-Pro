"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface TaskDocument {
  id: string
  name: string
  size: number
  type: string
}

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: string
  assignedTo: string
  createdBy: string
  documents: TaskDocument[]
  createdAt: string
  updatedAt: string
}

interface TaskContextType {
  tasks: Task[]
  createTask: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  updateTask: (id: string, taskData: Partial<Task>) => void
  deleteTask: (id: string) => void
  getTaskById: (id: string) => Task | undefined
  getTasksByUser: (userId: string) => Task[]
  filterTasks: (filters: {
    status?: string
    priority?: string
    assignedTo?: string
    dueDateFrom?: string
    dueDateTo?: string
  }) => Task[]
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const useTasks = () => {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}

interface TaskProviderProps {
  children: ReactNode
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]")
    setTasks(storedTasks)
  }, [])

  const saveTasks = (updatedTasks: Task[]) => {
    localStorage.setItem("tasks", JSON.stringify(updatedTasks))
    setTasks(updatedTasks)
  }

  const createTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedTasks = [...tasks, newTask]
    saveTasks(updatedTasks)
  }

  const updateTask = (id: string, taskData: Partial<Task>) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, ...taskData, updatedAt: new Date().toISOString() } : task,
    )
    saveTasks(updatedTasks)
  }

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id)
    saveTasks(updatedTasks)
  }

  const getTaskById = (id: string) => {
    return tasks.find((task) => task.id === id)
  }

  const getTasksByUser = (userId: string) => {
    return tasks.filter((task) => task.assignedTo === userId)
  }

  const filterTasks = (filters: {
    status?: string
    priority?: string
    assignedTo?: string
    dueDateFrom?: string
    dueDateTo?: string
  }) => {
    return tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false
      if (filters.priority && task.priority !== filters.priority) return false
      if (filters.assignedTo && task.assignedTo !== filters.assignedTo) return false
      if (filters.dueDateFrom && task.dueDate < filters.dueDateFrom) return false
      if (filters.dueDateTo && task.dueDate > filters.dueDateTo) return false
      return true
    })
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        createTask,
        updateTask,
        deleteTask,
        getTaskById,
        getTasksByUser,
        filterTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}
