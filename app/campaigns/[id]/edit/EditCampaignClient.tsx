'use client'

import { useRouter } from 'next/navigation'
import { CampaignForm } from '@/components/campaigns/CampaignForm'
import { CampaignWizardEditor } from '@/components/campaigns/CampaignWizardEditor'
import { Database } from '@/lib/supabase/types'
import { toast } from 'sonner'

type Campaign = Database['campaign_os']['Tables']['campaigns']['Row']

interface EditCampaignClientProps {
  campaign: Campaign
}

export default function EditCampaignClient({ campaign }: EditCampaignClientProps) {
  const router = useRouter()
  const hasWizardData = campaign.wizard_data && typeof campaign.wizard_data === 'object'

  const handleSuccess = () => {
    toast.success('Kampány sikeresen frissítve!')
    router.refresh()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Kampány szerkesztése</h1>
        <p className="text-muted-foreground mt-2">
          {campaign.name}
        </p>
      </div>
      
      {hasWizardData ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Alapvető információk</h2>
            <CampaignForm campaign={campaign} onSuccess={handleSuccess} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <CampaignWizardEditor
              wizardData={campaign.wizard_data as any}
              campaignId={campaign.id}
              campaignType={campaign.campaign_type}
              goalType={campaign.primary_goal_type}
              onUpdate={handleSuccess}
            />
          </div>
        </div>
      ) : (
        <CampaignForm campaign={campaign} onSuccess={handleSuccess} />
      )}
    </div>
  )
}

