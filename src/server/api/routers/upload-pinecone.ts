import { z } from 'zod';
import { ulid } from 'ulid';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { pinecone } from '@/utils/pinecone';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { PineconeStore } from 'langchain/vectorstores';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { get_encoding } from '@dqbd/tiktoken';

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
      const metadataId = ulid();
      const uploadDate = new Date().toISOString();

      const cleanedText = text.trim().replaceAll('\n', ' ');

      // TODO - token count - can use TokenTextSplitter from langchain
      const encoding = get_encoding('cl100k_base');
      const tokenCount = encoding.encode(cleanedText).length;

      /* Split text into chunks */
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const texts = await textSplitter.splitText(cleanedText);
      const metadataIds = texts.map(() => ({ metadataId }));
      // const metadataIds = texts.map(() => ({ metadataId, userId }));

      /*create and store the embeddings in the vectorStore*/
      const embeddings = new OpenAIEmbeddings();

      const index = pinecone.Index(PINECONE_INDEX_NAME);
      const vectorStore = await PineconeStore.fromTexts(texts, metadataIds, embeddings, {
        pineconeClient: index,
        textKey: 'text',
        namespace: PINECONE_NAME_SPACE,
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

      return {
        metadata,
      };
    }),
});
