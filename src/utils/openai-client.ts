/* eslint-disable @typescript-eslint/require-await */
import { CallbackManager } from 'langchain/callbacks';
import type { LLMResult } from 'langchain/schema';
import { OpenAIChat } from 'langchain/llms';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI Credentials');
}

// let tokenUsage = {
//   completionTokens: 0,
//   promptTokens: 0,
//   totalTokens: 0,
// };

export const openai = new OpenAIChat({
  temperature: 0.5,
  maxTokens: 150,
  modelName: 'gpt-3.5-turbo',
  streaming: false,
  // callbackManager: CallbackManager.fromHandlers({
  //   async handleLLMEnd(output: LLMResult) {
  //     const { generations, llmOutput } = output;
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //     console.log(output, 'openai output');
  //     console.log(llmOutput, 'openai llmoutput');
  //     tokenUsage = llmOutput?.tokenUsage;
  //     console.log(tokenUsage, 'openai token usage');

  //     for (let i = 0; i < generations.length; i++) {
  //       console.log(...generations[i], 'generations');
  //     }
  //   },
  // }),
});
