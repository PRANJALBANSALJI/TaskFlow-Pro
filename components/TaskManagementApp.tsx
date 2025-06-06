"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTasks } from "@/contexts/TaskContext"
import AuthForm from "./AuthForm"
import Dashboard from "./Dashboard"
import UserManagement from "./UserManagement"
import TaskManagement from "./TaskManagement"
import TaskDetails from "./TaskDetails"
import NotificationPanel from "./NotificationPanel"
import { Button } from "@/components/ui/button"
import { LogOut, Users, CheckSquare, Home, BarChart3, Moon, Sun, Bell, Settings } from "lucide-react"
import Analytics from "./Analytics"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type View = "dashboard" | "users" | "tasks" | "task-details" | "analytics"

export default function TaskManagementApp() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const { tasks } = useTasks()
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  // Calculate notifications
  const userTasks = isAdmin ? tasks : tasks.filter((task) => task.assignedTo === user?.id)
  const overdueTasks = userTasks.filter((task) => task.status !== "completed" && new Date(task.dueDate) < new Date())
  const dueSoonTasks = userTasks.filter((task) => {
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
    return task.status !== "completed" && dueDate <= threeDaysFromNow && dueDate >= today
  })
  const totalNotifications = overdueTasks.length + dueSoonTasks.length

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true"
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("darkMode", newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout()
    }
  }

  if (!isAuthenticated) {
    return <AuthForm />
  }

  const handleViewTaskDetails = (taskId: string) => {
    setSelectedTaskId(taskId)
    setCurrentView("task-details")
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onViewTask={handleViewTaskDetails} />
      case "users":
        return isAdmin ? <UserManagement /> : <div>Access Denied</div>
      case "tasks":
        return <TaskManagement onViewTask={handleViewTaskDetails} />
      case "task-details":
        return selectedTaskId ? (
          <TaskDetails taskId={selectedTaskId} onBack={() => setCurrentView("tasks")} />
        ) : (
          <div>Task not found</div>
        )
      case "analytics":
        return <Analytics />
      default:
        return <Dashboard onViewTask={handleViewTaskDetails} />
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-300">
      {/* Enhanced Header */}
      <header className="glass border-b border-white/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TaskFlow Pro
                </h1>
              </div>
              <nav className="hidden md:flex space-x-1">
                <Button
                  variant={currentView === "dashboard" ? "default" : "ghost"}
                  onClick={() => setCurrentView("dashboard")}
                  className="flex items-center space-x-2 hover-lift"
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
                <Button
                  variant={currentView === "tasks" ? "default" : "ghost"}
                  onClick={() => setCurrentView("tasks")}
                  className="flex items-center space-x-2 hover-lift"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Tasks</span>
                </Button>
                <Button
                  variant={currentView === "analytics" ? "default" : "ghost"}
                  onClick={() => setCurrentView("analytics")}
                  className="flex items-center space-x-2 hover-lift"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </Button>
                {isAdmin && (
                  <Button
                    variant={currentView === "users" ? "default" : "ghost"}
                    onClick={() => setCurrentView("users")}
                    className="flex items-center space-x-2 hover-lift"
                  >
                    <Users className="w-4 h-4" />
                    <span>Users</span>
                  </Button>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications Sheet */}
              <Sheet open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative hover-lift">
                    <Bell className="w-5 h-5" />
                    {totalNotifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500">
                        {totalNotifications > 9 ? "9+" : totalNotifications}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Notifications</SheetTitle>
                    <SheetDescription>Stay updated with your task deadlines and important updates</SheetDescription>
                  </SheetHeader>
                  <NotificationPanel
                    overdueTasks={overdueTasks}
                    dueSoonTasks={dueSoonTasks}
                    onViewTask={handleViewTaskDetails}
                    onClose={() => setIsNotificationOpen(false)}
                  />
                </SheetContent>
              </Sheet>

              {/* Dark Mode Toggle */}
              <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="hover-lift">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover-lift">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                        {getInitials(user?.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.role}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 animate-fade-in-scale">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-red-600">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Logout Button */}
              <div className="md:hidden">
                <Button variant="outline" size="sm" onClick={handleLogout} className="hover-lift">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with enhanced animations */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in-scale">{renderCurrentView()}</div>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover-lift"
          onClick={() => setCurrentView("tasks")}
        >
          <CheckSquare className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}
