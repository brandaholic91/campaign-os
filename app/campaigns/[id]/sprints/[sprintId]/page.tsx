import { SprintDetailPage } from '@/components/campaigns/SprintDetailPage'

interface SprintPageProps {
  params: {
    id: string
    sprintId: string
  }
}

export default function SprintPage({ params }: SprintPageProps) {
  return <SprintDetailPage campaignId={params.id} sprintId={params.sprintId} />
}
