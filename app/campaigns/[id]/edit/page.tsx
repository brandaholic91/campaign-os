import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CampaignForm } from '@/components/campaigns/CampaignForm'
import { CampaignWizardEditor } from '@/components/campaigns/CampaignWizardEditor'
import { Database } from '@/lib/supabase/types'

type Campaign = Database['campaign_os']['Tables']['campaigns']['Row']

interface EditCampaignPageProps {
  params: Promise<{ id: string }>
}

async function getCampaign(id: string): Promise<Campaign | null> {
  const supabase = await createClient()
  const db = supabase.schema('campaign_os')
  const { data, error } = await db
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const { id } = await params
  const campaign = await getCampaign(id)

  if (!campaign) {
    notFound()
  }

  const hasWizardData = campaign.wizard_data && typeof campaign.wizard_data === 'object'

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
            <CampaignForm campaign={campaign} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <CampaignWizardEditor
              wizardData={campaign.wizard_data as any}
              campaignId={campaign.id}
              campaignType={campaign.campaign_type}
              goalType={campaign.primary_goal_type}
            />
          </div>
        </div>
      ) : (
        <CampaignForm campaign={campaign} />
      )}
    </div>
  )
}

