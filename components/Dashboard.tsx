"use client"

import { useTasks } from "@/contexts/TaskContext"
import { useUsers } from "@/contexts/UserContext"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckSquare, Clock, AlertTriangle, TrendingUp, Users, Calendar, Star } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface DashboardProps {
  onViewTask: (taskId: string) => void
}

export default function Dashboard({ onViewTask }: DashboardProps) {
  const { tasks } = useTasks()
  const { users } = useUsers()
  const { user, isAdmin } = useAuth()

  const userTasks = isAdmin ? tasks : tasks.filter((task) => task.assignedTo === user?.id)
  const completedTasks = userTasks.filter((task) => task.status === "completed")
  const pendingTasks = userTasks.filter((task) => task.status !== "completed")
  const overdueTasks = userTasks.filter((task) => task.status !== "completed" && new Date(task.dueDate) < new Date())
  const completionRate = userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white"
      case "medium":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "low":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      case "in-progress":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      case "todo":
        return "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
              <p className="text-blue-100 text-lg">
                {completionRate >= 80
                  ? "You're crushing it! Keep up the excellent work."
                  : completionRate >= 50
                    ? "You're making great progress on your tasks."
                    : "Let's get those tasks done today!"}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <div className="text-3xl font-bold">{completionRate}%</div>
                <div className="text-blue-100">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Tasks</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{userTasks.length}</div>
            <Progress value={completionRate} className="mt-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {isAdmin ? "All tasks in system" : "Your assigned tasks"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-lg bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedTasks.length}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+{completedTasks.length} this week</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tasks completed</p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50 dark:from-slate-800 dark:to-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">In Progress</CardTitle>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingTasks.length}</div>
            <div className="flex items-center mt-2">
              <Clock className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm text-yellow-600 font-medium">Active now</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tasks in progress</p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-lg bg-gradient-to-br from-white to-red-50 dark:from-slate-800 dark:to-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Overdue</CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdueTasks.length}</div>
            <div className="flex items-center mt-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-sm text-red-600 font-medium">Needs attention</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks with Enhanced Design */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Recent Tasks
              </CardTitle>
              <CardDescription>Your most recently updated tasks</CardDescription>
            </div>
            <Button variant="outline" className="hover-lift">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userTasks
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 5)
              .map((task, index) => {
                const assignedUser = users.find((u) => u.id === task.assignedTo)
                const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed"
                return (
                  <div
                    key={task.id}
                    className="group p-4 border border-gray-100 dark:border-slate-700 rounded-xl hover:shadow-lg transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-700 hover-lift bg-gradient-to-r from-white to-gray-50 dark:from-slate-800 dark:to-slate-700"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {task.title}
                          </h3>
                          {isOverdue && <Badge className="bg-red-500 text-white animate-pulse-slow">Overdue</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{task.description}</p>
                        <div className="flex items-center space-x-3">
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          {assignedUser && (
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Users className="w-3 h-3 mr-1" />
                              {assignedUser.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover-lift"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                )
              })}
            {userTasks.length === 0 && (
              <div className="text-center py-12">
                <CheckSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No tasks found</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Create your first task to get started!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin System Overview */}
      {isAdmin && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              System Overview
            </CardTitle>
            <CardDescription>Overall system statistics and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-1">{users.length}</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Users</p>
                <div className="mt-2 text-xs text-purple-600">
                  {users.filter((u) => u.role === "admin").length} admins
                </div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-1">{tasks.length}</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Tasks</p>
                <div className="mt-2 text-xs text-blue-600">
                  {tasks.filter((t) => t.status === "completed").length} completed
                </div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {tasks.length > 0
                    ? Math.round((tasks.filter((t) => t.status === "completed").length / tasks.length) * 100)
                    : 0}
                  %
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">System Completion</p>
                <div className="mt-2 text-xs text-green-600">Overall progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
