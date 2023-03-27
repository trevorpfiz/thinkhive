import { z } from 'zod';
import { VectorDBQAChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { get_encoding } from '@dqbd/tiktoken';
import { getClientIp } from 'request-ip';

import { openai, tokenUsage } from '@/utils/openai-client';
import { pinecone } from '@/utils/pinecone';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { messageLimit } from '@/server/helpers/ratelimit';
import { TRPCError } from '@trpc/server';

export const openAiPinecone = createTRPCRouter({
  getAnswer: protectedProcedure
    .input(z.object({ question: z.string(), metadataIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { question, metadataIds } = input;
      const { req } = ctx;

      // rate limit
      const ip = getClientIp(req);
      if (!ip) throw new TRPCError({ code: 'BAD_REQUEST' });
      const { success } = await messageLimit.limit(ip);
      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });

      const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

      const encoding = get_encoding('cl100k_base');
      const questionTokens = encoding.encode(sanitizedQuestion).length;
      console.log('questionTokens', questionTokens);

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

      // Ask a question
      const response = await chain.call({
        query: sanitizedQuestion,
      });
      console.log('response', response);

      // Add ada question tokens to total tokens from openai callback
      const adaQuestionTokens = questionTokens / 5;
      const messageTokens = tokenUsage.totalTokens + adaQuestionTokens;
      console.log(messageTokens, 'messageTokens');

      // subtract credits from user
      await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          credits: {
            decrement: messageTokens / 1000,
          },
          questionUsage: {
            increment: questionTokens,
          },
          responseUsage: {
            increment: tokenUsage.totalTokens,
          },
        },
      });

      return {
        response,
      };
    }),
});
