"use client";

import { useEffect } from "react";
import { Button } from "./Button";

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onCancel]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="relative bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <h3 id="modal-title" className="text-lg font-semibold text-gray-900 mb-4">
            {title}
          </h3>
          <p className="text-gray-600 mb-8">{message}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={onCancel}>
              {cancelText}
            </Button>
            <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
