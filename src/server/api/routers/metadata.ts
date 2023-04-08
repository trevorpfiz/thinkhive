import { z } from 'zod';

import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { pinecone } from '@/utils/pinecone';

export const metadataRouter = createTRPCRouter({
  getMetadata: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.fileMetadata.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  deleteMetadata: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { ids } = input;

      // metadata filtering
      const filter = {
        metadataId: { $in: ids },
      };

      const index = pinecone.Index(PINECONE_INDEX_NAME);
      const deletedFilesPinecone = await index._delete({
        deleteRequest: {
          filter: filter,
          namespace: ctx.session.user.id,
        },
      });

      // Delete all files that match the user id and the selected file metadataIds
      const deletedFiles = await ctx.prisma.fileMetadata.deleteMany({
        where: {
          userId: ctx.session.user.id,
          metadataId: {
            in: ids,
          },
        },
      });

      // Return the number of deleted files
      return {
        deletedFiles,
      };
    }),
});
