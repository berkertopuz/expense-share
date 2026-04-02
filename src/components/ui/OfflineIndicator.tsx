"use client";

import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useTranslations } from "next-intl";

export function OfflineIndicator() {
  const t = useTranslations();
  const { isOnline, pendingCount, isSyncing } = useOfflineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 p-4 rounded-lg shadow-lg z-40 ${
        isOnline ? "bg-yellow-50 border border-yellow-200" : "bg-red-50 border border-red-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${
            isOnline ? "bg-yellow-500" : "bg-red-500"
          } ${isSyncing ? "animate-pulse" : ""}`}
        />
        <div className="flex-1">
          {!isOnline ? (
            <>
              <p className="font-medium text-red-800">{t("offline.title")}</p>
              <p className="text-sm text-red-600">{t("offline.description")}</p>
            </>
          ) : pendingCount > 0 ? (
            <>
              <p className="font-medium text-yellow-800">
                {isSyncing ? t("offline.syncing") : t("offline.pending")}
              </p>
              <p className="text-sm text-yellow-600">
                {pendingCount} {t("offline.expensesWaiting")}
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
