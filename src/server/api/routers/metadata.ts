import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

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
      console.log(ids);
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
