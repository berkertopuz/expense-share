"use client";

import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  closeWizard,
  nextStep,
  prevStep,
  goToStep,
  resetWizard,
} from "@/store/slices/expenseSlice";
import {
  selectIsWizardOpen,
  selectCurrentStep,
  selectGroupId,
  selectIsStep1Valid,
  selectIsStep2Valid,
  selectIsStep3Valid,
  selectExpenseData,
} from "@/store/selectors/expense.selectors";
import { trpc } from "@/lib/trpc";
import { useNotification } from "@/context/NotificationContext";
import { Button } from "@/components/ui/Button";
import { StepIndicator } from "./StepIndicator";
import { Step1ExpenseDetails } from "./Step1ExpenseDetails";
import { Step2Payers } from "./Step2Payers";
import { Step3Splits } from "./Step3Splits";
import { Step4Summary } from "./Step4Summary";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { addPendingExpense } from "@/lib/offlineDb";
import { useRouter } from "next/navigation";

interface Props {
  members: { id: string; name: string }[];
}

export function ExpenseWizard({ members }: Props) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { success, error } = useNotification();
  const utils = trpc.useUtils();
  const router = useRouter();

  const isOpen = useAppSelector(selectIsWizardOpen);
  const currentStep = useAppSelector(selectCurrentStep);
  const groupId = useAppSelector(selectGroupId);
  const isStep1Valid = useAppSelector(selectIsStep1Valid);
  const isStep2Valid = useAppSelector(selectIsStep2Valid);
  const isStep3Valid = useAppSelector(selectIsStep3Valid);
  const expenseData = useAppSelector(selectExpenseData);
  const isOnline = useOnlineStatus();

  const createExpense = trpc.expense.create.useMutation({
    onSuccess: () => {
      if (groupId) {
        utils.expense.listByGroup.invalidate(groupId);
        utils.group.getBalances.invalidate(groupId);
      }
      success(t("expenses.success.created"));
      dispatch(resetWizard());
      router.refresh();
    },
    onError: () => {
      error(t("expenses.errors.createFailed"));
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(closeWizard());
    dispatch(resetWizard());
  };

  const handleNext = () => {
    dispatch(nextStep());
  };

  const handlePrev = () => {
    dispatch(prevStep());
  };

  const handleSubmit = async () => {
    if (!groupId) return;

    const data = {
      groupId,
      description: expenseData.description,
      amount: expenseData.amount,
      payments: expenseData.payments,
      splits: expenseData.splits,
    };

    if (isOnline) {
      createExpense.mutate(data);
    } else {
      await addPendingExpense(data);
      success(t("expenses.savedOffline"));
      dispatch(resetWizard());
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return isStep1Valid;
      case 2:
        return isStep2Valid;
      case 3:
        return isStep3Valid;
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />

      <div
        className="relative bg-white rounded-xl w-full max-w-lg mx-4 p-4 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t("expenses.newExpense")}</h2>

        <StepIndicator currentStep={currentStep} onStepClick={(step) => dispatch(goToStep(step))} />

        {currentStep === 1 && <Step1ExpenseDetails />}
        {currentStep === 2 && <Step2Payers members={members} />}
        {currentStep === 3 && <Step3Splits members={members} />}
        {currentStep === 4 && <Step4Summary />}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <div>
            {currentStep > 1 && (
              <Button variant="secondary" onClick={handlePrev}>
                {t("common.back")}
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            {currentStep < 4 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                {t("common.next")}
              </Button>
            ) : (
              <Button onClick={handleSubmit} isLoading={createExpense.isPending}>
                {t("common.confirm")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
