import { z } from 'zod';
import { VectorDBQAChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { openai } from '@/utils/openai-client';
import { pinecone } from '@/utils/pinecone';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';

import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/api/trpc';

export const openAiPinecone = createTRPCRouter({
  getAnswer: protectedProcedure
    .input(z.object({ question: z.string() }))
    // .input(z.object({ question: z.string(), metadataIds: z.array(z.string()), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { question } = input;
      const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

      const index = pinecone.Index(PINECONE_INDEX_NAME);
      /* create vectorstore*/
      const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({ modelName: 'text-embedding-ada-002' }),
        {
          namespace: PINECONE_NAME_SPACE,
          pineconeIndex: index,
          textKey: 'text',
        }
      );

      const model = openai;
      // create the chain
      const chain = VectorDBQAChain.fromLLM(model, vectorStore);

      //Ask a question
      const response = await chain.call({
        query: sanitizedQuestion,
      });

      // FIXME - Metadata filtering
      // const filter = {
      //   metadataId: { $in: metadataIds },
      // };

      // Query Pinecone with metadata filtering
      // const queryResponse = await index.query({
      //   queryRequest: {
      //     namespace: PINECONE_NAME_SPACE,
      //     topK: 1000,
      //     filter: filter,
      //   },
      // });

      // Process the query response and get the answer
      // const matches = queryResponse.matches;

      console.log('response', response);

      return {
        response,
      };
    }),
});
