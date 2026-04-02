"use client";

import { useTranslations } from "next-intl";

interface Props {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function StepIndicator({ currentStep, onStepClick }: Props) {
  const t = useTranslations("expenses.wizard");

  const steps = [
    { num: 1, label: t("step1") },
    { num: 2, label: t("step2") },
    { num: 3, label: t("step3") },
    { num: 4, label: t("step4") },
  ];

  return (
    <div className="flex items-center mb-6">
      {steps.map((step, index) => (
        <div key={step.num} className="flex items-center flex-1 last:flex-none">
          <button
            type="button"
            onClick={() => step.num < currentStep && onStepClick(step.num)}
            disabled={step.num > currentStep}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors shrink-0
              ${
                step.num === currentStep
                  ? "bg-green-600 text-white"
                  : step.num < currentStep
                    ? "bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {step.num}
          </button>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-1 ${step.num < currentStep ? "bg-green-200" : "bg-gray-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
