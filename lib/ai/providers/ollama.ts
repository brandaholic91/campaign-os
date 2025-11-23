import { BaseAIProvider } from './base';
import { GenerateTextOptions, GenerateTextResponse, StreamChunk } from '../types';

export class OllamaProvider extends BaseAIProvider {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    super();
    this.baseUrl = baseUrl;
  }

  async _generateText(options: GenerateTextOptions): Promise<GenerateTextResponse> {
    const { model, systemPrompt, messages, maxTokens, temperature } = options;

    const apiMessages = [];

    if (systemPrompt) {
      apiMessages.push({ role: 'system', content: systemPrompt });
    }

    messages.forEach(m => {
      apiMessages.push({ role: m.role, content: m.content });
    });

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'llama2',
        messages: apiMessages,
        stream: false,
        options: {
          num_predict: maxTokens,
          temperature: temperature,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.message.content,
      model: data.model,
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
    };
  }

  async *_generateStream(options: GenerateTextOptions): AsyncGenerator<StreamChunk, void, unknown> {
    const { model, systemPrompt, messages, maxTokens, temperature } = options;

    const apiMessages = [];

    if (systemPrompt) {
      apiMessages.push({ role: 'system', content: systemPrompt });
    }

    messages.forEach(m => {
      apiMessages.push({ role: m.role, content: m.content });
    });

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'llama2',
        messages: apiMessages,
        stream: true,
        options: {
          num_predict: maxTokens,
          temperature: temperature,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Ollama API response body is empty');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              yield {
                content: data.message.content,
                done: false,
              };
            }
            if (data.done) {
              yield {
                content: '',
                done: true,
              };
            }
          } catch (e) {
            console.error('Error parsing Ollama stream chunk:', e);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
