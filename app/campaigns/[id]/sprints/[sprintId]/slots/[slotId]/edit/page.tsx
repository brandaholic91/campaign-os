import { SlotEditPage } from '@/components/campaigns/SlotEditPage'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; sprintId: string; slotId: string }>
}) {
  const { id, sprintId, slotId } = await params
  return <SlotEditPage campaignId={id} sprintId={sprintId} slotId={slotId} />
}
