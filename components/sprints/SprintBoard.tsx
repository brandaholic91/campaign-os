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
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <span>{format(new Date(currentSprint.start_date), 'MMM d')} - {format(new Date(currentSprint.end_date), 'MMM d, yyyy')}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span className="font-medium text-gray-900">Goal: {currentSprint.focus_goal || 'No goal set'}</span>
        </div>
      )}

      {/* Kanban Board */}
      {currentSprint ? (
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">To Do ({todoTasks.length})</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => handleCreateTask('todo')}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 bg-gray-100/50 rounded-2xl p-3 border border-gray-200/50 overflow-y-auto">
              {todoTasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
                  Nincs aktív feladat
                </div>
              ) : (
                <div className="space-y-3">
                  {todoTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onClick={handleEditTask} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider">In Progress ({inProgressTasks.length})</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => handleCreateTask('in_progress')}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 bg-gray-100/50 rounded-2xl p-3 border border-gray-200/50 overflow-y-auto">
              {inProgressTasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
                  Nincs aktív feladat
                </div>
              ) : (
                <div className="space-y-3">
                  {inProgressTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onClick={handleEditTask} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Done Column */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Done ({doneTasks.length})</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => handleCreateTask('done')}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 bg-gray-100/50 rounded-2xl p-3 border border-gray-200/50 overflow-y-auto">
              {doneTasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
                  Nincs kész feladat
                </div>
              ) : (
                <div className="space-y-3">
                  {doneTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onClick={handleEditTask} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
