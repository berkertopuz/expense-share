"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(groupId: string | null) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!groupId) return;

    socketRef.current = io({
      path: "/api/socket",
    });

    socketRef.current.emit("join-group", groupId);

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-group", groupId);
        socketRef.current.disconnect();
      }
    };
  }, [groupId]);

  const sendMessage = useCallback(
    (message: any) => {
      if (socketRef.current && groupId) {
        socketRef.current.emit("send-message", { groupId, message });
      }
    },
    [groupId]
  );

  const onNewMessage = useCallback((callback: (message: any) => void) => {
    socketRef.current?.on("new-message", callback);
    return () => {
      socketRef.current?.off("new-message", callback);
    };
  }, []);

  const sendTyping = useCallback(
    (userName: string) => {
      if (socketRef.current && groupId) {
        socketRef.current.emit("typing", { groupId, userName });
      }
    },
    [groupId]
  );

  const stopTyping = useCallback(() => {
    if (socketRef.current && groupId) {
      socketRef.current.emit("stop-typing", { groupId });
    }
  }, [groupId]);

  const onTyping = useCallback((callback: (userName: string) => void) => {
    socketRef.current?.on("user-typing", callback);
    return () => {
      socketRef.current?.off("user-typing", callback);
    };
  }, []);

  return {
    sendMessage,
    onNewMessage,
    sendTyping,
    stopTyping,
    onTyping,
  };
}
