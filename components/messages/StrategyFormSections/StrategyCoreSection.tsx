import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'

interface StrategyCoreSection {
  positioning_statement: string
  core_message: string
  supporting_messages: string[]
  proof_points: string[]
  objections_reframes?: string[]
}

interface StrategyCoreProps {
  form: UseFormReturn<any>
}

export function StrategyCoreSection({ form }: StrategyCoreProps) {
  const { register, watch, setValue, formState: { errors } } = form
  
  const supportingMessages = watch('strategy_core.supporting_messages') || ['', '', '']
  const proofPoints = watch('strategy_core.proof_points') || ['', '']
  const objectionsReframes = watch('strategy_core.objections_reframes') || []

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
      {/* Positioning Statement */}
      <div className="space-y-2">
        <Label htmlFor="positioning_statement">
          Pozicionálás (Positioning Statement) <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="positioning_statement"
          {...register('strategy_core.positioning_statement')}
          placeholder="Hogyan pozicionáljuk a terméket/szolgáltatást/jelöltet..."
          rows={3}
          className={(errors as any)?.strategy_core?.positioning_statement ? 'border-destructive' : ''}
        />
        {(errors as any)?.strategy_core?.positioning_statement && (
          <p className="text-sm text-destructive">{(errors as any).strategy_core.positioning_statement.message as string}</p>
        )}
      </div>

      {/* Core Message */}
      <div className="space-y-2">
        <Label htmlFor="core_message">
          Fő üzenet (Core Message) <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="core_message"
          {...register('strategy_core.core_message')}
          placeholder="Az egyetlen legfontosabb üzenet, amit közvetíteni szeretnél..."
          rows={2}
          className={(errors as any)?.strategy_core?.core_message ? 'border-destructive' : ''}
        />
        {(errors as any)?.strategy_core?.core_message && (
          <p className="text-sm text-destructive">{(errors as any).strategy_core.core_message.message as string}</p>
        )}
      </div>

      {/* Supporting Messages */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>
            Alátámasztó üzenetek <span className="text-destructive">*</span>
            <span className="text-xs text-muted-foreground ml-2">(min 3, max 5)</span>
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addItem('strategy_core.supporting_messages', supportingMessages)}
            disabled={supportingMessages.length >= 5}
          >
            <Plus className="w-4 h-4 mr-1" />
            Hozzáad
          </Button>
        </div>
        <div className="space-y-2">
          {supportingMessages.map((_: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Alátámasztó üzenet ${index + 1}`}
                value={supportingMessages[index]}
                onChange={(e) => updateItem('strategy_core.supporting_messages', supportingMessages, index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeItem('strategy_core.supporting_messages', supportingMessages, index)}
                disabled={supportingMessages.length <= 3}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        {(errors as any)?.strategy_core?.supporting_messages && (
          <p className="text-sm text-destructive">{(errors as any).strategy_core.supporting_messages.message as string}</p>
        )}
      </div>

      {/* Proof Points */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>
            Bizonyítékok (Proof Points) <span className="text-destructive">*</span>
            <span className="text-xs text-muted-foreground ml-2">(min 2, max 3)</span>
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addItem('strategy_core.proof_points', proofPoints)}
            disabled={proofPoints.length >= 3}
          >
            <Plus className="w-4 h-4 mr-1" />
            Hozzáad
          </Button>
        </div>
        <div className="space-y-2">
          {proofPoints.map((_: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Bizonyíték ${index + 1}`}
                value={proofPoints[index]}
                onChange={(e) => updateItem('strategy_core.proof_points', proofPoints, index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeItem('strategy_core.proof_points', proofPoints, index)}
                disabled={proofPoints.length <= 2}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        {(errors as any)?.strategy_core?.proof_points && (
          <p className="text-sm text-destructive">{(errors as any).strategy_core.proof_points.message as string}</p>
        )}
      </div>

      {/* Objections & Reframes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>
            Kifogáskezelés (Objections & Reframes)
            <span className="text-xs text-muted-foreground ml-2">(opcionális)</span>
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addItem('strategy_core.objections_reframes', objectionsReframes)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Hozzáad
          </Button>
        </div>
        <div className="space-y-2">
          {objectionsReframes.map((_: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Kifogás & megoldás ${index + 1}`}
                value={objectionsReframes[index]}
                onChange={(e) => updateItem('strategy_core.objections_reframes', objectionsReframes, index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeItem('strategy_core.objections_reframes', objectionsReframes, index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        {objectionsReframes.length === 0 && (
          <p className="text-xs text-muted-foreground italic">Nincs kifogáskezelés megadva</p>
        )}
      </div>
    </div>
  )
}
