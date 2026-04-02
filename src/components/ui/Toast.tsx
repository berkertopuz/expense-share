"use client";

import { useEffect } from "react";
import { useNotification } from "@/context/NotificationContext";

const icons = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
};

const styles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
};

const iconStyles = {
  success: "bg-green-200 text-green-700",
  error: "bg-red-200 text-red-700",
  info: "bg-blue-200 text-blue-700",
  warning: "bg-yellow-200 text-yellow-700",
};

interface ToastItemProps {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
  onRemove: (id: string) => void;
}

function ToastItem({ id, type, message, duration = 5000, onRemove }: ToastItemProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg ${styles[type]} animate-slide-in`}
      role="alert"
      aria-live="polite"
    >
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${iconStyles[type]}`}
        aria-hidden="true"
      >
        {icons[type]}
      </span>
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="p-1 hover:opacity-70 transition-opacity"
        aria-label="Kapat"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm"
      aria-label="Bildirimler"
    >
      {notifications.map((notification) => (
        <ToastItem key={notification.id} {...notification} onRemove={removeNotification} />
      ))}
    </div>
  );
}
