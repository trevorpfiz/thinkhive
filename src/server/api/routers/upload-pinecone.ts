import { z } from 'zod';
import { ulid } from 'ulid';
import { PineconeStore } from 'langchain/vectorstores';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { get_encoding } from '@dqbd/tiktoken';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { pinecone } from '@/utils/pinecone';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { uploadLimit } from '@/server/helpers/ratelimit';
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

      const metadataId = ulid();
      const uploadDate = new Date().toISOString();

      const cleanedText = text.trim().replaceAll('\n', ' ');

      // TODO - token count - can use TokenTextSplitter from langchain?
      const encoding = get_encoding('cl100k_base');
      const tokenCount = encoding.encode(cleanedText).length;

      /* Split text into chunks */
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const texts = await textSplitter.splitText(cleanedText);
      const metadataIds = texts.map(() => ({ metadataId }));

      /*create and store the embeddings in the vectorStore*/
      const embeddings = new OpenAIEmbeddings();

      const index = pinecone.Index(PINECONE_INDEX_NAME);
      const vectorStore = await PineconeStore.fromTexts(texts, metadataIds, embeddings, {
        pineconeClient: index,
        textKey: 'text',
        namespace: userId,
      });

      console.log('vectorStore', vectorStore);

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

      // add to user's upload usage
      await ctx.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          uploadUsage: {
            increment: tokenCount,
          },
        },
      });

      return {
        metadata,
      };
    }),
});
