import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, ProviderType } from './types';
import { AnthropicProvider } from './providers/anthropic';
import { OpenAIProvider } from './providers/openai';
import { GoogleProvider } from './providers/google';
import { OllamaProvider } from './providers/ollama';
import { APIKeyMissingError, MissingApiKeyError } from './errors';

export function getAIProvider(providerType?: ProviderType): AIProvider {
  const type = providerType || (process.env.AI_PROVIDER as ProviderType) || 'anthropic';

  switch (type) {
    case 'anthropic':
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) {
        throw new APIKeyMissingError('anthropic', 'ANTHROPIC_API_KEY');
      }
      return new AnthropicProvider(anthropicKey);

    case 'openai':
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        throw new APIKeyMissingError('openai', 'OPENAI_API_KEY');
      }
      return new OpenAIProvider(openaiKey);

    case 'google':
      const googleKey = process.env.GOOGLE_API_KEY;
      if (!googleKey) {
        throw new APIKeyMissingError('google', 'GOOGLE_API_KEY');
      }
      return new GoogleProvider(googleKey);

    case 'ollama':
      const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      return new OllamaProvider(ollamaUrl);

    default:
      throw new Error(`Unsupported AI provider: ${type}`);
  }
}

// Backward compatibility
export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new MissingApiKeyError('ANTHROPIC_API_KEY');
  }
  return new Anthropic({
    apiKey,
    timeout: 60_000,
  });
}
