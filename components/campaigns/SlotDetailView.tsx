'use client'

import React from 'react'
import { ContentSlot } from '@/lib/ai/schemas'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Edit, Trash2, Calendar, Target, Users, MessageSquare, Radio, Layers, Lightbulb, Type } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SlotDetailViewProps {
  slot: ContentSlot
  segmentNames: Record<string, string>
  topicNames: Record<string, string>
  onEdit: () => void
  onDelete: () => void
}

const objectiveLabels: Record<string, string> = {
  reach: 'Elérés',
  engagement: 'Engedélyezés',
  traffic: 'Forgalom',
  lead: 'Lead',
  conversion: 'Konverzió',
  mobilization: 'Mobilizáció',
}

const objectiveColors: Record<string, string> = {
  reach: 'bg-blue-100 text-blue-700 border-blue-200',
  engagement: 'bg-green-100 text-green-700 border-green-200',
  traffic: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  lead: 'bg-purple-100 text-purple-700 border-purple-200',
  conversion: 'bg-orange-100 text-orange-700 border-orange-200',
  mobilization: 'bg-red-100 text-red-700 border-red-200',
}

const contentTypeLabels: Record<string, string> = {
  short_video: 'Rövid videó',
  story: 'Story',
  static_image: 'Statikus kép',
  carousel: 'Karruszel',
  live: 'Élő',
  long_post: 'Hosszú poszt',
  email: 'Email',
}

const angleTypeLabels: Record<string, string> = {
  story: 'Történet',
  proof: 'Bizonyíték',
  how_to: 'Hogyan',
  comparison: 'Összehasonlítás',
  behind_the_scenes: 'Kulisszatitkok',
  testimonial: 'Vevővélemény',
  other: 'Egyéb',
}

const ctaTypeLabels: Record<string, string> = {
  soft_info: 'Puha infó',
  learn_more: 'Tudj meg többet',
  signup: 'Feliratkozás',
  donate: 'Adományozás',
  attend_event: 'Esemény',
  share: 'Megosztás',
  comment: 'Komment',
}

const timeOfDayLabels: Record<string, string> = {
  morning: 'Reggel',
  midday: 'Napközben',
  evening: 'Este',
  unspecified: 'Nincs megadva',
}

export function SlotDetailView({ slot, segmentNames, topicNames, onEdit, onDelete }: SlotDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Basic Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alapadatok</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Szerkesztés
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Törlés
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Dátum
              </p>
              <p className="font-medium">{format(new Date(slot.date), 'yyyy. MM. dd.')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <Radio className="h-3 w-3" /> Csatorna
              </p>
              <p className="font-medium">{slot.channel}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <Type className="h-3 w-3" /> Típus
              </p>
              <p className="font-medium">{contentTypeLabels[slot.content_type] || slot.content_type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Időszak
              </p>
              <p className="font-medium">{timeOfDayLabels[slot.time_of_day || 'unspecified']}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Binding Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Stratégiai Illeszkedés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Célközönség</p>
            <div className="flex flex-wrap gap-2">
              {slot.primary_segment_id && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  {segmentNames[slot.primary_segment_id] || 'Elsődleges szegmens'}
                </Badge>
              )}
              {slot.secondary_segment_ids?.map(id => (
                <Badge key={id} variant="outline">
                  {segmentNames[id] || 'Másodlagos szegmens'}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Téma</p>
            <div className="flex flex-wrap gap-2">
              {slot.primary_topic_id && (
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  {topicNames[slot.primary_topic_id] || 'Elsődleges téma'}
                </Badge>
              )}
              {slot.secondary_topic_ids?.map(id => (
                <Badge key={id} variant="outline">
                  {topicNames[id] || 'Másodlagos téma'}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Cél</p>
              <Badge className={`${objectiveColors[slot.objective] || 'bg-gray-100'} border`}>
                {objectiveLabels[slot.objective] || slot.objective}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Funnel Szakasz</p>
              <Badge variant="outline">
                {slot.funnel_stage || 'Nincs megadva'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creative Direction Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Kreatív Irány</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Szög (Angle)</p>
              <p className="text-sm font-medium">{angleTypeLabels[slot.angle_type] || slot.angle_type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">CTA Típus</p>
              <p className="text-sm font-medium">{ctaTypeLabels[slot.cta_type] || slot.cta_type}</p>
            </div>
          </div>

          {slot.angle_hint && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                <Lightbulb className="h-3 w-3" /> Angle Hint
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-100">
                {slot.angle_hint}
              </p>
            </div>
          )}

          {slot.tone_override && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Hangnem Override</p>
              <p className="text-sm text-gray-600 italic">"{slot.tone_override}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Production Info Card */}
      {(slot.asset_requirements || slot.owner || slot.notes) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gyártási Infó</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {slot.asset_requirements && slot.asset_requirements.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Asset Igények</p>
                <div className="flex flex-wrap gap-1">
                  {slot.asset_requirements.map((req, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {slot.owner && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Felelős</p>
                <p className="text-sm font-medium">{slot.owner}</p>
              </div>
            )}

            {slot.notes && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Megjegyzés</p>
                <p className="text-sm text-gray-600">{slot.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
