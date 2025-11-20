'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

interface DeleteCampaignButtonProps {
  campaignId: string
}

export function DeleteCampaignButton({ campaignId }: DeleteCampaignButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Biztosan törölni szeretnéd ezt a kampányt? Ez a művelet nem visszavonható.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete campaign')
      }

      router.push('/campaigns')
      router.refresh()
    } catch (error) {
      console.error('Error deleting campaign:', error)
      alert('Hiba történt a kampány törlése során')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {loading ? 'Törlés...' : 'Törlés'}
    </Button>
  )
}

