'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'

type Sprint = {
  id: string
  campaign_id: string
  name: string
  start_date: string
  end_date: string
  focus_goal?: string | null
  focus_channels?: any
  status?: string
  created_at?: string
  updated_at?: string
}

interface SprintFormProps {
  campaignId: string
  initialData?: Sprint
  onSuccess: () => void
  onCancel: () => void
}

export default function SprintForm({
  campaignId,
  initialData,
  onSuccess,
  onCancel,
}: SprintFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    focus_goal: initialData?.focus_goal || '',
    status: initialData?.status || 'planned',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const url = '/api/sprints'
      const method = initialData ? 'PUT' : 'POST'
      const body = {
        ...formData,
        campaign_id: campaignId,
        id: initialData?.id,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save sprint')
      }

      router.refresh()
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the sprint.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData || !confirm('Are you sure you want to delete this sprint?')) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/sprints?id=${initialData.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete sprint')
      }

      router.refresh()
      onSuccess()
    } catch (err) {
      setError('Failed to delete sprint')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Sprint Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="e.g., Week 1: Awareness Launch"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="focus_goal">Focus Goal</Label>
        <Input
          id="focus_goal"
          value={formData.focus_goal}
          onChange={(e) => setFormData({ ...formData, focus_goal: e.target.value })}
          placeholder="Main objective for this sprint"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: any) =>
            setFormData({ ...formData, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between pt-4">
        {initialData ? (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Delete
          </Button>
        ) : (
          <div></div>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Sprint'}
          </Button>
        </div>
      </div>
    </form>
  )
}
