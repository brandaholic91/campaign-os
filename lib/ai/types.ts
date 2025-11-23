export type ProviderType = 'anthropic' | 'openai' | 'google' | 'ollama';

export interface GenerateTextOptions {
  model?: string;
  systemPrompt?: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
  }[];
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateTextResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

export interface AIProvider {
  generateText(options: GenerateTextOptions): Promise<GenerateTextResponse>;
  generateStream(options: GenerateTextOptions): AsyncGenerator<StreamChunk, void, unknown>;
}
