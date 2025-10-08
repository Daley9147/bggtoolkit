'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Inbox, CheckCircle2 } from 'lucide-react'
import TaskFormDialog from './task-form-dialog'
import TaskItem from './task-item'
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Define the Task type
export interface Task {
  id: string
  title: string
  status: 'Todo' | 'In Progress' | 'Completed'
  priority: 'Low' | 'Medium' | 'High'
  due_date: string | null
}

function EmptyState({ message, icon: Icon }: { message: string, icon: React.ElementType }) {
  return (
    <div className="text-center p-8 flex flex-col items-center justify-center">
      <Icon className="h-10 w-10 text-muted-foreground mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export default function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch('/api/tasks')
        if (!response.ok) {
          throw new Error('Failed to fetch tasks')
        }
        const data = await response.json()
        setTasks(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const handleSaveTask = async (task: Task) => {
    const originalTask = tasks.find(t => t.id === task.id);

    if (task.id) {
      // Update existing task
      try {
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task),
        })
        if (!response.ok) throw new Error('Failed to update task')
        const updatedTask = await response.json()
        setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)))

        // Log action if task is completed
        if (updatedTask.status === 'Completed' && originalTask?.status !== 'Completed') {
          await fetch('/api/analytics/log-action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'TASK_COMPLETED',
              details: { taskId: updatedTask.id, title: updatedTask.title },
            }),
          })
        }

      } catch (error) {
        console.error(error)
      }
    } else {
      // Create new task
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task),
        })
        if (!response.ok) throw new Error('Failed to create task')
        const newTask = await response.json()
        setTasks([newTask, ...tasks])
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleDeleteTask = async () => {
    if (!selectedTask) return
    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedTask.id }),
      })
      if (!response.ok) throw new Error('Failed to delete task')
      setTasks(tasks.filter((t) => t.id !== selectedTask.id))
      setIsDeleteDialogOpen(false)
      setSelectedTask(null)
    } catch (error) {
      console.error(error)
    }
  }

  const openDialog = (task: Task | null = null) => {
    setSelectedTask(task)
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task)
    setIsDeleteDialogOpen(true)
  }

  const highPriorityTasks = tasks.filter(t => t.status !== 'Completed' && t.priority === 'High');
  const mediumPriorityTasks = tasks.filter(t => t.status !== 'Completed' && t.priority === 'Medium');
  const lowPriorityTasks = tasks.filter(t => t.status !== 'Completed' && t.priority === 'Low');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  return (
    <div>
      <div className="flex justify-end items-center mb-4">
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-2">
            <Accordion type="single" collapsible defaultValue="high-priority" className="w-full">
              <AccordionItem value="high-priority">
                <AccordionTrigger className="bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-lg font-semibold text-blue-800">
                  High Priority ({highPriorityTasks.length})
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  {highPriorityTasks.length > 0 ? (
                    highPriorityTasks.map(task => <TaskItem key={task.id} task={task} onEdit={openDialog} onDelete={openDeleteDialog} />)
                  ) : (
                    <EmptyState message="No high priority tasks. You're all clear!" icon={Inbox} />
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="medium-priority">
                <AccordionTrigger className="bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-lg font-semibold text-blue-800">
                  Medium Priority ({mediumPriorityTasks.length})
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  {mediumPriorityTasks.length > 0 ? (
                    mediumPriorityTasks.map(task => <TaskItem key={task.id} task={task} onEdit={openDialog} onDelete={openDeleteDialog} />)
                  ) : (
                    <EmptyState message="No medium priority tasks." icon={Inbox} />
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="low-priority">
                <AccordionTrigger className="bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-lg font-semibold text-blue-800">
                  Low Priority ({lowPriorityTasks.length})
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  {lowPriorityTasks.length > 0 ? (
                    lowPriorityTasks.map(task => <TaskItem key={task.id} task={task} onEdit={openDialog} onDelete={openDeleteDialog} />)
                  ) : (
                    <EmptyState message="No low priority tasks." icon={Inbox} />
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="completed">
                <AccordionTrigger className="bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-lg font-semibold text-blue-800">
                  Completed ({completedTasks.length})
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  {completedTasks.length > 0 ? (
                    completedTasks.map(task => <TaskItem key={task.id} task={task} onEdit={openDialog} onDelete={openDeleteDialog} />)
                  ) : (
                    <EmptyState message="No tasks completed yet." icon={CheckCircle2} />
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
      {isDialogOpen && (
        <TaskFormDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false)
            setSelectedTask(null)
          }}
          onSave={handleSaveTask}
          task={selectedTask}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
