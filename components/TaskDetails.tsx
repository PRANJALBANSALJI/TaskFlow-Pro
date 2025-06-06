"use client"

import { useTasks } from "@/contexts/TaskContext"
import { useUsers } from "@/contexts/UserContext"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, User, FileText, Download, Clock, Edit } from "lucide-react"

interface TaskDetailsProps {
  taskId: string
  onBack: () => void
}

export default function TaskDetails({ taskId, onBack }: TaskDetailsProps) {
  const { getTaskById, updateTask } = useTasks()
  const { getUserById } = useUsers()
  const { user, isAdmin } = useAuth()

  const task = getTaskById(taskId)
  const assignedUser = task ? getUserById(task.assignedTo) : null
  const createdByUser = task ? getUserById(task.createdBy) : null

  if (!task) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Task not found</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed"
  const canEdit = isAdmin || task.createdBy === user?.id

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "todo":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleStatusChange = (newStatus: "todo" | "in-progress" | "completed") => {
    updateTask(task.id, { status: newStatus })
  }

  const handleDownloadDocument = (doc: any) => {
    // Simulate document download
    alert(`Downloading ${doc.name}...`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tasks</span>
        </Button>
        {canEdit && (
          <Button variant="outline" className="flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Edit Task</span>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              <CardDescription className="mt-2">
                Created on {new Date(task.createdAt).toLocaleDateString()} by {createdByUser?.name}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(task.priority)}>{task.priority} priority</Badge>
              <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
              {isOverdue && <Badge variant="destructive">Overdue</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-sm text-gray-600">
                    {new Date(task.dueDate).toLocaleDateString()}
                    {isOverdue && <span className="text-red-600 ml-2">(Overdue)</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Assigned To</p>
                  <p className="text-sm text-gray-600">
                    {assignedUser ? `${assignedUser.name} (${assignedUser.email})` : "Unassigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-gray-600">
                    {new Date(task.updatedAt).toLocaleDateString()} at {new Date(task.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Quick Status Update</p>
                <div className="flex space-x-2">
                  <Button
                    variant={task.status === "todo" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("todo")}
                    disabled={!canEdit && task.assignedTo !== user?.id}
                  >
                    To Do
                  </Button>
                  <Button
                    variant={task.status === "in-progress" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("in-progress")}
                    disabled={!canEdit && task.assignedTo !== user?.id}
                  >
                    In Progress
                  </Button>
                  <Button
                    variant={task.status === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("completed")}
                    disabled={!canEdit && task.assignedTo !== user?.id}
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {task.documents && task.documents.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <h3 className="font-medium">Attached Documents ({task.documents.length})</h3>
                </div>
                <div className="space-y-3">
                  {task.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-6 h-6 text-red-600" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-600">
                            {doc.type} • {(doc.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc)}
                        className="flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
