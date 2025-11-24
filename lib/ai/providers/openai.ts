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

    const modelName = model || process.env.AI_MODEL;
    if (!modelName) {
      throw new Error('Model name is required. Set AI_MODEL environment variable or provide model in options.');
    }
    // o1 és gpt-5 modellek max_completion_tokens paramétert használnak max_tokens helyett
    const usesMaxCompletionTokens = modelName.startsWith('o1') || modelName.startsWith('gpt-5');
    
    const requestParams: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
      model: modelName,
      messages: apiMessages,
    };

    // gpt-5 modellek nem támogatják a temperature paramétert
    if (temperature !== undefined && !modelName.startsWith('gpt-5')) {
      requestParams.temperature = temperature;
    }

    if (maxTokens) {
      if (usesMaxCompletionTokens) {
        requestParams.max_completion_tokens = maxTokens;
      } else {
        requestParams.max_tokens = maxTokens;
      }
    }

    const response = await this.client.chat.completions.create(requestParams);

    const firstChoice = response.choices[0];
    const content = firstChoice?.message?.content;
    const finishReason = firstChoice?.finish_reason;
    
    // Log részletek, ha üres a válasz
    if (!content) {
      console.error('[OpenAIProvider] Empty response received:', {
        model: modelName,
        choicesCount: response.choices?.length || 0,
        firstChoice: firstChoice,
        finishReason: finishReason,
        usage: response.usage,
        responseId: response.id,
        message: firstChoice?.message,
      });
      
      // Ha a finish_reason nem 'stop', akkor valami probléma van
      if (finishReason && finishReason !== 'stop') {
        console.error('[OpenAIProvider] Finish reason indicates issue:', {
          finishReason: finishReason,
          possibleReasons: {
            'length': 'Response was cut off due to max_tokens limit',
            'content_filter': 'Response was filtered by content filter',
            'function_call': 'Model decided to call a function',
            'tool_calls': 'Model decided to make tool calls',
          }
        });
      }
    }

    // Ha nincs content, de van finish_reason, próbáljuk meg visszaadni egy üres stringet
    // és logoljuk a részleteket
    if (!content) {
      console.warn('[OpenAIProvider] Returning empty content. This may indicate an issue with the API call.');
    }

    return {
      content: content || '',
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

    const modelName = model || process.env.AI_MODEL;
    if (!modelName) {
      throw new Error('Model name is required. Set AI_MODEL environment variable or provide model in options.');
    }
    // o1 és gpt-5 modellek max_completion_tokens paramétert használnak max_tokens helyett
    const usesMaxCompletionTokens = modelName.startsWith('o1') || modelName.startsWith('gpt-5');
    
    const requestParams: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
      model: modelName,
      messages: apiMessages,
      stream: true,
    };

    // gpt-5 modellek nem támogatják a temperature paramétert
    if (temperature !== undefined && !modelName.startsWith('gpt-5')) {
      requestParams.temperature = temperature;
    }

    if (maxTokens) {
      if (usesMaxCompletionTokens) {
        requestParams.max_completion_tokens = maxTokens;
      } else {
        requestParams.max_tokens = maxTokens;
      }
    }

    const stream = await this.client.chat.completions.create(requestParams);

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
