import { openAiPinecone } from '~/server/api/routers/openai-pinecone';
import { uploadPinecone } from '~/server/api/routers/upload-pinecone';
import { createTRPCRouter } from '~/server/api/trpc';

import { apiCallRouter } from './routers/api-call';
import { brainRouter } from './routers/brain';
import { expertRouter } from './routers/expert';
import { metadataRouter } from './routers/metadata';
import { stripeRouter } from './routers/stripe';
import { userRouter } from './routers/user';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  stripe: stripeRouter,
  chat: openAiPinecone,
  upload: uploadPinecone,
  metadata: metadataRouter,
  expert: expertRouter,
  brain: brainRouter,
  apiCall: apiCallRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
