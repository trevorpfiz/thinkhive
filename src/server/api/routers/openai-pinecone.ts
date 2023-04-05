import { z } from 'zod';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
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
      z.object({
        question: z.string().max(650),
        chatHistory: z.array(z.string()).max(100),
        systemMessage: z.string(),
        metadataIds: z.array(z.string()),
        expertId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { question, chatHistory, systemMessage, metadataIds, expertId } = input;
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
          id: expertId,
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
      // chat history tokens, check if needed
      const chatHistoryTokens = encoding.encode(chatHistory.join(' ')).length;
      console.log('questionTokens', questionTokens);
      console.log(chatHistoryTokens, 'chatHistoryTokens');
      const embeddingTokens = questionTokens + chatHistoryTokens;

      // FIXME - we don't know how many tokens the response will be, which takes away from prisma transaction atomicity, and these are also long queries which will hurt database performance
      // 1. Check if user has enough credits for the question.
      const fromCredits = await hasEnoughCredits(userId, embeddingTokens / 5);

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

      const qaTemplate = `Given the context provided below, answer the question. If the exact information requested is unavailable, provide any relevant information related to the topic from the context. Provide a helpful and concise answer. ${systemMessage ? systemMessage.replace(/\{/g, '(').replace(/\}/g, ')') : ''}
      Context: {context}
      Question: {question}
      Helpful Answer:`;
      const model = openai;
      // create the chain
      // FIXME - this is a bug in langchain
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
        qaTemplate,
      });

      // Ask a question
      const response = await chain.call({
        question: sanitizedQuestion,
        chat_history: chatHistory,
      });

      // 3. Update user credits and usage.
      // subtract credits from user
      console.log(tokenUsage, 'tokenUsage');
      // TODO - might not be tracking the adaQuestionTokens correctly
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          credits: {
            decrement: fromCredits ? (tokenUsage.totalTokens + embeddingTokens / 5) / 1000 : 0,
          },
          additionalCredits: {
            decrement: !fromCredits ? (tokenUsage.totalTokens + embeddingTokens / 5) / 1000 : 0,
          },
          embeddingUsage: {
            increment: embeddingTokens,
          },
          llmUsage: {
            increment: tokenUsage.totalTokens,
          },
        },
      });

      return {
        response,
      };
    }),
});
