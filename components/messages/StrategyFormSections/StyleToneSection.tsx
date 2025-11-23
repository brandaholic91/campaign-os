import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X } from 'lucide-react'

interface StyleToneSectionProps {
  form: UseFormReturn<any>
}

export function StyleToneSection({ form }: StyleToneSectionProps) {
  const { register, watch, setValue, formState: { errors } } = form
  
  const keywords = watch('style_tone.tone_profile.keywords') || ['', '', '']
  const dosList = watch('style_tone.communication_guidelines.do') || ['']
  const dontsList = watch('style_tone.communication_guidelines.dont') || ['']

  const addItem = (field: string, currentItems: string[]) => {
    setValue(field, [...currentItems, ''])
  }

  const removeItem = (field: string, currentItems: string[], index: number) => {
    setValue(field, currentItems.filter((_, i) => i !== index))
  }

  const updateItem = (field: string, currentItems: string[], index: number, value: string) => {
    const newItems = [...currentItems]
    newItems[index] = value
    setValue(field, newItems)
  }

  return (
    <div className="space-y-6">
      {/* Tone Profile Description */}
      <div className="space-y-2">
        <Label htmlFor="tone_description">
          Tónus profil leírása <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="tone_description"
          {...register('style_tone.tone_profile.description')}
          placeholder="Milyen hangnemet, stílust használjunk..."
          rows={3}
          className={(errors as any)?.style_tone?.tone_profile?.description ? 'border-destructive' : ''}
        />
        {(errors as any)?.style_tone?.tone_profile?.description && (
          <p className="text-sm text-destructive">{(errors as any).style_tone.tone_profile.description.message as string}</p>
        )}
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>
            Kulcsszavak <span className="text-destructive">*</span>
            <span className="text-xs text-muted-foreground ml-2">(min 3, max 5)</span>
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addItem('style_tone.tone_profile.keywords', keywords)}
            disabled={keywords.length >= 5}
          >
            <Plus className="w-4 h-4 mr-1" />
            Hozzáad
          </Button>
        </div>
        <div className="space-y-2">
          {keywords.map((_: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Kulcsszó ${index + 1}`}
                value={keywords[index]}
                onChange={(e) => updateItem('style_tone.tone_profile.keywords', keywords, index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeItem('style_tone.tone_profile.keywords', keywords, index)}
                disabled={keywords.length <= 3}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        {(errors as any)?.style_tone?.tone_profile?.keywords && (
          <p className="text-sm text-destructive">{(errors as any).style_tone.tone_profile.keywords.message as string}</p>
        )}
      </div>

      {/* Language Style */}
      <div className="space-y-2">
        <Label htmlFor="language_style">
          Nyelvezet <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="language_style"
          {...register('style_tone.language_style')}
          placeholder="Milyen nyelvezetet használjunk (formális/informális, szakmai/közérthető, stb.)..."
          rows={2}
          className={(errors as any)?.style_tone?.language_style ? 'border-destructive' : ''}
        />
        {(errors as any)?.style_tone?.language_style && (
          <p className="text-sm text-destructive">{(errors as any).style_tone.language_style.message as string}</p>
        )}
      </div>

      {/* Communication Guidelines - Two-Column Layout */}
      <div className="space-y-2">
        <Label>
          Kommunikációs irányelvek <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-4">
          {/* DOs Column */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-green-700 font-semibold">✓ DOs (Amit tegyünk)</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addItem('style_tone.communication_guidelines.do', dosList)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {dosList.map((_: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`DO ${index + 1}`}
                    value={dosList[index]}
                    onChange={(e) => updateItem('style_tone.communication_guidelines.do', dosList, index, e.target.value)}
                    className="flex-1 border-green-200 focus:border-green-400"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeItem('style_tone.communication_guidelines.do', dosList, index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* DONTs Column */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-red-700 font-semibold">✗ DONTs (Amit kerüljünk)</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addItem('style_tone.communication_guidelines.dont', dontsList)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {dontsList.map((_: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`DON'T ${index + 1}`}
                    value={dontsList[index]}
                    onChange={(e) => updateItem('style_tone.communication_guidelines.dont', dontsList, index, e.target.value)}
                    className="flex-1 border-red-200 focus:border-red-400"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeItem('style_tone.communication_guidelines.dont', dontsList, index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {(errors as any)?.style_tone?.communication_guidelines && (
          <p className="text-sm text-destructive">{(errors as any).style_tone.communication_guidelines.message as string}</p>
        )}
      </div>

      {/* Emotional Temperature */}
      <div className="space-y-2">
        <Label htmlFor="emotional_temperature">
          Érzelmi hőmérséklet <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch('style_tone.emotional_temperature') || ''}
          onValueChange={(value) => setValue('style_tone.emotional_temperature', value)}
        >
          <SelectTrigger className={(errors as any)?.style_tone?.emotional_temperature ? 'border-destructive' : ''}>
            <SelectValue placeholder="Válassz érzelmi hőmérsékletet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cold">Hideg (objektív, tényszerű)</SelectItem>
            <SelectItem value="neutral">Semleges (kiegyensúlyozott)</SelectItem>
            <SelectItem value="warm">Meleg (barátságos, közvetlen)</SelectItem>
            <SelectItem value="hot">Forró (szenvedélyes, érzelmes)</SelectItem>
          </SelectContent>
        </Select>
        {(errors as any)?.style_tone?.emotional_temperature && (
          <p className="text-sm text-destructive">{(errors as any).style_tone.emotional_temperature.message as string}</p>
        )}
      </div>
    </div>
  )
}
