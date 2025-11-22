'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Suggestion {
  id: string
  fieldId: string
  value: string
  description?: string
}

interface InlineSuggestionsProps {
  suggestions: Suggestion[]
  onAccept: (suggestion: Suggestion) => void
  onReject: (suggestion: Suggestion) => void
  className?: string
}

export function InlineSuggestions({
  suggestions,
  onAccept,
  onReject,
  className,
}: InlineSuggestionsProps) {
  const [visibleSuggestions, setVisibleSuggestions] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Add new suggestions to visible set with slight delay for animation
    suggestions.forEach((suggestion) => {
      if (!visibleSuggestions.has(suggestion.id)) {
        setTimeout(() => {
          setVisibleSuggestions((prev) => new Set(prev).add(suggestion.id))
        }, 50)
      }
    })
  }, [suggestions])

  const handleAccept = (suggestion: Suggestion) => {
    // Remove from visible set with animation
    setVisibleSuggestions((prev) => {
      const next = new Set(prev)
      next.delete(suggestion.id)
      return next
    })
    
    // Call onAccept after animation
    setTimeout(() => {
      onAccept(suggestion)
    }, 200)
  }

  const handleReject = (suggestion: Suggestion) => {
    // Remove from visible set with animation
    setVisibleSuggestions((prev) => {
      const next = new Set(prev)
      next.delete(suggestion.id)
      return next
    })
    
    // Call onReject after animation
    setTimeout(() => {
      onReject(suggestion)
    }, 200)
  }

  if (suggestions.length === 0) return null

  return (
    <div className={cn('space-y-2', className)}>
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className={cn(
            'flex items-start gap-2 p-3 rounded-lg border border-primary/20 bg-primary/5',
            'transition-all duration-200',
            visibleSuggestions.has(suggestion.id)
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          )}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-primary">
                Javaslat
              </span>
              {suggestion.description && (
                <span className="text-xs text-muted-foreground">
                  {suggestion.description}
                </span>
              )}
            </div>
            <p className="text-sm font-medium truncate">
              {suggestion.value}
            </p>
          </div>
          
          <div className="flex gap-1 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => handleAccept(suggestion)}
              aria-label="Javaslat elfogadása"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleReject(suggestion)}
              aria-label="Javaslat elutasítása"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
