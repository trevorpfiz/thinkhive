import { OpenAI } from 'langchain/llms';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI Credentials');
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
export const openai = new OpenAI({
  temperature: 0,
  maxTokens: 150,
  modelName: 'gpt-3.5-turbo',
});
