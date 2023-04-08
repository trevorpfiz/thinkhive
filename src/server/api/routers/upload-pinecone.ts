import { get_encoding } from '@dqbd/tiktoken';
import { TRPCError } from '@trpc/server';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PineconeStore } from 'langchain/vectorstores';
import { ulid } from 'ulid';
import { z } from 'zod';

import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { hasEnoughCredits } from '@/server/helpers/permissions';
import { uploadLimit, uploadLimitDay } from '@/server/helpers/ratelimit';
import { pinecone } from '@/utils/pinecone';

const MetadataInput = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  contentType: z.string(),
  createdDate: z.string().optional(),
  modifiedDate: z.string().optional(),
  userId: z.string().optional(),
  uploadTokens: z.number().optional(),
});

export const uploadPinecone = createTRPCRouter({
  uploadText: protectedProcedure
    .input(z.object({ text: z.string(), wordCount: z.number(), metadata: MetadataInput }))
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const { text, wordCount, metadata } = input;
      const userId = session.user.id;

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
      const uploadTokens = encoding.encode(cleanedText).length;

      // Prepare the text
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 300
      });

      const texts = await textSplitter.splitText(cleanedText);
      const metadataIds = texts.map(() => ({ metadataId }));
      const embeddings = new OpenAIEmbeddings();

      // 1. check if user has enough credits for file embeddings
      const fromCredits = await hasEnoughCredits(userId, uploadTokens / 5);

      // 2. upload to Pinecone
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

      await prisma.fileMetadata.create({
        data: {
          ...metadata,
          metadataId,
          uploadDate,
          wordCount,
          tokenCount: uploadTokens,
          userId,
        },
      });

      // 3. decrement credits from user and add to uploadUsage
      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          credits: {
            decrement: fromCredits ? uploadTokens / 5 / 1000 : 0,
          },
          additionalCredits: {
            decrement: !fromCredits ? uploadTokens / 5 / 1000 : 0,
          },
          uploadUsage: {
            increment: uploadTokens,
          },
        },
      });

      return user;
    }),
});
