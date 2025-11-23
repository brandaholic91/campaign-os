import { getAIProvider } from '../lib/ai/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testProvider() {
  const providerType = process.env.AI_PROVIDER || 'anthropic';
  console.log(`Testing AI Provider: ${providerType}`);

  try {
    const provider = getAIProvider();
    
    console.log('Generating text...');
    const response = await provider.generateText({
      messages: [{ role: 'user', content: 'Say hello and identify yourself.' }],
      maxTokens: 100,
    });

    console.log('Response:', response.content);
    console.log('Model:', response.model);
    console.log('Usage:', response.usage);

    console.log('\nTesting streaming...');
    const stream = provider.generateStream({
      messages: [{ role: 'user', content: 'Count to 5.' }],
      maxTokens: 100,
    });

    process.stdout.write('Stream output: ');
    for await (const chunk of stream) {
      process.stdout.write(chunk.content);
    }
    console.log('\n\nTest completed successfully.');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testProvider();
