import { SlotDetailPage } from '@/components/campaigns/SlotDetailPage'

interface SlotPageProps {
  params: Promise<{
    id: string
    sprintId: string
    slotId: string
  }>
}

export default async function SlotPage({ params }: SlotPageProps) {
  const resolvedParams = await params
  return (
    <SlotDetailPage
      campaignId={resolvedParams.id}
      sprintId={resolvedParams.sprintId}
      slotId={resolvedParams.slotId}
    />
  )
}
