import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { calculateDebts, getUserDebts, getNetBalance } from "@/utils/balance";
import { TRPCError } from "@trpc/server";

export const groupRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return prisma.group.findMany({
      where: {
        members: {
          some: { userId: ctx.user.id },
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  byId: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    return prisma.group.findFirst({
      where: {
        id: input,
        members: {
          some: { userId: ctx.user.id },
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      return prisma.group.create({
        data: {
          name: input.name,
          members: {
            create: {
              userId: ctx.user.id,
              role: "admin",
            },
          },
        },
        include: {
          members: {
            include: { user: true },
          },
        },
      });
    }),

  getBalances: protectedProcedure.input(z.string()).query(async ({ ctx, input: groupId }) => {
    const expenses = await ctx.prisma.expense.findMany({
      where: { groupId },
      include: {
        payments: true,
        splits: true,
      },
    });

    const debts = calculateDebts(expenses);
    const { theyOweMe, iOwe } = getUserDebts(debts, ctx.user.id);
    const myBalance = getNetBalance(debts, ctx.user.id);

    const userIds = [...theyOweMe.map((d) => d.userId), ...iOwe.map((d) => d.userId)];

    const users = await ctx.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

    return {
      myBalance,
      theyOweMe: theyOweMe.map((d) => ({
        userId: d.userId,
        userName: userMap[d.userId] ?? "Bilinmeyen",
        amount: d.amount,
      })),
      iOwe: iOwe.map((d) => ({
        userId: d.userId,
        userName: userMap[d.userId] ?? "Bilinmeyen",
        amount: d.amount,
      })),
    };
  }),

  addMember: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "USER_NOT_FOUND",
        });
      }

      const existingMember = await ctx.prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId: input.groupId,
          },
        },
      });

      if (existingMember) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "ALREADY_MEMBER",
        });
      }

      return ctx.prisma.groupMember.create({
        data: {
          groupId: input.groupId,
          userId: user.id,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "CANNOT_REMOVE_SELF",
        });
      }

      return ctx.prisma.groupMember.delete({
        where: {
          userId_groupId: {
            userId: input.userId,
            groupId: input.groupId,
          },
        },
      });
    }),
});
