import { AIProvider, GenerateTextOptions, GenerateTextResponse, StreamChunk } from '../types';

export abstract class BaseAIProvider implements AIProvider {
  abstract _generateText(options: GenerateTextOptions): Promise<GenerateTextResponse>;
  abstract _generateStream(options: GenerateTextOptions): AsyncGenerator<StreamChunk, void, unknown>;

  async generateText(options: GenerateTextOptions): Promise<GenerateTextResponse> {
    try {
      return await this._generateText(options);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async *generateStream(options: GenerateTextOptions): AsyncGenerator<StreamChunk, void, unknown> {
    try {
      yield* this._generateStream(options);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  protected handleError(error: any): void {
    // Base error handling logic, can be overridden by subclasses
    console.error('AI Provider Error:', error);
  }

  protected extractJson(text: string): any {
    try {
      // Try parsing directly first
      return JSON.parse(text);
    } catch (e) {
      // If that fails, try to extract from markdown code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (e2) {
          console.error('Failed to parse extracted JSON:', e2);
        }
      }
      throw new Error('Failed to extract JSON from response');
    }
  }
}
