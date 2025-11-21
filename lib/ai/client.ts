import Anthropic from '@anthropic-ai/sdk'
import { MissingApiKeyError } from './errors'

const apiKey = process.env.ANTHROPIC_API_KEY

if (!apiKey) {
  throw new MissingApiKeyError('ANTHROPIC_API_KEY')
}

const anthropicClient = new Anthropic({
  apiKey,
  timeout: 60_000,
})

export function getAnthropicClient() {
  return anthropicClient
}

