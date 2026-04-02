import { router } from "../trpc";
import { groupRouter } from "./group";
import { expenseRouter } from "./expense";
import { messageRouter } from "./message";
import { notificationRouter } from "./notification";

export const appRouter = router({
  group: groupRouter,
  expense: expenseRouter,
  message: messageRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
