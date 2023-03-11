import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const brainRouter = createTRPCRouter({
  getBrains: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.brain.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  createBrain: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        size: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, size } = input;

      const createdBrain = await ctx.prisma.brain.create({
        data: {
          name,
          size,
          userId: ctx.session.user.id,
        },
      });

      return createdBrain;
    }),
  deleteBrain: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      console.log(id);

      await ctx.prisma.brain.deleteMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });
    }),
});
