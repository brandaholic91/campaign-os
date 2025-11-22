import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X } from 'lucide-react'

interface ExtraFieldsSectionProps {
  form: UseFormReturn<any>
}

export function ExtraFieldsSection({ form }: ExtraFieldsSectionProps) {
  const { register, watch, setValue } = form
  
  const keyPhrases = watch('extra_fields.key_phrases') || []

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
      <p className="text-sm text-muted-foreground italic">
        Ez a szekció minden mezője opcionális. Add meg, ha releváns a stratégiához.
      </p>

      {/* Framing Type */}
      <div className="space-y-2">
        <Label htmlFor="framing_type">
          Keretezés típusa (Framing Type)
        </Label>
        <Select
          value={watch('extra_fields.framing_type') || undefined}
          onValueChange={(value) => setValue('extra_fields.framing_type', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Válassz keretezési típust (opcionális)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gain">Gain (Nyereség)</SelectItem>
            <SelectItem value="loss">Loss (Veszteség)</SelectItem>
            <SelectItem value="social_proof">Social Proof (Társadalmi bizonyíték)</SelectItem>
            <SelectItem value="authority">Authority (Tekintély)</SelectItem>
            <SelectItem value="scarcity">Scarcity (Ritkaság)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Phrases */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>
            Kulcskifejezések
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addItem('extra_fields.key_phrases', keyPhrases)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Hozzáad
          </Button>
        </div>
        <div className="space-y-2">
          {keyPhrases.map((_: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Kulcskifejezés ${index + 1}`}
                value={keyPhrases[index]}
                onChange={(e) => updateItem('extra_fields.key_phrases', keyPhrases, index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeItem('extra_fields.key_phrases', keyPhrases, index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        {keyPhrases.length === 0 && (
          <p className="text-xs text-muted-foreground italic">Nincs kulcskifejezés megadva</p>
        )}
      </div>

      {/* Risk Notes */}
      <div className="space-y-2">
        <Label htmlFor="risk_notes">
          Kockázatok / Megjegyzések
        </Label>
        <Textarea
          id="risk_notes"
          {...register('extra_fields.risk_notes')}
          placeholder="Bármilyen kockázat, figyelmeztetés vagy megjegyzés a stratégiával kapcsolatban..."
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Például: érzékeny témák, lehetséges félreértések, jogi kockázatok, stb.
        </p>
      </div>
    </div>
  )
}
