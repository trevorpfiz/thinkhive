import { z } from 'zod';
import { ulid } from 'ulid';
import { PineconeStore } from 'langchain/vectorstores';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { get_encoding } from '@dqbd/tiktoken';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { pinecone } from '@/utils/pinecone';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { uploadLimit, uploadLimitDay } from '@/server/helpers/ratelimit';
import { TRPCError } from '@trpc/server';

const MetadataInput = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  contentType: z.string(),
  createdDate: z.string().optional(),
  modifiedDate: z.string().optional(),
  userId: z.string().optional(),
  tokenCount: z.number().optional(),
});

export const uploadPinecone = createTRPCRouter({
  uploadText: protectedProcedure
    .input(z.object({ text: z.string(), wordCount: z.number(), metadata: MetadataInput }))
    .mutation(async ({ ctx, input }) => {
      const { text, wordCount, metadata } = input;
      const userId = ctx.session.user.id;

      // rate limit
      const { success } = await uploadLimit.limit(userId);
      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
      const { success: successDay } = await uploadLimitDay.limit(userId);
      if (!successDay) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });

      const metadataId = ulid();
      const uploadDate = new Date().toISOString();

      const cleanedText = text.trim().replaceAll('\n', ' ');

      // TODO - token count - can use TokenTextSplitter from langchain?
      const encoding = get_encoding('cl100k_base');
      const tokenCount = encoding.encode(cleanedText).length;
      const adaUploadTokens = tokenCount / 5;

      // check if user has enough credits and perform the transaction
      return await ctx.prisma.$transaction(async (tx) => {
        // 1. Decrement credits from user and add to uploadUsage.
        const user = await tx.user.update({
          where: {
            id: userId,
          },
          data: {
            credits: {
              decrement: adaUploadTokens / 1000,
            },
            uploadUsage: {
              increment: tokenCount,
            },
          },
        });

        // 2. Verify that the user's credits didn't go below zero.
        if (user.credits < 0) {
          throw new TRPCError({ message: `Not enough credits to upload file.`, code: 'FORBIDDEN' });
        }

        // 3. Prepare the text and upload to Pinecone.
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200,
        });

        const texts = await textSplitter.splitText(cleanedText);
        const metadataIds = texts.map(() => ({ metadataId }));
        const embeddings = new OpenAIEmbeddings({ modelName: 'text-embedding-ada-002' });

        try {
          const index = pinecone.Index(PINECONE_INDEX_NAME);
          const vectorStore = await PineconeStore.fromTexts(texts, metadataIds, embeddings, {
            pineconeClient: index,
            textKey: 'text',
            namespace: userId,
          });
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Pinecone error: ${error.message}`,
            });
          } else {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Unknown Pinecone error.',
            });
          }
        }

        await ctx.prisma.fileMetadata.create({
          data: {
            ...metadata,
            metadataId,
            uploadDate,
            wordCount,
            tokenCount,
            userId,
          },
        });

        return user;
      });
    }),
});
