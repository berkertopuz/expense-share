"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useNotification } from "@/context/NotificationContext";

interface Props {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberModal({ groupId, isOpen, onClose }: Props) {
  const t = useTranslations();
  const utils = trpc.useUtils();
  const { success } = useNotification();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const addMember = trpc.group.addMember.useMutation({
    onSuccess: () => {
      utils.group.byId.invalidate(groupId);
      onClose();
      setEmail("");
      setError("");
      success(t("members.success.added"));
    },
    onError: (err) => {
      if (err.message === "USER_NOT_FOUND") {
        setError(t("members.errors.notFound"));
      } else if (err.message === "ALREADY_MEMBER") {
        setError(t("members.errors.alreadyMember"));
      } else {
        setError(t("common.error"));
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) return;

    addMember.mutate({ groupId, email });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div
        className="relative bg-white rounded-xl w-full max-w-md mx-4 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="p-8">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900 mb-8">
            {t("members.addMember")}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <Input
                label={t("auth.email")}
                type="email"
                placeholder={t("members.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                required
              />
            </div>

            <div className="flex gap-4 justify-end mt-10 pt-6 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" isLoading={addMember.isPending}>
                {t("common.create")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
