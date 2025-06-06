"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Clock, Calendar, CheckSquare } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: string
  assignedTo: string
  createdBy: string
  documents: any[]
  createdAt: string
  updatedAt: string
}

interface NotificationPanelProps {
  overdueTasks: Task[]
  dueSoonTasks: Task[]
  onViewTask: (taskId: string) => void
  onClose: () => void
}

export default function NotificationPanel({ overdueTasks, dueSoonTasks, onViewTask, onClose }: NotificationPanelProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays === -1) return "Yesterday"
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
    return `In ${diffDays} days`
  }

  const handleTaskClick = (taskId: string) => {
    onViewTask(taskId)
    onClose()
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-red-600 dark:text-red-400">Overdue Tasks</h3>
            <Badge variant="destructive">{overdueTasks.length}</Badge>
          </div>
          <div className="space-y-3">
            {overdueTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                onClick={() => handleTaskClick(task.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-red-900 dark:text-red-100">{task.title}</h4>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1 line-clamp-2">{task.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {task.priority}
                      </Badge>
                      <div className="flex items-center text-xs text-red-600 dark:text-red-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(task.dueDate)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due Soon Tasks */}
      {dueSoonTasks.length > 0 && (
        <div>
          {overdueTasks.length > 0 && <Separator />}
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-yellow-600 dark:text-yellow-400">Due Soon</h3>
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            >
              {dueSoonTasks.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {dueSoonTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors cursor-pointer"
                onClick={() => handleTaskClick(task.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-yellow-900 dark:text-yellow-100">{task.title}</h4>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 line-clamp-2">{task.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {task.priority}
                      </Badge>
                      <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(task.dueDate)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Notifications */}
      {overdueTasks.length === 0 && dueSoonTasks.length === 0 && (
        <div className="text-center py-8">
          <CheckSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">All caught up!</h3>
          <p className="text-gray-500 dark:text-gray-400">No urgent notifications at the moment.</p>
        </div>
      )}

      {/* Quick Actions */}
      {(overdueTasks.length > 0 || dueSoonTasks.length > 0) && (
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onClose()
              // You can add navigation to tasks view here if needed
            }}
          >
            View All Tasks
          </Button>
        </div>
      )}
    </div>
  )
}
