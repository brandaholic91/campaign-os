'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { ContentSlotSchema } from '@/lib/ai/schemas'

// Extend schema for form validation if needed, or use as is
const SlotEditSchema = ContentSlotSchema.extend({
  // Override or add specific validations for the form
})

type SlotEditFormValues = z.infer<typeof SlotEditSchema>

interface SlotEditPageProps {
  campaignId: string
  sprintId: string
  slotId: string
}

export function SlotEditPage({ campaignId, sprintId, slotId }: SlotEditPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [segments, setSegments] = useState<{ label: string; value: string }[]>([])
  const [topics, setTopics] = useState<{ label: string; value: string }[]>([])
  const [goals, setGoals] = useState<{ label: string; value: string }[]>([])

  const form = useForm<SlotEditFormValues>({
    resolver: zodResolver(SlotEditSchema) as any,
    defaultValues: {
      // Defaults will be set after loading data
    },
  })

  useEffect(() => {
    loadData()
  }, [slotId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const db = supabase.schema('campaign_os')

      // Load slot
      const { data: slot, error: slotError } = await db
        .from('content_slots')
        .select('*')
        .eq('id', slotId)
        .single()

      if (slotError || !slot) {
        throw new Error('Slot nem található')
      }

      // Load segments
      const { data: segmentsData } = await db.from('segments').select('id, name')
      if (segmentsData) {
        setSegments(segmentsData.map(s => ({ label: s.name, value: s.id })))
      }

      // Load topics
      const { data: topicsData } = await db.from('topics').select('id, name')
      if (topicsData) {
        setTopics(topicsData.map(t => ({ label: t.name, value: t.id })))
      }

      // Load goals
      const { data: goalsData } = await db.from('goals').select('id, title')
      if (goalsData) {
        setGoals(goalsData.map(g => ({ label: g.title, value: g.id })))
      }

      // Set form values
      form.reset({
        ...slot,
        date: new Date(slot.date), // Ensure date object
        secondary_segment_ids: (slot.secondary_segment_ids as any as string[]) || [],
        secondary_topic_ids: (slot.secondary_topic_ids as any as string[]) || [],
        related_goal_ids: (slot.related_goal_ids as any as string[]) || [],
        asset_requirements: (slot.asset_requirements as any as string[]) || [],
        draft_status: 'no_draft', // Default value to satisfy schema
      } as any)

    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Hiba történt az adatok betöltése során')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: SlotEditFormValues) => {
    try {
      const response = await fetch(`/api/content-slots/${slotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Mentés sikertelen')
      }

      toast.success('Slot sikeresen mentve')
      router.push(`/campaigns/${campaignId}/sprints/${sprintId}/slots/${slotId}`)
    } catch (error) {
      console.error('Error saving slot:', error)
      toast.error('Hiba történt a mentés során')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/campaigns/${campaignId}/sprints/${sprintId}/slots/${slotId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Vissza a slothoz
          </Button>

          <h1 className="text-2xl font-display font-bold text-gray-900">
            Slot Szerkesztése
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
              
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Alapadatok</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="channel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Csatorna</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="content_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tartalom Típus</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Válassz..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="short_video">Rövid videó</SelectItem>
                            <SelectItem value="story">Story</SelectItem>
                            <SelectItem value="static_image">Statikus kép</SelectItem>
                            <SelectItem value="carousel">Karruszel</SelectItem>
                            <SelectItem value="live">Élő</SelectItem>
                            <SelectItem value="long_post">Hosszú poszt</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="time_of_day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Időszak</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Válassz..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="morning">Reggel</SelectItem>
                            <SelectItem value="midday">Napközben</SelectItem>
                            <SelectItem value="evening">Este</SelectItem>
                            <SelectItem value="unspecified">Nincs megadva</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Strategic Binding */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Stratégiai Illeszkedés</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="primary_segment_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Elsődleges Szegmens</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Válassz..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {segments.map(s => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="secondary_segment_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Másodlagos Szegmensek</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={segments}
                            selected={field.value || []}
                            onSelectionChange={field.onChange}
                            placeholder="Válassz..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="primary_topic_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Elsődleges Téma</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Válassz..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {topics.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="secondary_topic_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Másodlagos Témák</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={topics}
                            selected={field.value || []}
                            onSelectionChange={field.onChange}
                            placeholder="Válassz..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="related_goal_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kapcsolódó Célok</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={goals}
                            selected={field.value || []}
                            onSelectionChange={field.onChange}
                            placeholder="Válassz..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="funnel_stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funnel Szakasz</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Válassz..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="awareness">Tudatosság</SelectItem>
                            <SelectItem value="consideration">Fontolgatás</SelectItem>
                            <SelectItem value="conversion">Konverzió</SelectItem>
                            <SelectItem value="loyalty">Hűség</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="objective"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Célkitűzés</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Válassz..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="reach">Elérés</SelectItem>
                            <SelectItem value="engagement">Engedélyezés</SelectItem>
                            <SelectItem value="traffic">Forgalom</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="conversion">Konverzió</SelectItem>
                            <SelectItem value="mobilization">Mobilizáció</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Creative Direction */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Kreatív Irány</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="angle_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Szög (Angle)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Válassz..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="story">Történet</SelectItem>
                            <SelectItem value="proof">Bizonyíték</SelectItem>
                            <SelectItem value="how_to">Hogyan</SelectItem>
                            <SelectItem value="comparison">Összehasonlítás</SelectItem>
                            <SelectItem value="behind_the_scenes">Kulisszatitkok</SelectItem>
                            <SelectItem value="testimonial">Vevővélemény</SelectItem>
                            <SelectItem value="other">Egyéb</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="cta_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CTA Típus</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Válassz..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="soft_info">Puha infó</SelectItem>
                            <SelectItem value="learn_more">Tudj meg többet</SelectItem>
                            <SelectItem value="signup">Feliratkozás</SelectItem>
                            <SelectItem value="donate">Adományozás</SelectItem>
                            <SelectItem value="attend_event">Esemény</SelectItem>
                            <SelectItem value="share">Megosztás</SelectItem>
                            <SelectItem value="comment">Komment</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control as any}
                  name="angle_hint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Angle Hint</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Rövid leírás a tartalom megközelítéséről..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="tone_override"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hangnem Override (Opcionális)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="Ha eltér a stratégiai hangnemtől..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Production Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Gyártási Infó</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="asset_requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eszközigények</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={[
                              { label: 'Videó (nyers)', value: 'video_raw' },
                              { label: 'Videó (vágott)', value: 'video_edited' },
                              { label: 'Kép (termék)', value: 'image_product' },
                              { label: 'Kép (életkép)', value: 'image_lifestyle' },
                              { label: 'Grafika', value: 'graphics' },
                              { label: 'Szöveg (copy)', value: 'copy' },
                              { label: 'Hang/Voiceover', value: 'audio' },
                              { label: 'Felirat', value: 'subtitles' },
                            ]}
                            selected={field.value || []}
                            onSelectionChange={field.onChange}
                            placeholder="Válassz..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="owner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Felelős</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Pl. Kovács János" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control as any}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Megjegyzés</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/campaigns/${campaignId}/sprints/${sprintId}/slots/${slotId}`)}
                >
                  Mégse
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mentés...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Mentés
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
