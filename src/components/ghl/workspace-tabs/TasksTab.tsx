'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, PlusCircle } from 'lucide-react';
import TaskSuggestionsDialog from '@/components/tasks/task-suggestions-dialog';
import TaskItem from '@/components/tasks/task-item';
import TaskFormDialog from '@/components/tasks/task-form-dialog';
import { Skeleton } from '@/components/ui/skeleton';

// Define the Task type
interface Task {
  id: string;
  title: string;
  status: 'Todo' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  due_date: string | null;
  ghl_opportunity_id?: string;
}

interface Opportunity {
  id: string;
  name: string;
  contact: {
    name: string;
  };
}

interface TasksTabProps {
  opportunity: Opportunity;
}

export default function TasksTab({ opportunity }: TasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isSuggestionsDialogOpen, setIsSuggestionsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      if (!opportunity.id) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/tasks?opportunityId=${opportunity.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [opportunity.id]);

  const handleSaveTask = async (task: Omit<Task, 'id'>) => {
    const taskToSave = { ...task, ghl_opportunity_id: opportunity.id };
    
    try {
      const response = await fetch('/api/tasks', {
        method: task.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to save task');
      }

      const savedTask = await response.json();
      if (task.id) {
        setTasks(tasks.map(t => t.id === savedTask.id ? savedTask : t));
      } else {
        setTasks([savedTask, ...tasks]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id }),
      });
      setTasks(tasks.filter(t => t.id !== task.id));
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const handleSuggestionAdded = (title: string) => {
    const newTask = {
      title,
      status: 'Todo' as const,
      priority: 'Medium' as const,
      due_date: null,
      ghl_opportunity_id: opportunity.id,
    };
    handleSaveTask(newTask);
  };

  const openFormDialog = (task: Task | null = null) => {
    setSelectedTask(task);
    setIsFormDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-end items-center mb-4 space-x-2">
        <Button variant="outline" onClick={() => setIsSuggestionsDialogOpen(true)}>
          <Sparkles className="mr-2 h-4 w-4" />
          Suggest Tasks
        </Button>
        <Button onClick={() => openFormDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.length > 0 ? (
            tasks.map(task => (
              <TaskItem key={task.id} task={task} onEdit={openFormDialog} onDelete={handleDeleteTask} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center p-4">No tasks for this opportunity yet.</p>
          )}
        </div>
      )}
      {isFormDialogOpen && (
        <TaskFormDialog
          isOpen={isFormDialogOpen}
          onClose={() => setIsFormDialogOpen(false)}
          onSave={handleSaveTask}
          task={selectedTask}
        />
      )}
      {isSuggestionsDialogOpen && (
        <TaskSuggestionsDialog
          isOpen={isSuggestionsDialogOpen}
          onClose={() => setIsSuggestionsDialogOpen(false)}
          onTaskAdd={handleSuggestionAdded}
          opportunityName={opportunity.name}
          contactName={opportunity.contact.name}
        />
      )}
    </div>
  );
}
