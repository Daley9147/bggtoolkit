'use client'

import { Task } from './tasks-client'
import { Button } from '@/components/ui/button'
import { MoreVertical, Trash2, Edit } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

const priorityColors = {
  High: 'bg-red-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-green-500',
}

export default function TaskItem({ task, onEdit, onDelete }: TaskItemProps) {
  const isCompleted = task.status === 'Completed';

  return (
    <div className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 transition-colors">
      <div>
        <p className={cn(
          "font-semibold",
          { "line-through text-muted-foreground": isCompleted }
        )}>
          {task.title}
        </p>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 rounded-full', priorityColors[task.priority])} />
            <span>{task.priority}</span>
          </div>
          {task.due_date && <span>Due: {format(new Date(task.due_date), 'PPP')}</span>}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isCompleted}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(task)} className="text-red-500">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
