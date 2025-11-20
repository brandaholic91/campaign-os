import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database } from '@/lib/supabase/types'
import { format } from 'date-fns'
import { Edit, Users, MessageSquare, Calendar } from 'lucide-react'
import { DeleteCampaignButton } from '@/components/campaigns/DeleteCampaignButton'

type Campaign = Database['public']['Tables']['campaigns']['Row']

const campaignTypeLabels: Record<Campaign['campaign_type'], string> = {
  political_election: 'Politikai választás',
  political_issue: 'Politikai ügy',
  brand_awareness: 'Márkaismertség',
  product_launch: 'Termék bevezetés',
  promo: 'Promóció',
  ngo_issue: 'NGO ügy',
}

const goalTypeLabels: Record<Campaign['primary_goal_type'], string> = {
  awareness: 'Tudatosság',
  engagement: 'Engedélyezés',
  list_building: 'Listaépítés',
  conversion: 'Konverzió',
  mobilization: 'Mobilizáció',
}

const statusLabels: Record<Campaign['status'], string> = {
  planning: 'Tervezés',
  running: 'Fut',
  closed: 'Lezárva',
}

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>
}

async function getCampaign(id: string): Promise<Campaign | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params
  const campaign = await getCampaign(id)

  if (!campaign) {
    notFound()
  }

  const startDate = new Date(campaign.start_date)
  const endDate = new Date(campaign.end_date)


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{campaign.name}</h1>
          <p className="text-muted-foreground mt-2">
            {campaignTypeLabels[campaign.campaign_type]} • {goalTypeLabels[campaign.primary_goal_type]}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/campaigns/${id}/edit`}>
            <Button className="border border-input bg-background hover:bg-accent">
              <Edit className="mr-2 h-4 w-4" />
              Szerkesztés
            </Button>
          </Link>
          <DeleteCampaignButton campaignId={id} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Státusz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              campaign.status === 'running' ? 'text-green-600' :
              campaign.status === 'closed' ? 'text-gray-600' :
              'text-blue-600'
            }`}>
              {statusLabels[campaign.status]}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Időszak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div>{format(startDate, 'yyyy.MM.dd')}</div>
              <div className="text-muted-foreground">-</div>
              <div>{format(endDate, 'yyyy.MM.dd')}</div>
            </div>
          </CardContent>
        </Card>

        {campaign.budget_estimate && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Költségvetés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('hu-HU').format(campaign.budget_estimate)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {campaign.description && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Leírás</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{campaign.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href={`/campaigns/${id}/segments`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Célcsoportok
              </CardTitle>
              <CardDescription>
                Célcsoportok kezelése
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href={`/campaigns/${id}/topics`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Témák
              </CardTitle>
              <CardDescription>
                Témák kezelése
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href={`/campaigns/${id}/messages`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Üzenetek
              </CardTitle>
              <CardDescription>
                Üzenetmátrix
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href={`/campaigns/${id}/sprints`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Sprintek
              </CardTitle>
              <CardDescription>
                Sprint és task board
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}

