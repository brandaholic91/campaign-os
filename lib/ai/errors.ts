import { setTimeout as wait } from 'node:timers/promises'

export class RateLimitError extends Error {
  constructor(message = 'API rate limit exceeded. Please retry in a moment.') {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class AIProviderError extends Error {
  constructor(message: string, public provider?: string, public originalError?: unknown) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export class APIKeyMissingError extends AIProviderError {
  constructor(provider: string, envVarName: string) {
    super(`Missing API key for provider ${provider}: ${envVarName}`, provider);
    this.name = 'APIKeyMissingError';
  }
}

export class MissingApiKeyError extends Error {
  constructor(envVarName = 'ANTHROPIC_API_KEY') {
    super(`Missing required environment variable: ${envVarName}`)
    this.name = 'MissingApiKeyError'
  }
}

export class AnthropicClientError extends Error {
  constructor(message?: string) {
    super(message ?? 'Anthropic client initialization failed')
    this.name = 'AnthropicClientError'
  }
}

interface RetryOptions {
  attempts?: number
  initialDelayMs?: number
  multiplier?: number
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const attempts = Math.max(options.attempts ?? 3, 1)
  const baseDelay = options.initialDelayMs ?? 500
  const multiplier = options.multiplier ?? 2

  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt === attempts) {
        break
      }
      const delay = baseDelay * multiplier ** (attempt - 1)
      await wait(delay)
    }
  }

  throw lastError
}

export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Ismeretlen hiba történt az AI szolgáltatással'
}

