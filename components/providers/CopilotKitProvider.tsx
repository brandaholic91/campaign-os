'use client'

import { CopilotKit } from '@copilotkit/react-core'
import { ReactNode } from 'react'

interface CopilotKitProviderProps {
  children: ReactNode
}

export function CopilotKitProvider({ children }: CopilotKitProviderProps) {
  // Get runtime URL from environment or use default
  const runtimeUrl = process.env.NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL || '/api/copilotkit'

  return (
    <CopilotKit runtimeUrl={runtimeUrl}>
      {children}
    </CopilotKit>
  )
}

