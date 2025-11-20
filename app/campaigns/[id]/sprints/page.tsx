import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SprintsPageProps {
  params: Promise<{ id: string }>
}

async function getCampaign(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('campaigns')
    .select('id, name')
    .eq('id', id)
    .single()

  return data
}

export default async function SprintsPage({ params }: SprintsPageProps) {
  const { id } = await params
  const campaign = await getCampaign(id)

  if (!campaign) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href={`/campaigns/${id}`}>
          <Button className="mb-4 hover:bg-accent hover:text-accent-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Vissza a kampányhoz
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{campaign.name}</h1>
        <p className="text-muted-foreground mt-2">Sprint és task board</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sprint Board</CardTitle>
          <CardDescription>
            Ez a funkció a következő story-ban lesz implementálva (Story 1.3)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A sprint board lehetővé teszi a sprintek létrehozását és a feladatok Kanban-stílusú kezelését.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

