import TasksClient from '@/components/tasks/tasks-client'

export default function TasksPage() {
  return (
    <div className="h-full px-4 py-6 lg:px-8">
      <div className="h-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">My Tasks</h1>
        <TasksClient />
      </div>
    </div>
  )
}
