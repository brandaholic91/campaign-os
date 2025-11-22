'use client'

import { CopilotKit } from '@copilotkit/react-core'
import { ReactNode, Component, ErrorInfo } from 'react'

interface CopilotKitProviderProps {
  children: ReactNode
  properties?: Record<string, unknown>
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class CopilotKitErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('[CopilotKit Error Boundary] Error caught:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CopilotKit Error Boundary] Component stack:', errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      // Graceful degradation: render children without CopilotKit wrapper (AC: #9)
      console.log('[CopilotKit Error Boundary] Rendering without CopilotKit due to error')
      return this.props.children
    }

    return this.props.children
  }
}

/**
 * CopilotKitProvider - Root provider for CopilotKit with error boundary
 * AC: #8, #9 - Progressive enhancement with graceful degradation
 */
export function CopilotKitProvider({ children, properties }: CopilotKitProviderProps) {
  // Get runtime URL from environment or use default
  const runtimeUrl = process.env.NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL || '/api/copilotkit'
  
  // Enable dev console in development for error debugging
  const showDevConsole = process.env.NODE_ENV === 'development'

  return (
    <CopilotKitErrorBoundary>
      <CopilotKit 
        runtimeUrl={runtimeUrl}
        properties={properties}
        showDevConsole={showDevConsole}
        onError={(errorEvent) => {
          // Log errors for debugging
          console.error('[CopilotKit Error]', {
            type: errorEvent.type,
            source: errorEvent.context.source,
            error: errorEvent.error,
            context: errorEvent.context,
          })
        }}
      >
        {children}
      </CopilotKit>
    </CopilotKitErrorBoundary>
  )
}

