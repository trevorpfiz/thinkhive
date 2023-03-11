import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const expertRouter = createTRPCRouter({
  // queries
  getExperts: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.expert.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  getExpert: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { id } = input;

      return ctx.prisma.expert.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        include: {
          brains: true,
        },
      });
    }),
  getAssignedBrains: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { id } = input;

      return ctx.prisma.brain.findMany({
        where: {
          userId: ctx.session.user.id,
          experts: {
            some: {
              id,
            },
          },
        },
      });
    }),
  getUnassignedBrains: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { id } = input;

      return ctx.prisma.brain.findMany({
        where: {
          userId: ctx.session.user.id,
          NOT: {
            experts: {
              some: {
                id,
              },
            },
          },
        },
      });
    }),

  // mutations
  createExpert: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        size: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, size } = input;

      const createdExpert = await ctx.prisma.expert.create({
        data: {
          name,
          size,
          userId: ctx.session.user.id,
        },
      });

      return createdExpert;
    }),
  deleteExpert: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      console.log(id);

      await ctx.prisma.expert.deleteMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });
    }),
  assignBrain: protectedProcedure
    .input(
      z.object({
        expertId: z.string(),
        brainId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { expertId, brainId } = input;

      await ctx.prisma.brain.update({
        where: {
          id: brainId,
        },
        data: {
          experts: {
            connect: {
              id: expertId,
            },
          },
        },
      });
    }),
  unassignBrain: protectedProcedure
    .input(
      z.object({
        expertId: z.string(),
        brainId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { expertId, brainId } = input;

      await ctx.prisma.brain.update({
        where: {
          id: brainId,
        },
        data: {
          experts: {
            disconnect: {
              id: expertId,
            },
          },
        },
      });
    }),
});