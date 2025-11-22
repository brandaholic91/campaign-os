/**
 * Frontend tools for CopilotKit agent interaction
 * These tools allow the agent to manipulate the UI directly
 */

export interface FieldHighlightOptions {
  duration?: number // milliseconds, default 3000
  color?: string // CSS color, default 'yellow'
}

/**
 * Highlight a form field to draw user attention
 * @param fieldId - data-field-id attribute value
 * @param options - Highlight options (duration, color)
 */
export function highlightField(
  fieldId: string,
  options: FieldHighlightOptions = {}
): void {
  const { duration = 3000, color = 'yellow' } = options

  const element = document.querySelector(`[data-field-id="${fieldId}"]`) as HTMLElement
  
  if (!element) {
    console.warn(`[highlightField] Field not found: ${fieldId}`)
    return
  }

  console.log(`[highlightField] Highlighting field: ${fieldId}`)

  // Store original styles
  const originalBorder = element.style.border
  const originalBoxShadow = element.style.boxShadow
  const originalTransition = element.style.transition
  const originalOutline = element.style.outline

  // Apply highlight styles with animation
  element.style.transition = 'all 0.3s ease-in-out'
  element.style.border = `2px solid ${color}`
  element.style.boxShadow = `0 0 12px ${color}40`
  element.style.outline = `none`

  // Add pulsing animation
  let pulseCount = 0
  const maxPulses = 2
  const pulseInterval = duration / (maxPulses * 2)
  
  const pulseAnimation = setInterval(() => {
    if (pulseCount >= maxPulses) {
      clearInterval(pulseAnimation)
      return
    }
    element.style.boxShadow = pulseCount % 2 === 0 
      ? `0 0 16px ${color}80`
      : `0 0 8px ${color}40`
    pulseCount++
  }, pulseInterval)

  // Scroll into view
  element.scrollIntoView({ behavior: 'smooth', block: 'center' })

  // Remove highlight after duration
  setTimeout(() => {
    clearInterval(pulseAnimation)
    element.style.transition = originalTransition
    element.style.border = originalBorder
    element.style.boxShadow = originalBoxShadow
    element.style.outline = originalOutline
  }, duration)
}

/**
 * Prefill a form field with a suggested value
 * @param fieldId - data-field-id attribute value
 * @param value - Value to prefill
 */
export function prefillField(fieldId: string, value: string): void {
  const element = document.querySelector(`[data-field-id="${fieldId}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  
  if (!element) {
    console.warn(`[prefillField] Field not found: ${fieldId}`)
    return
  }

  console.log(`[prefillField] Prefilling field: ${fieldId} with value:`, value)

  // Store original value for animation
  const originalValue = element.value

  // Dispatch change event for React state management
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(element, value)
  } else {
    element.value = value
  }

  // Trigger React onChange event
  const event = new Event('input', { bubbles: true })
  element.dispatchEvent(event)

  // Visual feedback: animated prefill with green highlight and fade-in
  const originalTransition = element.style.transition
  element.style.transition = 'all 0.3s ease-in-out'
  element.style.backgroundColor = 'rgba(34, 197, 94, 0.1)'
  
  // Highlight with green color
  highlightField(fieldId, { duration: 1500, color: 'rgb(34, 197, 94)' })
  
  // Fade out background color
  setTimeout(() => {
    element.style.backgroundColor = ''
    element.style.transition = originalTransition
  }, 1500)
}

/**
 * Navigate to a specific step in a multi-step wizard
 * @param stepId - Step identifier (e.g., 'step-1', 'step-2')
 */
export function navigateToStep(stepId: string): void {
  console.log(`[navigateToStep] Navigating to step: ${stepId}`)
  
  // Find step button or link
  const stepButton = document.querySelector(`[data-step-id="${stepId}"]`) as HTMLElement
  
  if (!stepButton) {
    console.warn(`[navigateToStep] Step not found: ${stepId}`)
    return
  }

  // Visual feedback: highlight the step button before navigation
  const originalTransition = stepButton.style.transition
  const originalBackground = stepButton.style.backgroundColor
  const originalBoxShadow = stepButton.style.boxShadow
  
  stepButton.style.transition = 'all 0.3s ease-in-out'
  stepButton.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
  stepButton.style.boxShadow = '0 0 8px rgba(59, 130, 246, 0.3)'
  
  // Scroll into view
  stepButton.scrollIntoView({ behavior: 'smooth', block: 'center' })
  
  // Click after brief delay for visual feedback
  setTimeout(() => {
    stepButton.click()
    
    // Restore original styles
    setTimeout(() => {
      stepButton.style.transition = originalTransition
      stepButton.style.backgroundColor = originalBackground
      stepButton.style.boxShadow = originalBoxShadow
    }, 500)
  }, 300)
}

export interface SuggestionModalPayload {
  title?: string
  content: string
  type?: 'info' | 'success' | 'warning' | 'error'
}

/**
 * Open a modal with suggestions or information
 * @param type - Modal type (currently supports 'suggestion')
 * @param payload - Modal payload with title, content, type
 */
export function openSuggestionModal(
  type: string,
  payload: SuggestionModalPayload
): void {
  console.log(`[openSuggestionModal] Opening modal:`, { type, payload })
  
  // Dispatch custom event for modal display (AC: #3, #4, #5 - tool execution feedback)
  const modalEvent = new CustomEvent('copilotkit:suggestion-modal', {
    detail: { type, payload },
    bubbles: true,
  })
  document.dispatchEvent(modalEvent)
  
  // Fallback to browser alert if no listener is registered
  // In production, this would be handled by a custom modal component
  if (type === 'suggestion') {
    const title = payload.title || 'Javaslat'
    // Use setTimeout to allow custom listeners to handle first
    setTimeout(() => {
      if (!document.querySelector('[data-copilotkit-modal]')) {
        alert(`${title}\n\n${payload.content}`)
      }
    }, 100)
  } else {
    console.warn(`[openSuggestionModal] Unknown modal type: ${type}`)
  }
}
