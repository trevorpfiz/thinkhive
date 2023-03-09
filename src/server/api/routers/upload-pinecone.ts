import { z } from 'zod';
import { ulid } from 'ulid';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/api/trpc';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { PineconeStore } from 'langchain/vectorstores';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export const uploadPinecone = createTRPCRouter({
  uploadText: protectedProcedure
    .input(z.object({ text: z.string(), wordCount: z.number(), metadata: z.any() }))
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { text, wordCount, metadata } = input;
      const metadataId = ulid();
      const uploadDate = new Date().toISOString();

      const finalMetadata = [
        {
          ...metadata,
          metadataId,
          uploadDate,
          wordCount,
          userId: ctx.session.user.id,
        },
      ];
      const cleanedText = text.trim().replaceAll('\n', ' ');
      console.log(cleanedText);

      /* Split text into chunks */
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const texts = await textSplitter.splitText(cleanedText);
      console.log('split text', texts);

      console.log('creating vector store...');
      /*create and store the embeddings in the vectorStore*/
      const embeddings = new OpenAIEmbeddings();
      const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name
      const vectorStore = await PineconeStore.fromTexts(
        index,
        texts,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        finalMetadata,
        embeddings,
        'text',
        PINECONE_NAME_SPACE
      );

      console.log('vectorStore', vectorStore);

      await ctx.prisma.fileMetadata.create({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: finalMetadata[0],
      });

      return {
        vectorStore,
      };
    }),
});
