import { SlotDetailPage } from '@/components/campaigns/SlotDetailPage'

interface SlotPageProps {
  params: {
    id: string
    sprintId: string
    slotId: string
  }
}

export default function SlotPage({ params }: SlotPageProps) {
  return (
    <SlotDetailPage
      campaignId={params.id}
      sprintId={params.sprintId}
      slotId={params.slotId}
    />
  )
}
