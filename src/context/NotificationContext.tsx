"use client";

import { createContext, useContext, useReducer, useCallback, useEffect } from "react";

// Types
type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
}

type NotificationAction =
  | { type: "ADD"; payload: Notification }
  | { type: "REMOVE"; payload: string }
  | { type: "CLEAR_ALL" };

// Reducer
function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case "ADD":
      const updated = [...state.notifications, action.payload];
      return {
        notifications: updated.slice(-3),
      };
    case "REMOVE":
      return {
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };
    case "CLEAR_ALL":
      return {
        notifications: [],
      };
    default:
      return state;
  }
}

// Context
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, { notifications: [] });

  const addNotification = useCallback(
    (type: NotificationType, message: string, duration = 5000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      dispatch({ type: "ADD", payload: { id, type, message, duration } });
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: "REMOVE", payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  const success = useCallback(
    (message: string) => addNotification("success", message),
    [addNotification]
  );
  const error = useCallback(
    (message: string) => addNotification("error", message),
    [addNotification]
  );
  const info = useCallback(
    (message: string) => addNotification("info", message),
    [addNotification]
  );
  const warning = useCallback(
    (message: string) => addNotification("warning", message),
    [addNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        addNotification,
        removeNotification,
        clearAll,
        success,
        error,
        info,
        warning,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
