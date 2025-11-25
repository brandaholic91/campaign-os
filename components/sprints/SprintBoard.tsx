'use client'

import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import TaskCard from './TaskCard'
import SprintForm from './SprintForm'
import TaskForm from './TaskForm'
import { format } from 'date-fns'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/supabase/types'

// Local type definitions for sprints, tasks, and channels
type Sprint = Database['campaign_os']['Tables']['sprints']['Row'] & {
  focus_segments?: string[]
  focus_topics?: string[]
  focus_channels?: string[]
  success_indicators?: any[]
}

type Task = {
  id: string
  campaign_id: string
  sprint_id?: string | null
  channel_id?: string | null
  title: string
  description?: string | null
  category?: string | null
  status?: 'todo' | 'in_progress' | 'done'
  assignee?: string | null
  due_date?: string | null
  created_at?: string
  updated_at?: string
}

type Channel = {
  id: string
  name: string
  type?: string
  created_at?: string
  updated_at?: string
}

interface SprintBoardProps {
  campaignId: string
  sprints: Sprint[]
  tasks: Task[]
  channels: Channel[]
}

type TaskStatus = 'todo' | 'in_progress' | 'done'

interface DroppableColumnProps {
  id: TaskStatus
  title: string
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onCreateTask: () => void
  emptyMessage: string
  titleColor: string
  enableDragDrop?: boolean
}

function DroppableColumn({
  id,
  title,
  tasks,
  onTaskClick,
  onCreateTask,
  emptyMessage,
  titleColor,
  enableDragDrop = true,
}: DroppableColumnProps) {
  // Always call the hook (React rules), but disable it when drag and drop is not enabled
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'column',
      status: id,
    },
    disabled: !enableDragDrop,
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className={`text-xs font-bold ${titleColor} uppercase tracking-wider`}>
          {title} ({tasks.length})
        </h3>
        <button 
          className="text-gray-400 hover:text-gray-600"
          onClick={onCreateTask}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 bg-gray-100/50 rounded-2xl p-3 border border-gray-200/50 overflow-y-auto transition-colors ${
          isOver ? 'bg-blue-50 border-blue-300' : ''
        }`}
      >
        {tasks.length === 0 ? (
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
            {emptyMessage}
          </div>
        ) : enableDragDrop ? (
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={onTaskClick} enableDragDrop={enableDragDrop} />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} enableDragDrop={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SprintBoard({
  campaignId,
  sprints,
  tasks,
  channels,
}: SprintBoardProps) {
  const router = useRouter()
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(
    sprints.length > 0 ? sprints[0].id : null
  )
  const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | undefined>(undefined)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  // Optimistic updates: track task status changes locally
  const [optimisticTasks, setOptimisticTasks] = useState<Map<string, TaskStatus>>(new Map())
  // Prevent hydration mismatch by only rendering DndContext on client
  const [isMounted, setIsMounted] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px mozgás kell a drag aktiválásához
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Set mounted flag after component mounts on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Update selected sprint if sprints change (e.g. after delete)
  useEffect(() => {
    if (sprints.length > 0 && !sprints.find((s) => s.id === selectedSprintId)) {
      setSelectedSprintId(sprints[0].id)
    } else if (sprints.length === 0) {
      setSelectedSprintId(null)
    }
  }, [sprints, selectedSprintId])

  const currentSprint = sprints.find((s) => s.id === selectedSprintId)
  // Apply optimistic updates to tasks
  const sprintTasks = tasks
    .filter((t) => t.sprint_id === selectedSprintId)
    .map((task) => {
      const optimisticStatus = optimisticTasks.get(task.id)
      if (optimisticStatus) {
        return { ...task, status: optimisticStatus }
      }
      return task
    })

  const todoTasks = sprintTasks.filter((t) => t.status === 'todo')
  const inProgressTasks = sprintTasks.filter((t) => t.status === 'in_progress')
  const doneTasks = sprintTasks.filter((t) => t.status === 'done')

  // Reset optimistic updates when tasks prop changes (after refresh)
  useEffect(() => {
    setOptimisticTasks(new Map())
  }, [tasks])

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = sprintTasks.find((t) => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const task = sprintTasks.find((t) => t.id === taskId)
    if (!task) return

    // Determine the target status
    let newStatus: TaskStatus | null = null
    
    // Check if dropped on a column (status)
    if (['todo', 'in_progress', 'done'].includes(over.id as string)) {
      newStatus = over.id as TaskStatus
    } else {
      // Dropped on another task - find which column it belongs to
      const targetTask = sprintTasks.find((t) => t.id === over.id)
      if (targetTask) {
        newStatus = targetTask.status as TaskStatus
      }
    }

    // If no valid status found or status hasn't changed, do nothing
    if (!newStatus || task.status === newStatus) return

    // Optimistic update: immediately update local state
    setOptimisticTasks((prev) => {
      const next = new Map(prev)
      next.set(taskId, newStatus)
      return next
    })

    setIsUpdating(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          status: newStatus,
          title: task.title,
          description: task.description,
          category: task.category,
          channel_id: task.channel_id,
          due_date: task.due_date,
          assignee: task.assignee,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task status')
      }

      // Refresh to get the latest data from server
      router.refresh()
      
      // Clear optimistic update after successful API call
      // The refresh will update the tasks prop, which will reset optimisticTasks
    } catch (error) {
      console.error('Error updating task status:', error)
      // Revert optimistic update on error
      setOptimisticTasks((prev) => {
        const next = new Map(prev)
        next.delete(taskId)
        return next
      })
      // Optionally show an error toast here
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Sprint Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {sprints.length > 0 ? (
            <div className="relative group">
              <Select
                value={selectedSprintId || ''}
                onValueChange={setSelectedSprintId}
              >
                <SelectTrigger className="flex items-center gap-2 pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 font-medium text-sm hover:border-primary-200 hover:text-primary-700 transition-all w-[300px]">
                  <SelectValue placeholder="Select sprint" />
                </SelectTrigger>
                <SelectContent>
                  {sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Nincs sprint létrehozva</div>
          )}
          {currentSprint && (
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleEditSprint}
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
        <button 
          onClick={handleCreateSprint}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-primary-600/20"
        >
          <Plus className="w-4 h-4" />
          New Sprint
        </button>
      </div>

      {currentSprint && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap">
          <span>{format(new Date(currentSprint.start_date), 'MMM d')} - {format(new Date(currentSprint.end_date), 'MMM d, yyyy')}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          {currentSprint.status && (
            <>
              <Badge
                variant="outline"
                className={
                  currentSprint.status === 'active'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : currentSprint.status === 'closed'
                    ? 'bg-gray-50 text-gray-700 border-gray-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }
              >
                {currentSprint.status === 'planned'
                  ? 'Tervezett'
                  : currentSprint.status === 'active'
                  ? 'Aktív'
                  : currentSprint.status === 'closed'
                  ? 'Lezárva'
                  : currentSprint.status}
              </Badge>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            </>
          )}
          <span className="font-medium text-gray-900">Goal: {currentSprint.focus_goal || 'No goal set'}</span>
        </div>
      )}

      {/* Kanban Board */}
      {currentSprint ? (
        isMounted ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-6">
              <DroppableColumn
                id="todo"
                title="To Do"
                tasks={todoTasks}
                onTaskClick={handleEditTask}
                onCreateTask={() => handleCreateTask('todo')}
                emptyMessage="Nincs aktív feladat"
                titleColor="text-gray-500"
              />
              <DroppableColumn
                id="in_progress"
                title="In Progress"
                tasks={inProgressTasks}
                onTaskClick={handleEditTask}
                onCreateTask={() => handleCreateTask('in_progress')}
                emptyMessage="Nincs aktív feladat"
                titleColor="text-blue-500"
              />
              <DroppableColumn
                id="done"
                title="Done"
                tasks={doneTasks}
                onTaskClick={handleEditTask}
                onCreateTask={() => handleCreateTask('done')}
                emptyMessage="Nincs kész feladat"
                titleColor="text-emerald-500"
              />
            </div>
            <DragOverlay>
              {activeTask ? (
                <div className="opacity-80">
                  <TaskCard task={activeTask} onClick={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          // Fallback without DndContext during SSR to prevent hydration mismatch
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-6">
            <DroppableColumn
              id="todo"
              title="To Do"
              tasks={todoTasks}
              onTaskClick={handleEditTask}
              onCreateTask={() => handleCreateTask('todo')}
              emptyMessage="Nincs aktív feladat"
              titleColor="text-gray-500"
              enableDragDrop={false}
            />
            <DroppableColumn
              id="in_progress"
              title="In Progress"
              tasks={inProgressTasks}
              onTaskClick={handleEditTask}
              onCreateTask={() => handleCreateTask('in_progress')}
              emptyMessage="Nincs aktív feladat"
              titleColor="text-blue-500"
              enableDragDrop={false}
            />
            <DroppableColumn
              id="done"
              title="Done"
              tasks={doneTasks}
              onTaskClick={handleEditTask}
              onCreateTask={() => handleCreateTask('done')}
              emptyMessage="Nincs kész feladat"
              titleColor="text-emerald-500"
              enableDragDrop={false}
            />
          </div>
        )
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
          <p className="text-gray-500 mb-4">Hozz létre egy sprintet a kezdéshez</p>
          <button 
            onClick={handleCreateSprint}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-primary-600/20"
          >
            <Plus className="w-4 h-4" />
            Create First Sprint
          </button>
        </div>
      )}

      {/* Sprint Dialog */}
      <Dialog open={isSprintDialogOpen} onOpenChange={setIsSprintDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
