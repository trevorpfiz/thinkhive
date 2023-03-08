import { createTRPCRouter } from '@/server/api/trpc';
import { exampleRouter } from '@/server/api/routers/example';
import { openAiPinecone } from '@/server/api/routers/openai-pinecone';
import { uploadPinecone } from '@/server/api/routers/upload-pinecone';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  chat: openAiPinecone,
  upload: uploadPinecone,
});

// export type definition of API
export type AppRouter = typeof appRouter;
