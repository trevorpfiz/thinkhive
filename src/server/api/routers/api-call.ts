import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const apiCallRouter = createTRPCRouter({
  getApiCalls: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.fileMetadata.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  deleteApiCall: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { ids } = input;

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
