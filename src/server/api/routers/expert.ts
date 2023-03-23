import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';

export const expertRouter = createTRPCRouter({
  // queries
  getExperts: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.expert.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        brains: { include: { files: true } },
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
          brains: { include: { files: true } },
        },
      });
    }),
  getAttachedBrains: protectedProcedure
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
  getDetachedBrains: protectedProcedure
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
        include: {
          files: true,
        },
      });
    }),
  getWidgetExpert: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const expert = await ctx.prisma.expert.findFirst({
        where: {
          id,
        },
        include: {
          brains: { include: { files: true } },
        },
      });

      if (!expert) {
        throw new Error('Expert not found');
      }

      return expert;
    }),

  // mutations ----------------------------------------
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
  renameExpert: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name } = input;

      const updatedExpert = await ctx.prisma.expert.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });

      return updatedExpert;
    }),
  toggleStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const expert = await ctx.prisma.expert.findFirst({
        where: {
          id,
        },
      });

      if (!expert) {
        throw new Error('Expert not found');
      }

      const updatedExpert = await ctx.prisma.expert.update({
        where: {
          id,
        },
        data: {
          status: expert.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        },
      });

      return updatedExpert;
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
  attachBrain: protectedProcedure
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
  detachBrain: protectedProcedure
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
