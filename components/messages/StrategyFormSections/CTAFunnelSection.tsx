import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X } from 'lucide-react'

interface CTAFunnelSectionProps {
  form: UseFormReturn<any>
}

export function CTAFunnelSection({ form }: CTAFunnelSectionProps) {
  const { watch, setValue, formState: { errors } } = form
  
  const ctaObjectives = watch('cta_funnel.cta_objectives') || ['']
  const ctaPatterns = watch('cta_funnel.cta_patterns') || ['', '']
  const frictionReducers = watch('cta_funnel.friction_reducers') || []

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
      {/* Funnel Stage */}
      <div className="space-y-2">
        <Label htmlFor="funnel_stage">
          Funnel szakasz <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch('cta_funnel.funnel_stage') || ''}
          onValueChange={(value) => setValue('cta_funnel.funnel_stage', value)}
        >
          <SelectTrigger className={(errors as any)?.cta_funnel?.funnel_stage ? 'border-destructive' : ''}>
            <SelectValue placeholder="Válassz funnel szakaszt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="awareness">Awareness (Tudatosítás)</SelectItem>
            <SelectItem value="consideration">Consideration (Mérlegelés)</SelectItem>
            <SelectItem value="conversion">Conversion (Konverzió)</SelectItem>
            <SelectItem value="mobilization">Mobilization (Mobilizáció)</SelectItem>
          </SelectContent>
        </Select>
        {(errors as any)?.cta_funnel?.funnel_stage && (
          <p className="text-sm text-destructive">{(errors as any).cta_funnel.funnel_stage.message as string}</p>
        )}
      </div>

      {/* CTA Objectives */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>
            CTA Célok <span className="text-destructive">*</span>
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addItem('cta_funnel.cta_objectives', ctaObjectives)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Hozzáad
          </Button>
        </div>
        <div className="space-y-2">
          {ctaObjectives.map((_: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`CTA cél ${index + 1}`}
                value={ctaObjectives[index]}
                onChange={(e) => updateItem('cta_funnel.cta_objectives', ctaObjectives, index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeItem('cta_funnel.cta_objectives', ctaObjectives, index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        {(errors as any)?.cta_funnel?.cta_objectives && (
          <p className="text-sm text-destructive">{(errors as any).cta_funnel.cta_objectives.message as string}</p>
        )}
      </div>

      {/* CTA Patterns */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>
            CTA Minták <span className="text-destructive">*</span>
            <span className="text-xs text-muted-foreground ml-2">(min 2, max 3)</span>
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addItem('cta_funnel.cta_patterns', ctaPatterns)}
            disabled={ctaPatterns.length >= 3}
          >
            <Plus className="w-4 h-4 mr-1" />
            Hozzáad
          </Button>
        </div>
        <div className="space-y-2">
          {ctaPatterns.map((_: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`CTA minta ${index + 1} (pl. "Csatlakozz most", "Tudj meg többet")`}
                value={ctaPatterns[index]}
                onChange={(e) => updateItem('cta_funnel.cta_patterns', ctaPatterns, index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeItem('cta_funnel.cta_patterns', ctaPatterns, index)}
                disabled={ctaPatterns.length <= 2}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        {(errors as any)?.cta_funnel?.cta_patterns && (
          <p className="text-sm text-destructive">{(errors as any).cta_funnel.cta_patterns.message as string}</p>
        )}
      </div>

      {/* Friction Reducers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>
            Súrlódáscsökkentők
            <span className="text-xs text-muted-foreground ml-2">(opcionális)</span>
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addItem('cta_funnel.friction_reducers', frictionReducers)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Hozzáad
          </Button>
        </div>
        <div className="space-y-2">
          {frictionReducers.map((_: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Súrlódáscsökkentő ${index + 1} (pl. "Ingyenes", "Kötelezettség nélkül")`}
                value={frictionReducers[index]}
                onChange={(e) => updateItem('cta_funnel.friction_reducers', frictionReducers, index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeItem('cta_funnel.friction_reducers', frictionReducers, index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        {frictionReducers.length === 0 && (
          <p className="text-xs text-muted-foreground italic">Nincs súrlódáscsökkentő megadva</p>
        )}
      </div>
    </div>
  )
}
