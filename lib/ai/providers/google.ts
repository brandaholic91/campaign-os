import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIProvider } from './base';
import { GenerateTextOptions, GenerateTextResponse, StreamChunk } from '../types';

export class GoogleProvider extends BaseAIProvider {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    super();
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async _generateText(options: GenerateTextOptions): Promise<GenerateTextResponse> {
    const { model, systemPrompt, messages, maxTokens, temperature } = options;

    const genModel = this.client.getGenerativeModel({
      model: model || 'gemini-1.5-pro',
      systemInstruction: systemPrompt,
    });

    const chat = genModel.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    const text = response.text();

    return {
      content: text,
      model: model || 'gemini-1.5-pro',
      usage: {
        promptTokens: 0, // Google SDK doesn't always provide token usage in simple response
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }

  async *_generateStream(options: GenerateTextOptions): AsyncGenerator<StreamChunk, void, unknown> {
    const { model, systemPrompt, messages, maxTokens, temperature } = options;

    const genModel = this.client.getGenerativeModel({
      model: model || 'gemini-1.5-pro',
      systemInstruction: systemPrompt,
    });

    const chat = genModel.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessageStream(lastMessage.content);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield {
          content: chunkText,
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
