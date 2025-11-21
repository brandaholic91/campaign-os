'use client'

import { useState } from 'react'
import { Database } from '@/lib/supabase/types'
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

type Message = Database['campaign_os']['Tables']['messages']['Row']

interface MessageFormProps {
  campaignId: string
  segmentId: string
  topicId: string
  initialData?: Message
  onSuccess: () => void
  onCancel: () => void
}

export default function MessageForm({
  campaignId,
  segmentId,
  topicId,
  initialData,
  onSuccess,
  onCancel,
}: MessageFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    headline: initialData?.headline || '',
    body: initialData?.body || '',
    proof_point: initialData?.proof_point || '',
    cta: initialData?.cta || '',
    message_type: initialData?.message_type || 'core',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const url = '/api/messages'
      const method = initialData ? 'PUT' : 'POST'
      const body = {
        ...formData,
        campaign_id: campaignId,
        segment_id: segmentId,
        topic_id: topicId,
        id: initialData?.id,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        throw new Error('Failed to save message')
      }

      router.refresh()
      onSuccess()
    } catch (err) {
      setError('An error occurred while saving the message.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData || !confirm('Are you sure you want to delete this message?')) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/messages?id=${initialData.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete message')
      }

      router.refresh()
      onSuccess()
    } catch (err) {
      setError('Failed to delete message')
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
        <Label htmlFor="message_type">Message Type</Label>
        <Select
          value={formData.message_type}
          onValueChange={(value: any) =>
            setFormData({ ...formData, message_type: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="core">Core Message</SelectItem>
            <SelectItem value="supporting">Supporting Point</SelectItem>
            <SelectItem value="contrast">Contrast/Attack</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          value={formData.headline}
          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
          required
          placeholder="Main message headline"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Body Copy</Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          placeholder="Detailed message text..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="proof_point">Proof Point / Evidence</Label>
        <Textarea
          id="proof_point"
          value={formData.proof_point}
          onChange={(e) => setFormData({ ...formData, proof_point: e.target.value })}
          placeholder="Facts, stats, or stories that prove this point..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cta">Call to Action (CTA)</Label>
        <Input
          id="cta"
          value={formData.cta}
          onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
          placeholder="e.g., Sign the petition, Donate now"
        />
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
            {isLoading ? 'Saving...' : 'Save Message'}
          </Button>
        </div>
      </div>
    </form>
  )
}
