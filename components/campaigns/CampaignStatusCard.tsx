'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type CampaignStatus = 'planning' | 'running' | 'closed'

const statusLabels: Record<CampaignStatus, string> = {
  planning: 'Tervezés',
  running: 'Fut',
  closed: 'Lezárva',
}

interface CampaignStatusCardProps {
  campaignId: string
  currentStatus: CampaignStatus | null
  updatedAt: string | null
}

export function CampaignStatusCard({ campaignId, currentStatus, updatedAt }: CampaignStatusCardProps) {
  const router = useRouter()
  const [status, setStatus] = useState<CampaignStatus>(currentStatus || 'planning')
  const [isUpdating, setIsUpdating] = useState(false)

  // Update status when currentStatus prop changes
  useEffect(() => {
    if (currentStatus) {
      setStatus(currentStatus)
    }
  }, [currentStatus])

  async function handleStatusChange(newStatus: CampaignStatus) {
    if (newStatus === status) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update status')
      }

      setStatus(newStatus)
      router.refresh()
      toast.success('Státusz sikeresen frissítve')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error(error instanceof Error ? error.message : 'Hiba történt a státusz frissítésekor')
      // Revert to previous status on error
      setStatus(currentStatus || 'planning')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-soft flex flex-col justify-between h-full min-h-[160px]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Státusz</span>
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div>
        <Select
          value={status}
          onValueChange={(value) => handleStatusChange(value as CampaignStatus)}
          disabled={isUpdating}
        >
          <SelectTrigger className={`h-auto p-0 border-none bg-transparent shadow-none focus:ring-0 text-2xl font-display font-bold w-full justify-between ${
            status === 'running' ? 'text-green-600' :
            status === 'closed' ? 'text-gray-600' :
            'text-blue-600'
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planning">Tervezés</SelectItem>
            <SelectItem value="running">Fut</SelectItem>
            <SelectItem value="closed">Lezárva</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-400 block mt-1">
          Utolsó módosítás: {updatedAt 
            ? (() => {
                const date = new Date(updatedAt)
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                const hours = String(date.getHours()).padStart(2, '0')
                const minutes = String(date.getMinutes()).padStart(2, '0')
                return `${year}-${month}-${day} ${hours}:${minutes}`
              })()
            : 'most'}
        </span>
      </div>
    </div>
  )
}

