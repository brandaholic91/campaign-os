import { NextRequest, NextResponse } from 'next/server'
import { isReadyForExecution } from '@/lib/validation/campaign-structure'
import { fetchCampaignStructure } from '@/lib/campaign/structure'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const structure = await fetchCampaignStructure(id)

    if (!structure) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const validationResult = isReadyForExecution(structure)
    return NextResponse.json(validationResult)
  } catch (error) {
    console.error('Validation API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
