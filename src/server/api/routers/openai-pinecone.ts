import { get_encoding } from '@dqbd/tiktoken';
import { TRPCError } from '@trpc/server';
import { CallbackManager } from 'langchain/callbacks';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { type LLMResult } from 'langchain/dist/schema';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { getClientIp } from 'request-ip';
import { z } from 'zod';

import { PINECONE_INDEX_NAME } from '~/config/pinecone';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { hasEnoughCredits } from '~/server/helpers/permissions';
import { messageLimitDay, messageLimitMinute } from '~/server/helpers/ratelimit';
import { initPinecone } from '~/utils/pinecone';

export const openAiPinecone = createTRPCRouter({
  getAnswer: publicProcedure
    .input(
      z.object({
        question: z.string().max(650),
        chatHistory: z.array(z.string()).max(100),
        systemMessage: z.string(),
        metadataIds: z.array(z.string()),
        assistantId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { question, chatHistory, systemMessage, metadataIds, assistantId } = input;
      const { req, prisma } = ctx;

      // rate limit
      const ip = getClientIp(req);
      if (!ip) throw new TRPCError({ code: 'BAD_REQUEST' });
      const { success } = await messageLimitMinute.limit(ip);
      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
      const { success: successDay } = await messageLimitDay.limit(ip);
      if (!successDay) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });

      // get userId from assistantId
      const assistantUserId = await prisma.assistant.findUnique({
        where: {
          id: assistantId,
        },
        select: {
          userId: true,
        },
      });

      if (!assistantUserId) throw new TRPCError({ code: 'BAD_REQUEST' });
      const userId = assistantUserId?.userId;

      const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

      const encoding = get_encoding('cl100k_base');
      const questionTokens = encoding.encode(sanitizedQuestion).length;
      // chat history tokens, check if needed
      const chatHistoryTokens = encoding.encode(chatHistory.join(' ')).length;

      const embeddingTokens = questionTokens + chatHistoryTokens;

      // FIXME - we don't know how many tokens the response will be, which takes away from prisma transaction atomicity, and these are also long queries which will hurt database performance
      // 1. Check if user has enough credits for the question.
      const fromCredits = await hasEnoughCredits(userId, embeddingTokens / 5);

      // 2. Metadata filtering and VectorDBQAChain.
      const filter = {
        metadataId: { $in: metadataIds },
      };

      const pinecone = await initPinecone();
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

      const qaTemplate = `Given the context provided below, answer the question. If the exact information requested is unavailable, provide any relevant information related to the topic from the context. Provide a helpful and concise answer. ${
        systemMessage ? systemMessage.replace(/\{/g, '(').replace(/\}/g, ')') : ''
      }
      Context: {context}
      Question: {question}
      Helpful Answer:`;

      let tokenUsage = {
        completionTokens: 0,
        promptTokens: 0,
        totalTokens: 0,
      };

      const model = new ChatOpenAI({
        temperature: 0.0,
        maxTokens: 300,
        modelName: 'gpt-3.5-turbo',
        streaming: false,
        callbackManager: CallbackManager.fromHandlers({
          // eslint-disable-next-line @typescript-eslint/require-await
          async handleLLMEnd(output: LLMResult) {
            const { generations, llmOutput } = output;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            tokenUsage = llmOutput?.tokenUsage;
          },
        }),
      });
      // create the chain
      // FIXME - this is a bug in langchain
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
        qaTemplate,
        returnSourceDocuments: true,
      });

      // Ask a question
      const response = await chain.call({
        question: sanitizedQuestion,
        chat_history: chatHistory,
      });
      // 3. Update user credits and usage.
      // subtract credits from user
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

  // getAnswerHybrid: publicProcedure
  //   .input(
  //     z.object({
  //       question: z.string().max(650),
  //       chatHistory: z.array(z.string()).max(100),
  //       systemMessage: z.string(),
  //       metadataIds: z.array(z.string()),
  //       assistantId: z.string(),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const { question, chatHistory, systemMessage, metadataIds, assistantId } = input;
  //     const { req, prisma } = ctx;

  //     // rate limit
  //     const ip = getClientIp(req);
  //     if (!ip) throw new TRPCError({ code: 'BAD_REQUEST' });
  //     const { success } = await messageLimitMinute.limit(ip);
  //     if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
  //     const { success: successDay } = await messageLimitDay.limit(ip);
  //     if (!successDay) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });

  //     // get userId from assistantId
  //     const assistantUserId = await prisma.assistant.findUnique({
  //       where: {
  //         id: assistantId,
  //       },
  //       select: {
  //         userId: true,
  //       },
  //     });

  //     if (!assistantUserId) throw new TRPCError({ code: 'BAD_REQUEST' });
  //     const userId = assistantUserId?.userId;

  //     const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  //     const encoding = get_encoding('cl100k_base');
  //     const questionTokens = encoding.encode(sanitizedQuestion).length;
  //     // chat history tokens, check if needed
  //     const chatHistoryTokens = encoding.encode(chatHistory.join(' ')).length;

  //     const embeddingTokens = questionTokens + chatHistoryTokens;

  //     // FIXME - we don't know how many tokens the response will be, which takes away from prisma transaction atomicity, and these are also long queries which will hurt database performance
  //     // 1. Check if user has enough credits for the question.
  //     const fromCredits = await hasEnoughCredits(userId, embeddingTokens / 5);

  //     // 2. Metadata filtering and VectorDBQAChain.
  //     const filter = {
  //       metadataId: { $in: metadataIds },
  //     };

  //     const embeddings = new OpenAIEmbeddings({ modelName: 'text-embedding-ada-002' });
  //     const tokenizer = new BertTokenizer(undefined, true, 512);
  //     const index = pinecone.Index(PINECONE_INDEX_NAME);

  //     const retriever = new PineconeHybridSearchRetriever(embeddings, {
  //       pineconeIndex: index,
  //       topK: 4,
  //       alpha: 1.0,
  //       tokenizer,
  //       namespace: userId,
  //       filter: filter,
  //     });

  //     const qaTemplate = `Given the context provided below, answer the question. If the exact information requested is unavailable, provide any relevant information related to the topic from the context. Provide a helpful and concise answer. ${
  //       systemMessage ? systemMessage.replace(/\{/g, '(').replace(/\}/g, ')') : ''
  //     }
  //     Context: {context}
  //     Question: {question}
  //     Helpful Answer:`;
  //     const model = openai;
  //     // create the chain
  //     // FIXME - this is a bug in langchain
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-ignore
  //     const chain = ConversationalRetrievalQAChain.fromLLM(model, retriever, {
  //       qaTemplate,
  //       returnSourceDocuments: true,
  //     });

  //     // Ask a question
  //     const response = await chain.call({
  //       question: sanitizedQuestion,
  //       chat_history: chatHistory,
  //     });
  //     // 3. Update user credits and usage.
  //     // subtract credits from user
  //     // TODO - might not be tracking the adaQuestionTokens correctly
  //     await prisma.user.update({
  //       where: {
  //         id: userId,
  //       },
  //       data: {
  //         credits: {
  //           decrement: fromCredits ? (tokenUsage.totalTokens + embeddingTokens / 5) / 1000 : 0,
  //         },
  //         additionalCredits: {
  //           decrement: !fromCredits ? (tokenUsage.totalTokens + embeddingTokens / 5) / 1000 : 0,
  //         },
  //         embeddingUsage: {
  //           increment: embeddingTokens,
  //         },
  //         llmUsage: {
  //           increment: tokenUsage.totalTokens,
  //         },
  //       },
  //     });

  //     return {
  //       response,
  //     };
  //   }),
});
