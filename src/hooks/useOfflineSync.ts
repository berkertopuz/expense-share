"use client";

import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useOnlineStatus } from "./useOnlineStatus";
import { getPendingExpenses, removePendingExpense, getPendingCount } from "@/lib/offlineDb";
import { useNotification } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function useOfflineSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const isOnline = useOnlineStatus();
  const { success, error } = useNotification();
  const utils = trpc.useUtils();
  const router = useRouter();
  const t = useTranslations();

  const createExpense = trpc.expense.create.useMutation();

  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  const syncPendingExpenses = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    const pending = await getPendingExpenses();
    if (pending.length === 0) return;

    setIsSyncing(true);

    let syncedCount = 0;

    for (const expense of pending) {
      try {
        await createExpense.mutateAsync({
          groupId: expense.groupId,
          description: expense.description,
          amount: expense.amount,
          payments: expense.payments,
          splits: expense.splits,
        });

        await removePendingExpense(expense.id);
        syncedCount++;

        utils.expense.listByGroup.invalidate(expense.groupId);
        utils.group.getBalances.invalidate(expense.groupId);
      } catch (err) {
        console.error("Sync failed for expense:", expense.id, err);
      }
    }

    setIsSyncing(false);
    await refreshPendingCount();

    if (syncedCount > 0) {
      router.refresh();
      success(t("offline.syncSuccess", { count: syncedCount }));
    }
  }, [isOnline, isSyncing, createExpense, utils, success, refreshPendingCount]);

  useEffect(() => {
    if (isOnline) {
      syncPendingExpenses();
    }
  }, [isOnline, syncPendingExpenses]);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  return {
    pendingCount,
    isSyncing,
    isOnline,
    syncPendingExpenses,
    refreshPendingCount,
  };
}
