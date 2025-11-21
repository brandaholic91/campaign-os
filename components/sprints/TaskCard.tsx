'use client'

import { Database } from '@/lib/supabase/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, User } from 'lucide-react'
import { format } from 'date-fns'

type Task = Database['campaign_os']['Tables']['tasks']['Row']

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'creative':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'copy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'social_setup':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'ads_setup':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'analytics':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
      case 'coordination':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(task)}
    >
      <CardHeader className="p-3 pb-0 space-y-1">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-sm font-medium leading-tight">
            {task.title}
          </CardTitle>
        </div>
        {task.category && (
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 font-normal ${getCategoryColor(
              task.category
            )}`}
          >
            {task.category}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-3 pt-2 space-y-2">
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
            </div>
          )}
          {task.assignee && (
            <div className="flex items-center gap-1 ml-auto">
              <User className="h-3 w-3" />
              <span className="max-w-[60px] truncate">{task.assignee}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
