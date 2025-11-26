'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ContentDraft } from '@/lib/ai/schemas'
import { Loader2, Save } from 'lucide-react'

// Schema for editing (subset of ContentDraftSchema)
const DraftEditSchema = z.object({
  variant_name: z.string().min(1, 'Variáns név kötelező'),
  hook: z.string().min(10, 'A hook legalább 10 karakter legyen'),
  body: z.string().min(50, 'A törzsszöveg legalább 50 karakter legyen'),
  cta_copy: z.string().min(5, 'A CTA szöveg legalább 5 karakter legyen'),
  visual_idea: z.string().min(20, 'A vizuális ötlet legalább 20 karakter legyen'),
  alt_text_suggestion: z.string().optional(),
  length_hint: z.string().optional(),
  tone_notes: z.string().optional(),
})

type DraftEditFormValues = z.infer<typeof DraftEditSchema>

interface DraftEditModalProps {
  draft: ContentDraft | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (draftId: string, values: DraftEditFormValues) => Promise<void>
}

export function DraftEditModal({ draft, open, onOpenChange, onSave }: DraftEditModalProps) {
  const form = useForm<DraftEditFormValues>({
    resolver: zodResolver(DraftEditSchema),
    defaultValues: {
      variant_name: '',
      hook: '',
      body: '',
      cta_copy: '',
      visual_idea: '',
      alt_text_suggestion: '',
      length_hint: '',
      tone_notes: '',
    },
  })

  useEffect(() => {
    if (draft) {
      form.reset({
        variant_name: draft.variant_name || '',
        hook: draft.hook,
        body: draft.body,
        cta_copy: draft.cta_copy,
        visual_idea: draft.visual_idea,
        alt_text_suggestion: draft.alt_text_suggestion || '',
        length_hint: draft.length_hint || '',
        tone_notes: draft.tone_notes || '',
      })
    }
  }, [draft, form])

  const onSubmit = async (values: DraftEditFormValues) => {
    if (!draft || !draft.id) return
    await onSave(draft.id, values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vázlat Szerkesztése</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control as any}
              name="variant_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variáns Név</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="hook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hook</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Törzsszöveg</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={6} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="cta_copy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CTA Szöveg</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="visual_idea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vizuális Ötlet</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="alt_text_suggestion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt Text Javaslat</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="length_hint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hossz Javaslat</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control as any}
              name="tone_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hangnem Jegyzetek</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
