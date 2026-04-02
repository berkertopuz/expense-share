import { forwardRef, type InputHTMLAttributes, useId } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  hideLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, hideLabel = false, id, ...props }, ref) => {
    const t = useTranslations();
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className={cn("block text-sm font-medium text-gray-700 mb-1", hideLabel && "sr-only")}
        >
          {label}
          {props.required && (
            <span className="text-red-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
          {props.required && <span className="sr-only">{t("a11y.required")}</span>}
        </label>

        {hint && (
          <p id={hintId} className="text-sm text-gray-500 mb-1">
            {hint}
          </p>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            "w-full px-4 py-2 border rounded-lg transition-colors",
            "bg-white text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
            props.disabled && "bg-gray-100 text-gray-500 cursor-not-allowed",
            className
          )}
          {...props}
        />

        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
