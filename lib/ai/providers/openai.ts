import OpenAI from 'openai';
import { BaseAIProvider } from './base';
import { GenerateTextOptions, GenerateTextResponse, StreamChunk } from '../types';

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    super();
    this.client = new OpenAI({
      apiKey,
    });
  }

  async _generateText(options: GenerateTextOptions): Promise<GenerateTextResponse> {
    const { model, systemPrompt, messages, maxTokens, temperature } = options;

    const apiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      apiMessages.push({ role: 'system', content: systemPrompt });
    }

    messages.forEach(m => {
      apiMessages.push({ role: m.role, content: m.content });
    });

    const response = await this.client.chat.completions.create({
      model: model || 'gpt-4o',
      messages: apiMessages,
      max_tokens: maxTokens,
      temperature: temperature,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      model: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  }

  async *_generateStream(options: GenerateTextOptions): AsyncGenerator<StreamChunk, void, unknown> {
    const { model, systemPrompt, messages, maxTokens, temperature } = options;

    const apiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      apiMessages.push({ role: 'system', content: systemPrompt });
    }

    messages.forEach(m => {
      apiMessages.push({ role: m.role, content: m.content });
    });

    const stream = await this.client.chat.completions.create({
      model: model || 'gpt-4o',
      messages: apiMessages,
      max_tokens: maxTokens,
      temperature: temperature,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield {
          content,
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
