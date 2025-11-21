'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Settings } from 'lucide-react'
import TaskCard from './TaskCard'
import SprintForm from './SprintForm'
import TaskForm from './TaskForm'
import { format } from 'date-fns'

type Sprint = Database['campaign_os']['Tables']['sprints']['Row']
type Task = Database['campaign_os']['Tables']['tasks']['Row']
type Channel = Database['campaign_os']['Tables']['channels']['Row']

interface SprintBoardProps {
  campaignId: string
  sprints: Sprint[]
  tasks: Task[]
  channels: Channel[]
}

export default function SprintBoard({
  campaignId,
  sprints,
  tasks,
  channels,
}: SprintBoardProps) {
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(
    sprints.length > 0 ? sprints[0].id : null
  )
  const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | undefined>(undefined)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)

  // Update selected sprint if sprints change (e.g. after delete)
  useEffect(() => {
    if (sprints.length > 0 && !sprints.find((s) => s.id === selectedSprintId)) {
      setSelectedSprintId(sprints[0].id)
    } else if (sprints.length === 0) {
      setSelectedSprintId(null)
    }
  }, [sprints, selectedSprintId])

  const currentSprint = sprints.find((s) => s.id === selectedSprintId)
  const sprintTasks = tasks.filter((t) => t.sprint_id === selectedSprintId)

  const todoTasks = sprintTasks.filter((t) => t.status === 'todo')
  const inProgressTasks = sprintTasks.filter((t) => t.status === 'in_progress')
  const doneTasks = sprintTasks.filter((t) => t.status === 'done')

  const handleCreateSprint = () => {
    setEditingSprint(undefined)
    setIsSprintDialogOpen(true)
  }

  const handleEditSprint = () => {
    if (currentSprint) {
      setEditingSprint(currentSprint)
      setIsSprintDialogOpen(true)
    }
  }

  const handleCreateTask = (status: 'todo' | 'in_progress' | 'done' = 'todo') => {
    setEditingTask(undefined)
    // Pre-set status if needed, but TaskForm defaults to todo.
    // We could pass initial status if we wanted to add to specific column.
    setIsTaskDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskDialogOpen(true)
  }

  const onSprintSaved = () => {
    setIsSprintDialogOpen(false)
    // If new sprint created, it might be good to select it, but we rely on refresh
  }

  const onTaskSaved = () => {
    setIsTaskDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {sprints.length > 0 ? (
            <Select
              value={selectedSprintId || ''}
              onValueChange={setSelectedSprintId}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select sprint" />
              </SelectTrigger>
              <SelectContent>
                {sprints.map((sprint) => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    {sprint.name} ({sprint.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-muted-foreground text-sm">No sprints created yet</div>
          )}
          
          {currentSprint && (
            <Button variant="ghost" size="icon" onClick={handleEditSprint}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button onClick={handleCreateSprint}>
          <Plus className="h-4 w-4 mr-2" />
          New Sprint
        </Button>
      </div>

      {currentSprint ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {format(new Date(currentSprint.start_date), 'MMM d')} -{' '}
                {format(new Date(currentSprint.end_date), 'MMM d, yyyy')}
              </span>
              <span>•</span>
              <span className="font-medium text-foreground">
                Goal: {currentSprint.focus_goal || 'No goal set'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-300px)] min-h-[500px]">
            {/* Todo Column */}
            <div className="flex flex-col gap-4 bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  To Do ({todoTasks.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={() => handleCreateTask('todo')}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {todoTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={handleEditTask} />
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="flex flex-col gap-4 bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-blue-600/80 dark:text-blue-400/80">
                  In Progress ({inProgressTasks.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={() => handleCreateTask('in_progress')}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {inProgressTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={handleEditTask} />
                ))}
              </div>
            </div>

            {/* Done Column */}
            <div className="flex flex-col gap-4 bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-green-600/80 dark:text-green-400/80">
                  Done ({doneTasks.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={() => handleCreateTask('done')}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {doneTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={handleEditTask} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[400px] border border-dashed rounded-lg bg-muted/10">
          <p className="text-muted-foreground mb-4">Create a sprint to get started</p>
          <Button onClick={handleCreateSprint}>Create First Sprint</Button>
        </div>
      )}

      {/* Sprint Dialog */}
      <Dialog open={isSprintDialogOpen} onOpenChange={setIsSprintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSprint ? 'Edit Sprint' : 'Create Sprint'}
            </DialogTitle>
          </DialogHeader>
          <SprintForm
            campaignId={campaignId}
            initialData={editingSprint}
            onSuccess={onSprintSaved}
            onCancel={() => setIsSprintDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Edit Task' : 'Create Task'}
            </DialogTitle>
          </DialogHeader>
          {selectedSprintId && (
            <TaskForm
              campaignId={campaignId}
              sprintId={selectedSprintId}
              channels={channels}
              initialData={editingTask}
              onSuccess={onTaskSaved}
              onCancel={() => setIsTaskDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
