"use client"

import { useTasks } from "@/contexts/TaskContext"
import { useUsers } from "@/contexts/UserContext"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Clock, Users, CheckCircle, AlertTriangle } from "lucide-react"

export default function Analytics() {
  const { tasks } = useTasks()
  const { users } = useUsers()
  const { user, isAdmin } = useAuth()

  // Filter tasks based on user role
  const userTasks = isAdmin ? tasks : tasks.filter((task) => task.assignedTo === user?.id)

  // Calculate analytics
  const totalTasks = userTasks.length
  const completedTasks = userTasks.filter((task) => task.status === "completed").length
  const inProgressTasks = userTasks.filter((task) => task.status === "in-progress").length
  const todoTasks = userTasks.filter((task) => task.status === "todo").length
  const overdueTasks = userTasks.filter(
    (task) => task.status !== "completed" && new Date(task.dueDate) < new Date(),
  ).length

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Priority breakdown
  const highPriorityTasks = userTasks.filter((task) => task.priority === "high").length
  const mediumPriorityTasks = userTasks.filter((task) => task.priority === "medium").length
  const lowPriorityTasks = userTasks.filter((task) => task.priority === "low").length

  // Tasks by user (for admin)
  const tasksByUser = isAdmin
    ? users.map((user) => ({
        user,
        taskCount: tasks.filter((task) => task.assignedTo === user.id).length,
        completedCount: tasks.filter((task) => task.assignedTo === user.id && task.status === "completed").length,
      }))
    : []

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentTasks = userTasks.filter((task) => new Date(task.createdAt) >= sevenDaysAgo).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Track your productivity and task completion metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{recentTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks created this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Status Breakdown</CardTitle>
            <CardDescription>Distribution of tasks by current status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm">To Do</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{todoTasks}</span>
                <Badge variant="secondary">{totalTasks > 0 ? Math.round((todoTasks / totalTasks) * 100) : 0}%</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{inProgressTasks}</span>
                <Badge variant="secondary">
                  {totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{completedTasks}</span>
                <Badge variant="secondary">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Tasks organized by priority level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">High Priority</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{highPriorityTasks}</span>
                <Badge variant="destructive">
                  {totalTasks > 0 ? Math.round((highPriorityTasks / totalTasks) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Medium Priority</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{mediumPriorityTasks}</span>
                <Badge variant="secondary">
                  {totalTasks > 0 ? Math.round((mediumPriorityTasks / totalTasks) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Low Priority</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{lowPriorityTasks}</span>
                <Badge variant="secondary">
                  {totalTasks > 0 ? Math.round((lowPriorityTasks / totalTasks) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance (Admin only) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Task distribution and completion rates by team member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasksByUser.map(({ user, taskCount, completedCount }) => {
                const userCompletionRate = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0
                return (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{taskCount} tasks</span>
                        <Badge variant={userCompletionRate >= 80 ? "default" : "secondary"}>
                          {userCompletionRate}% complete
                        </Badge>
                      </div>
                      <Progress value={userCompletionRate} className="w-24 mt-1" />
                    </div>
                  </div>
                )
              })}
              {tasksByUser.length === 0 && <p className="text-center text-gray-500 py-4">No team members found</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Productivity Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Insights</CardTitle>
          <CardDescription>Recommendations based on your task patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completionRate < 50 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Low Completion Rate</p>
                  <p className="text-xs text-yellow-700">
                    Consider breaking down large tasks into smaller, manageable pieces.
                  </p>
                </div>
              </div>
            )}
            {overdueTasks > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <Clock className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Overdue Tasks Detected</p>
                  <p className="text-xs text-red-700">Focus on completing overdue tasks first to get back on track.</p>
                </div>
              </div>
            )}
            {completionRate >= 80 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Great Job!</p>
                  <p className="text-xs text-green-700">
                    You're maintaining an excellent completion rate. Keep up the good work!
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
