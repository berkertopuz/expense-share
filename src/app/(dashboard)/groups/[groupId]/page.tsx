"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { Button, ConfirmModal } from "@/components/ui";
import { AddMemberModal } from "@/components/members/AddMemberModal";
import { MemberBadge } from "@/components/members/MemberBadge";
import { ExpenseDetailModal } from "@/components/expenses/ExpenseDetailModal";
import { useNotification } from "@/context/NotificationContext";
import { ExpenseWizard } from "@/components/expenses/ExpenseWizard";
import { useAppDispatch } from "@/store/hooks";
import { openWizard } from "@/store/slices/expenseSlice";
import { ChatBox } from "@/components/chat/Chatbox";
import { formatTRY } from "@/utils/currency";
import { Trash2 } from "lucide-react";

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const { data: session } = useSession();
  const t = useTranslations();
  const utils = trpc.useUtils();
  const { success, error } = useNotification();

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<{
    id: string;
    description: string;
  } | null>(null);
  const [expenseDetail, setExpenseDetail] = useState<NonNullable<typeof expenses>[number] | null>(
    null
  );

  const { data: group, isLoading: groupLoading } = trpc.group.byId.useQuery(groupId);
  const { data: expenses, isLoading: expensesLoading } = trpc.expense.listByGroup.useQuery(groupId);
  const { data: balanceData, isLoading: balancesLoading } =
    trpc.group.getBalances.useQuery(groupId);

  const dispatch = useAppDispatch();

  const removeMember = trpc.group.removeMember.useMutation({
    onSuccess: () => {
      utils.group.byId.invalidate(groupId);
      utils.group.getBalances.invalidate(groupId);
      setMemberToRemove(null);
      success(t("members.success.removed"));
    },
    onError: () => {
      error(t("common.error"));
    },
  });

  const deleteExpense = trpc.expense.delete.useMutation({
    onSuccess: () => {
      utils.expense.listByGroup.invalidate(groupId);
      utils.group.getBalances.invalidate(groupId);
      setExpenseToDelete(null);
      success(t("expenses.success.deleted"));
    },
    onError: () => {
      error(t("common.error"));
    },
  });

  // Skeleton
  if (groupLoading || expensesLoading || balancesLoading) {
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="h-10 bg-gray-200 rounded flex-1 sm:w-28 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded flex-1 sm:w-32 animate-pulse"></div>
          </div>
        </div>

        <section className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
          <div className="flex gap-2 flex-wrap">
            <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 h-64 animate-pulse"></div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 h-64 animate-pulse"></div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 h-80 animate-pulse"></div>
      </div>
    );
  }

  if (!group) {
    return <p className="text-gray-700">{t("groups.errors.notFound")}</p>;
  }

  const members =
    group.members?.map((m) => ({
      id: m.user.id,
      name: m.user.name,
    })) ?? [];

  const formatPayers = (payments: { user: { name: string }; amount: number }[]) => {
    if (payments.length === 1) {
      return payments[0].user.name;
    }
    return payments.map((p) => p.user.name).join(", ");
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{group.name}</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 sm:flex-none text-sm"
            onClick={() => setIsMemberModalOpen(true)}
          >
            {t("members.addMember")}
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1 sm:flex-none text-sm"
            onClick={() => dispatch(openWizard({ groupId }))}
          >
            {t("expenses.newExpense")}
          </Button>
        </div>
      </div>

      {/* Members */}
      <section className="mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
          {t("members.title")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <MemberBadge
              key={member.id}
              member={member}
              isCurrentUser={member.id === session?.user?.id}
              onRemoveClick={() => setMemberToRemove(member)}
            />
          ))}
        </div>
      </section>

      {/* Balance + Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Balance */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            {t("balance.title")}
          </h2>

          {!balanceData?.theyOweMe?.length && !balanceData?.iOwe?.length ? (
            <p className="text-gray-600 text-sm sm:text-base">{t("balance.settled")}</p>
          ) : (
            <>
              {balanceData.theyOweMe && balanceData.theyOweMe.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-xs sm:text-sm font-semibold text-green-700 mb-2 sm:mb-3">
                    {t("balance.owesYou")}
                  </h3>
                  <ul className="space-y-2">
                    {balanceData.theyOweMe.map((d, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg text-sm sm:text-base"
                      >
                        <span className="text-gray-800 font-medium">{d.userName}</span>
                        <span className="text-green-700 font-semibold">{formatTRY(d.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {balanceData.iOwe && balanceData.iOwe.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-xs sm:text-sm font-semibold text-red-700 mb-2 sm:mb-3">
                    {t("balance.youOwe")}
                  </h3>
                  <ul className="space-y-2">
                    {balanceData.iOwe.map((d, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center py-2 px-3 bg-red-50 rounded-lg text-sm sm:text-base"
                      >
                        <span className="text-gray-800 font-medium">{d.userName}</span>
                        <span className="text-red-700 font-semibold">-{formatTRY(d.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    {t("balance.netBalance")}
                  </span>
                  <span
                    className={`text-lg sm:text-xl font-bold ${
                      balanceData.myBalance >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {balanceData.myBalance >= 0 ? "+" : ""}
                    {formatTRY(balanceData.myBalance)}
                  </span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Harcamalar */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 max-h-80 sm:max-h-96 flex flex-col">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            {t("expenses.title")}
          </h2>

          {expenses?.length === 0 ? (
            <p className="text-gray-600 text-sm sm:text-base">{t("expenses.empty.title")}</p>
          ) : (
            <ul className="space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              {expenses?.map((expense) => (
                <li
                  key={expense.id}
                  className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setExpenseDetail(expense)}
                >
                  <div className="flex justify-between items-start gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {expense.description}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                        {t("expenses.paidBy", { name: formatPayers(expense.payments) })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="font-semibold text-gray-900 text-sm sm:text-base whitespace-nowrap">
                        {formatTRY(expense.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpenseToDelete({ id: expense.id, description: expense.description });
                        }}
                        className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label={t("common.delete")}
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Chat */}
      <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{t("chat.title")}</h2>
        <ChatBox groupId={groupId} />
      </section>

      {/* Modals */}
      <ExpenseWizard members={members} />

      <AddMemberModal
        groupId={groupId}
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
      />

      <ConfirmModal
        isOpen={!!memberToRemove}
        title={t("members.removeMember")}
        message={memberToRemove ? `${memberToRemove.name} ${t("members.confirmRemove")}` : ""}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="danger"
        isLoading={removeMember.isPending}
        onConfirm={() =>
          memberToRemove && removeMember.mutate({ groupId, userId: memberToRemove.id })
        }
        onCancel={() => setMemberToRemove(null)}
      />

      <ConfirmModal
        isOpen={!!expenseToDelete}
        title={t("expenses.deleteTitle")}
        message={
          expenseToDelete ? `"${expenseToDelete.description}" ${t("expenses.confirmDelete")}` : ""
        }
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="danger"
        isLoading={deleteExpense.isPending}
        onConfirm={() => expenseToDelete && deleteExpense.mutate(expenseToDelete.id)}
        onCancel={() => setExpenseToDelete(null)}
      />

      <ExpenseDetailModal
        expense={expenseDetail}
        isOpen={!!expenseDetail}
        onClose={() => setExpenseDetail(null)}
      />
    </div>
  );
}
