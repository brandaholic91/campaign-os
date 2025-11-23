import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider } from './base';
import { GenerateTextOptions, GenerateTextResponse, StreamChunk } from '../types';

export class AnthropicProvider extends BaseAIProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    super();
    this.client = new Anthropic({
      apiKey,
    });
  }

  async _generateText(options: GenerateTextOptions): Promise<GenerateTextResponse> {
    const { model, systemPrompt, messages, maxTokens, temperature } = options;

    const response = await this.client.messages.create({
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens || 4096,
      temperature: temperature,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Handle different content block types
    const textContent = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as Anthropic.TextBlock).text)
      .join('');

    return {
      content: textContent,
      model: response.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  async *_generateStream(options: GenerateTextOptions): AsyncGenerator<StreamChunk, void, unknown> {
    const { model, systemPrompt, messages, maxTokens, temperature } = options;

    const stream = await this.client.messages.create({
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens || 4096,
      temperature: temperature,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield {
          content: chunk.delta.text,
          done: false,
        };
      }
    }

    yield {
      content: '',
      done: true,
    };
  }
}
