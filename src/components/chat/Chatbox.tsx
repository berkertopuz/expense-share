"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/Button";
import { Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  userId: string;
  groupId: string;
  createdAt: Date;
  user: { id: string; name: string; image: string | null };
}

interface Props {
  groupId: string;
}

export function ChatBox({ groupId }: Props) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const { data: messages } = trpc.message.listByGroup.useQuery(groupId);

  const createMessage = trpc.message.create.useMutation({
    // Optimistic update
    onMutate: async (newMessage) => {
      await utils.message.listByGroup.cancel(groupId);

      const previousMessages = utils.message.listByGroup.getData(groupId);

      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage.content,
        userId: session?.user?.id || "",
        groupId,
        createdAt: new Date(),
        user: {
          id: session?.user?.id || "",
          name: session?.user?.name || "",
          image: session?.user?.image || null,
        },
      };

      utils.message.listByGroup.setData(groupId, (old) => {
        return old ? [...old, optimisticMessage] : [optimisticMessage];
      });

      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      if (context?.previousMessages) {
        utils.message.listByGroup.setData(groupId, context.previousMessages);
      }
    },
    onSettled: () => {
      utils.message.listByGroup.invalidate(groupId);
    },
  });

  const { sendMessage, onNewMessage, sendTyping, stopTyping, onTyping } = useSocket(groupId);

  useEffect(() => {
    const cleanup = onNewMessage((newMsg: Message) => {
      if (newMsg.userId !== session?.user?.id) {
        utils.message.listByGroup.setData(groupId, (old) => {
          if (!old) return [newMsg];
          if (old.some((m) => m.id === newMsg.id)) return old;
          return [...old, newMsg];
        });
      }
    });
    return cleanup;
  }, [onNewMessage, groupId, session?.user?.id, utils]);

  useEffect(() => {
    const cleanup = onTyping((userName) => {
      setTypingUser(userName);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser(null);
      }, 2000);
    });
    return cleanup;
  }, [onTyping]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const content = message.trim();
    setMessage("");
    stopTyping();

    const newMsg = await createMessage.mutateAsync({
      groupId,
      content,
    });

    sendMessage(newMsg);
  };

  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }

    if (session?.user?.name && e.target.value) {
      sendTyping(session.user.name);
      typingDebounceRef.current = setTimeout(() => {
        stopTyping();
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-64 sm:h-80 lg:h-96 bg-white rounded-xl border border-gray-200">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3"
      >
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.userId === session?.user?.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] sm:max-w-xs px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                msg.userId === session?.user?.id
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {msg.userId !== session?.user?.id && (
                <p className="text-xs font-semibold mb-1">{msg.user.name}</p>
              )}
              <p className="wrap-break-word">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {typingUser && (
        <div className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-500">
          {typingUser} {t("chat.typing")}...
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-2 sm:p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder={t("chat.placeholder")}
            className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none border border-gray-300"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!message.trim() || createMessage.isPending}
            className="shrink-0"
          >
            <span className="hidden sm:inline">{t("chat.send")}</span>
            <Send className="w-4 h-4 sm:hidden" />
          </Button>
        </div>
      </form>
    </div>
  );
}
