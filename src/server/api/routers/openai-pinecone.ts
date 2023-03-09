import { z } from 'zod';
import { VectorDBQAChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { openai } from '@/utils/openai-client';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';

import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/api/trpc';

export const openAiPinecone = createTRPCRouter({
  getAnswer: protectedProcedure.input(z.object({ question: z.string() })).mutation(async ({ ctx, input }) => {
    const { question } = input;
    const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

    const index = pinecone.Index(PINECONE_INDEX_NAME);
    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      index,
      new OpenAIEmbeddings({ modelName: 'text-embedding-ada-002' }),
      'text',
      PINECONE_NAME_SPACE //optional
    );

    const model = openai;
    // create the chain
    const chain = VectorDBQAChain.fromLLM(model, vectorStore);

    //Ask a question
    const response = await chain.call({
      query: sanitizedQuestion,
    });

    console.log('response', response);

    return {
      response,
    };
  }),
});
