import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TopicManager } from '@/components/topics/TopicManager'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface TopicsPageProps {
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

export default async function TopicsPage({ params }: TopicsPageProps) {
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
        <p className="text-muted-foreground mt-2">Témák kezelése</p>
      </div>
      <TopicManager campaignId={id} />
    </div>
  )
}

