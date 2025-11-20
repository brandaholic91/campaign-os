import { CampaignForm } from '@/components/campaigns/CampaignForm'

export default function NewCampaignPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Új kampány</h1>
        <p className="text-muted-foreground mt-2">
          Hozz létre egy új kampányt a tervezéshez
        </p>
      </div>
      <CampaignForm />
    </div>
  )
}

