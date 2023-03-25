import { CallbackManager } from 'langchain/callbacks';
import type { LLMResult } from 'langchain/schema';
import { OpenAI } from 'langchain/llms';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI Credentials');
}

let tokenUsage = {
  completionTokens: 0,
  promptTokens: 0,
  totalTokens: 0,
};

export const openai = new OpenAI({
  temperature: 0.5,
  maxTokens: 150,
  modelName: 'gpt-3.5-turbo',
  callbackManager: CallbackManager.fromHandlers({
    // eslint-disable-next-line @typescript-eslint/require-await
    async handleLLMEnd(output: LLMResult) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      tokenUsage = output.llmOutput?.tokenUsage;
      console.log(tokenUsage);
    },
  }),
});
