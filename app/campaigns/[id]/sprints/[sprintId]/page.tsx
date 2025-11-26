import { SprintDetailPage } from '@/components/campaigns/SprintDetailPage'

interface SprintPageProps {
  params: Promise<{
    id: string
    sprintId: string
  }>
}

export default async function SprintPage({ params }: SprintPageProps) {
  const resolvedParams = await params
  return <SprintDetailPage campaignId={resolvedParams.id} sprintId={resolvedParams.sprintId} />
}
