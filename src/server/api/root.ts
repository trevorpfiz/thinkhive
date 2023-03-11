import { createTRPCRouter } from '@/server/api/trpc';
import { openAiPinecone } from '@/server/api/routers/openai-pinecone';
import { uploadPinecone } from '@/server/api/routers/upload-pinecone';
import { metadataRouter } from './routers/metadata';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  chat: openAiPinecone,
  upload: uploadPinecone,
  metadata: metadataRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
