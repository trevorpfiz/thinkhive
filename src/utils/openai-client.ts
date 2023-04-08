/* eslint-disable @typescript-eslint/require-await */
import { CallbackManager } from 'langchain/callbacks';
import type { LLMResult } from 'langchain/schema';
import { ChatOpenAI } from 'langchain/chat_models';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI Credentials');
}

export let tokenUsage = {
  completionTokens: 0,
  promptTokens: 0,
  totalTokens: 0,
};

export const openai = new ChatOpenAI({
  temperature: 0,
  maxTokens: 300,
  modelName: 'gpt-3.5-turbo',
  streaming: false,
  callbackManager: CallbackManager.fromHandlers({
    async handleLLMEnd(output: LLMResult) {
      const { generations, llmOutput } = output;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      tokenUsage = llmOutput?.tokenUsage;
      console.log(tokenUsage, 'openai token usage');
    },
  }),
});
