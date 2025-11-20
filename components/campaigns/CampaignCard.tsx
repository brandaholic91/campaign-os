'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database } from '@/lib/supabase/types'
import { format } from 'date-fns'

type Campaign = Database['campaign_os']['Tables']['campaigns']['Row']

interface CampaignCardProps {
  campaign: Campaign
}

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

const statusLabels: Record<NonNullable<Campaign['status']>, string> = {
  planning: 'Tervezés',
  running: 'Fut',
  closed: 'Lezárva',
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const startDate = new Date(campaign.start_date)
  const endDate = new Date(campaign.end_date)

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="line-clamp-2">{campaign.name}</CardTitle>
          <CardDescription>
            {campaignTypeLabels[campaign.campaign_type]} • {goalTypeLabels[campaign.primary_goal_type]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Időszak:</span>
              <span>{format(startDate, 'yyyy.MM.dd')} - {format(endDate, 'yyyy.MM.dd')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Státusz:</span>
              <span className={`font-medium ${
                campaign.status === 'running' ? 'text-green-600' :
                campaign.status === 'closed' ? 'text-gray-600' :
                'text-blue-600'
              }`}>
                {campaign.status ? statusLabels[campaign.status] : 'Tervezés'}
              </span>
            </div>
            {campaign.description && (
              <p className="text-muted-foreground line-clamp-2 mt-2">
                {campaign.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

