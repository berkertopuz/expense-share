"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { useNotification } from "@/context/NotificationContext";
import {
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  arrayBufferToBase64,
} from "@/lib/pushNotification";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const t = useTranslations();
  const { success, error } = useNotification();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const subscribe = trpc.notification.subscribe.useMutation();
  const unsubscribe = trpc.notification.unsubscribe.useMutation();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);

    try {
      if (isSubscribed) {
        const sub = await navigator.serviceWorker.ready.then((reg) =>
          reg.pushManager.getSubscription()
        );
        if (sub) {
          await unsubscribe.mutateAsync({ endpoint: sub.endpoint });
          await unsubscribeFromPush();
        }
        setIsSubscribed(false);
        success(t("settings.notifications.disabled"));
      } else {
        const granted = await requestNotificationPermission();
        if (!granted) {
          error(t("settings.notifications.permissionDenied"));
          setIsLoading(false);
          return;
        }

        const subscription = await subscribeToPush();
        if (subscription) {
          await subscribe.mutateAsync({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
              auth: arrayBufferToBase64(subscription.getKey("auth")),
            },
          });
          setIsSubscribed(true);
          success(t("settings.notifications.enabled"));
        }
      }
    } catch (err) {
      error(t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">
        {t("settings.title")}
      </h1>

      <section className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
          {t("settings.notifications.title")}
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm md:text-base text-gray-700">
              {t("settings.notifications.description")}
            </p>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              {isSubscribed
                ? t("settings.notifications.statusOn")
                : t("settings.notifications.statusOff")}
            </p>
          </div>

          <Button
            variant={isSubscribed ? "secondary" : "primary"}
            size="sm"
            className="w-full sm:w-auto shrink-0"
            onClick={handleToggle}
            isLoading={isLoading}
          >
            {isSubscribed
              ? t("settings.notifications.disable")
              : t("settings.notifications.enable")}
          </Button>
        </div>
      </section>
    </div>
  );
}
