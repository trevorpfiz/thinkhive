import { z } from 'zod';
import { VectorDBQAChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { get_encoding } from '@dqbd/tiktoken';

import { openai } from '@/utils/openai-client';
import { pinecone } from '@/utils/pinecone';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const openAiPinecone = createTRPCRouter({
  getAnswer: protectedProcedure
    .input(z.object({ question: z.string(), metadataIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { question, metadataIds } = input;
      const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

      const encoding = get_encoding('cl100k_base');
      const questionTokens = encoding.encode(sanitizedQuestion).length;

      // metadata filtering
      const filter = {
        metadataId: { $in: metadataIds },
      };

      const index = pinecone.Index(PINECONE_INDEX_NAME);
      /* create vectorstore*/
      const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({ modelName: 'text-embedding-ada-002' }),
        {
          namespace: ctx.session.user.id,
          pineconeIndex: index,
          textKey: 'text',
          filter: filter,
        }
      );

      const model = openai;
      // create the chain
      const chain = VectorDBQAChain.fromLLM(model, vectorStore);

      //Ask a question
      const response = await chain.call({
        query: sanitizedQuestion,
      });

      console.log('response', response);

      // add to user's question and message tokens
      await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          questionTokens: {
            increment: questionTokens,
          },
          // messageTokens: {
          //   increment: messageTokens,
          // },
        },
      });

      return {
        response,
      };
    }),
});