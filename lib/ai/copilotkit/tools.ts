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

  // Apply highlight styles
  element.style.transition = 'all 0.3s ease-in-out'
  element.style.border = `2px solid ${color}`
  element.style.boxShadow = `0 0 8px ${color}`

  // Scroll into view
  element.scrollIntoView({ behavior: 'smooth', block: 'center' })

  // Remove highlight after duration
  setTimeout(() => {
    element.style.transition = originalTransition
    element.style.border = originalBorder
    element.style.boxShadow = originalBoxShadow
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

  // Visual feedback: brief highlight
  highlightField(fieldId, { duration: 1000, color: 'green' })
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

  // Click the step button
  stepButton.click()
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
  
  // For now, use browser alert (can be replaced with custom modal component)
  // In production, this would dispatch an event to show a custom modal
  if (type === 'suggestion') {
    const title = payload.title || 'Javaslat'
    alert(`${title}\n\n${payload.content}`)
  } else {
    console.warn(`[openSuggestionModal] Unknown modal type: ${type}`)
  }
}
