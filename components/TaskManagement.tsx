"use client"

import type React from "react"

import { useState } from "react"
import { useTasks } from "@/contexts/TaskContext"
import { useUsers } from "@/contexts/UserContext"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Search, FileText, Calendar } from "lucide-react"

interface TaskManagementProps {
  onViewTask: (taskId: string) => void
}

export default function TaskManagement({ onViewTask }: TaskManagementProps) {
  const { tasks, createTask, updateTask, deleteTask } = useTasks()
  const { users } = useUsers()
  const { user, isAdmin } = useAuth()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("dueDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo" as "todo" | "in-progress" | "completed",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
    assignedTo: "",
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [error, setError] = useState("")

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      // Admin sees all tasks, users see only their assigned tasks
      if (!isAdmin && task.assignedTo !== user?.id) return false

      // Search filter
      if (
        searchTerm &&
        !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }

      // Status filter
      if (statusFilter !== "all" && task.status !== statusFilter) return false

      // Priority filter
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false

      // Assignee filter
      if (assigneeFilter !== "all" && task.assignedTo !== assigneeFilter) return false

      return true
    })
    .sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case "dueDate":
          aValue = new Date(a.dueDate)
          bValue = new Date(b.dueDate)
          break
        case "priority":
          const priorityOrder = { low: 1, medium: 2, high: 3 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case "status":
          const statusOrder = { todo: 1, "in-progress": 2, completed: 3 }
          aValue = statusOrder[a.status]
          bValue = statusOrder[b.status]
          break
        default:
          aValue = a.createdAt
          bValue = b.createdAt
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const handleCreateTask = () => {
    if (!formData.title || !formData.description || !formData.dueDate || !formData.assignedTo) {
      setError("All fields are required")
      return
    }

    // Simulate file upload
    const documents = selectedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }))

    createTask({
      ...formData,
      createdBy: user?.id || "",
      documents,
    })

    setFormData({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
      assignedTo: "",
    })
    setSelectedFiles([])
    setIsCreateDialogOpen(false)
    setError("")
  }

  const handleEditTask = () => {
    if (!formData.title || !formData.description || !formData.dueDate || !formData.assignedTo) {
      setError("All fields are required")
      return
    }

    // Simulate file upload for new files
    const newDocuments = selectedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }))

    const existingDocuments = editingTask?.documents || []
    const allDocuments = [...existingDocuments, ...newDocuments]

    updateTask(editingTask.id, {
      ...formData,
      documents: allDocuments,
    })

    setIsEditDialogOpen(false)
    setEditingTask(null)
    setFormData({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
      assignedTo: "",
    })
    setSelectedFiles([])
    setError("")
  }

  const openEditDialog = (task: any) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo,
    })
    setSelectedFiles([])
    setIsEditDialogOpen(true)
    setError("")
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 3) {
      setError("Maximum 3 files allowed")
      return
    }

    const pdfFiles = files.filter((file) => file.type === "application/pdf")
    if (pdfFiles.length !== files.length) {
      setError("Only PDF files are allowed")
      return
    }

    setSelectedFiles(files)
    setError("")
  }

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600">Create, manage, and track your tasks</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Add a new task to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="create-title">Title</Label>
                <Input
                  id="create-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-dueDate">Due Date</Label>
                  <Input
                    id="create-dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-assignedTo">Assign To</Label>
                  <Select
                    value={formData.assignedTo}
                    onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-users" disabled>
                          No users available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-files">Attach Documents (PDF only, max 3)</Label>
                <Input id="create-files" type="file" multiple accept=".pdf" onChange={handleFileChange} />
                {selectedFiles.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Selected files: {selectedFiles.map((f) => f.name).join(", ")}
                  </div>
                )}
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tasks by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              {isAdmin && (
                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Assignees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                {sortOrder === "asc" ? "↑" : "↓"} {sortOrder.toUpperCase()}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
          <CardDescription>{isAdmin ? "All tasks in the system" : "Your assigned tasks"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const assignedUser = users.find((u) => u.id === task.assignedTo)
              const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed"

              return (
                <div key={task.id} className={`p-4 border rounded-lg ${isOverdue ? "border-red-200 bg-red-50" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                        {task.documents.length > 0 && (
                          <div className="flex items-center text-xs text-gray-500">
                            <FileText className="w-3 h-3 mr-1" />
                            {task.documents.length} file(s)
                          </div>
                        )}
                      </div>
                      {assignedUser && <p className="text-xs text-gray-500">Assigned to: {assignedUser.name}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => onViewTask(task.id)}>
                        View
                      </Button>
                      {(isAdmin || task.createdBy === user?.id) && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(task)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredTasks.length === 0 && (
              <p className="text-center text-gray-500 py-8">No tasks found matching your criteria.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Task title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Task description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-assignedTo">Assign To</Label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users" disabled>
                        No users available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editingTask?.documents && editingTask.documents.length > 0 && (
              <div className="space-y-2">
                <Label>Existing Documents</Label>
                <div className="space-y-1">
                  {editingTask.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center text-sm text-gray-600">
                      <FileText className="w-4 h-4 mr-2" />
                      {doc.name} ({(doc.size / 1024).toFixed(1)} KB)
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-files">Add More Documents (PDF only, max 3 total)</Label>
              <Input id="edit-files" type="file" multiple accept=".pdf" onChange={handleFileChange} />
              {selectedFiles.length > 0 && (
                <div className="text-sm text-gray-600">New files: {selectedFiles.map((f) => f.name).join(", ")}</div>
              )}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask}>Update Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
