'use client'

import { CampaignWizard } from '@/components/campaigns/CampaignWizard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function NewCampaignPage() {
  const router = useRouter()

  const handleComplete = async (data: any) => {
    try {
      // TODO: Implement campaign creation API call
      console.log('Campaign data:', data)
      toast.success('Kampány sikeresen létrehozva!')
      // router.push('/campaigns')
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast.error('Hiba történt a kampány létrehozása során')
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-6 pb-8">
        <div className="mb-6">
          <Link href="/campaigns">
            <button className="self-start flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 font-medium text-sm hover:bg-gray-50 hover:text-primary-600 transition-all mb-4">
              <ArrowLeft className="w-4 h-4" />
              Vissza a kampányokhoz
            </button>
          </Link>
        </div>
        <CampaignWizard onComplete={handleComplete} />
      </div>
    </div>
  )
}

