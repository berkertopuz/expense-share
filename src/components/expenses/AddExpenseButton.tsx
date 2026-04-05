"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openWizard } from "@/store/slices/expenseSlice";
import { selectGroupId } from "@/store/selectors/expense.selectors";
import { ExpenseWizard } from "@/components/expenses/ExpenseWizard";
import { Plus, Users } from "lucide-react";

export function AddExpenseButton() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  const { data: groups } = trpc.group.list.useQuery();

  const selectedGroupId = useAppSelector(selectGroupId);
  const selectedGroup = groups?.find((g) => g.id === selectedGroupId);
  const members =
    selectedGroup?.members.map((m) => ({
      id: m.user.id,
      name: m.user.name ?? "",
    })) ?? [];

  const handleSelect = (groupId: string) => {
    document.getElementById("group-dropdown")?.hidePopover();
    dispatch(openWizard({ groupId }));
  };

  const handleClick = () => {
    if (!groups?.length) return;
    if (groups.length === 1) {
      dispatch(openWizard({ groupId: groups[0].id }));
    }
  };

  const handleToggle = (e: React.ToggleEvent<HTMLDivElement>) => {
    if (e.newState === "open" && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        {...(groups && groups.length > 1
          ? { popoverTarget: "group-dropdown" }
          : { onClick: handleClick })}
        disabled={!groups?.length}
        className="flex items-center gap-1 px-3 py-2 sm:px-4 sm:gap-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 active:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus size={18} />
        <span className="sm:inline">{t("expenses.newExpense")}</span>
      </button>

      <div
        id="group-dropdown"
        popover="auto"
        onToggle={handleToggle}
        style={{
          inset: "unset",
          position: "fixed",
          top: pos.top,
          right: pos.right,
        }}
        className="m-0 p-0 border-none bg-transparent"
      >
        <div className="w-56 bg-white rounded-lg border border-gray-200 shadow-lg py-1">
          {groups?.map((group) => (
            <button
              key={group.id}
              onClick={() => handleSelect(group.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <Users size={14} className="text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-700 truncate">{group.name}</p>
                <p className="text-xs text-gray-400">
                  {t("groups.members", { count: group.members.length })}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <ExpenseWizard members={members} />
    </>
  );
}
