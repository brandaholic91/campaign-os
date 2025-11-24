import { NextRequest, NextResponse } from 'next/server'
import { fetchCampaignStructure } from '@/lib/campaign/structure'
import { isReadyForExecution } from '@/lib/validation/campaign-structure'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const includeValidation = searchParams.get('include_validation') === 'true'

    const structure = await fetchCampaignStructure(id)

    if (!structure) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (includeValidation) {
      const validation = isReadyForExecution(structure)
      return NextResponse.json({ ...structure, validation })
    }

    return NextResponse.json(structure)
  } catch (error) {
    console.error('Structure API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
