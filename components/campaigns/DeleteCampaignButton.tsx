'use client'

import { useRouter } from 'next/navigation'
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
    <button
      type="button"
      className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-transparent rounded-lg text-rose-600 font-medium text-sm hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleDelete}
      disabled={loading}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      {loading ? 'Törlés...' : 'Törlés'}
    </button>
  )
}

