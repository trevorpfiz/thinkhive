import { z } from 'zod';
import { VectorDBQAChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { get_encoding } from '@dqbd/tiktoken';
import { getClientIp } from 'request-ip';

import { openai, tokenUsage } from '@/utils/openai-client';
import { pinecone } from '@/utils/pinecone';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { messageLimitDay, messageLimitMinute } from '@/server/helpers/ratelimit';
import { TRPCError } from '@trpc/server';
import { hasEnoughCredits } from '@/server/helpers/permissions';

export const openAiPinecone = createTRPCRouter({
  getAnswer: publicProcedure
    .input(
      z.object({ question: z.string(), metadataIds: z.array(z.string()), expertId: z.string() })
    )
    .mutation(async ({ ctx, input }) => {
      const { question, metadataIds } = input;
      const { req, prisma } = ctx;

      // rate limit
      const ip = getClientIp(req);
      if (!ip) throw new TRPCError({ code: 'BAD_REQUEST' });
      const { success } = await messageLimitMinute.limit(ip);
      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
      const { success: successDay } = await messageLimitDay.limit(ip);
      if (!successDay) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });

      // get userId from expertId
      const expertUserId = await prisma.expert.findUnique({
        where: {
          id: input.expertId,
        },
        select: {
          userId: true,
        },
      });

      if (!expertUserId) throw new TRPCError({ code: 'BAD_REQUEST' });
      const userId = expertUserId?.userId;

      const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

      const encoding = get_encoding('cl100k_base');
      const questionTokens = encoding.encode(sanitizedQuestion).length;
      const adaQuestionTokens = questionTokens / 5;
      console.log('questionTokens', questionTokens);

      // FIXME - we don't know how many tokens the response will be, which takes away from prisma transaction atomicity, and these are also long queries which will hurt database performance
      // 1. Check if user has enough credits for the question.
      await hasEnoughCredits(userId, adaQuestionTokens);

      // 2. Metadata filtering and VectorDBQAChain.
      const filter = {
        metadataId: { $in: metadataIds },
      };

      const index = pinecone.Index(PINECONE_INDEX_NAME);
      const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({ modelName: 'text-embedding-ada-002' }),
        {
          namespace: userId,
          pineconeIndex: index,
          textKey: 'text',
          filter: filter,
        }
      );

      const model = openai;
      // create the chain
      const chain = VectorDBQAChain.fromLLM(model, vectorStore, { k: 4 });

      // Ask a question
      const response = await chain.call({
        query: sanitizedQuestion,
      });

      // 3. Update user credits and usage.
      // Add ada question tokens to total tokens from openai callback
      const messageTokens = tokenUsage.totalTokens + adaQuestionTokens;
      console.log(messageTokens, 'messageTokens');

      // subtract credits from user
      // TODO - might not be tracking the adaQuestionTokens correctly
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          credits: {
            decrement: tokenUsage.totalTokens / 1000,
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
