"use client";

import { useTranslations } from "next-intl";

interface Props {
  member: { id: string; name: string };
  isCurrentUser: boolean;
  onRemoveClick: () => void;
}

export function MemberBadge({ member, isCurrentUser, onRemoveClick }: Props) {
  const t = useTranslations();

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
      <span>{member.name}</span>
      {!isCurrentUser && (
        <button
          type="button"
          onClick={onRemoveClick}
          className="ml-0.5 w-5 h-5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-100 flex items-center justify-center"
          aria-label={t("members.removeMember")}
        >
          ×
        </button>
      )}
    </span>
  );
}
