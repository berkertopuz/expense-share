"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useTranslations, useFormatter } from "next-intl";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useDebounce } from "@/hooks";

export default function GroupsPage() {
  const t = useTranslations();
  const format = useFormatter();

  const [newGroupName, setNewGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearch = useDebounce(searchQuery, 300);

  const utils = trpc.useUtils();

  const { data: groups, isLoading, error } = trpc.group.list.useQuery();

  const createGroup = trpc.group.create.useMutation({
    onSuccess: () => {
      utils.group.list.invalidate();
      setNewGroupName("");
    },
  });

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    if (!debouncedSearch.trim()) return groups;

    const query = debouncedSearch.toLowerCase();
    return groups.filter((group) => group.name.toLowerCase().includes(query));
  }, [groups, debouncedSearch]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = newGroupName.trim();
      if (!trimmed) return;

      createGroup.mutate({ name: trimmed });
    },
    [newGroupName, createGroup]
  );

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("groups.title")}</h1>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <fieldset disabled={createGroup.isPending}>
          <legend className="sr-only">{t("groups.newGroup")}</legend>

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label={t("groups.groupName")}
                hideLabel
                placeholder={t("groups.groupNamePlaceholder")}
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                error={createGroup.error?.message}
              />
            </div>
            <Button type="submit" isLoading={createGroup.isPending} disabled={!newGroupName.trim()}>
              {t("common.create")}
            </Button>
          </div>
        </fieldset>
      </form>

      {/* Search */}
      <div className="mb-6">
        <Input
          label={t("common.search")}
          hideLabel
          type="search"
          placeholder={t("groups.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {debouncedSearch && (
          <p className="text-sm text-gray-500 mt-1" aria-live="polite">
            {t("groups.searchResults", { count: filteredGroups.length })}
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12" role="status">
          <svg
            className="animate-spin h-8 w-8 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="ml-3 text-gray-600">{t("common.loading")}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
          role="alert"
        >
          {t("groups.errors.loadFailed")}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredGroups.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          {debouncedSearch ? (
            <>
              <p className="text-gray-500 mb-2">
                {t("groups.empty.searchEmpty", { query: debouncedSearch })}
              </p>
              <Button variant="ghost" onClick={() => setSearchQuery("")}>
                {t("common.cancel")}
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-4">{t("groups.empty.title")}</p>
              <p className="text-sm text-gray-400">{t("groups.empty.description")}</p>
            </>
          )}
        </div>
      )}

      {/* Groups List */}
      {filteredGroups.length > 0 && (
        <ul className="space-y-3" role="list" aria-label={t("groups.title")}>
          {filteredGroups.map((group) => (
            <li key={group.id}>
              <Link
                href={`/groups/${group.id}`}
                className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-lg text-gray-900">{group.name}</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {t("groups.members", { count: group.members?.length ?? 0 })}
                    </p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {format.dateTime(new Date(group.createdAt), "short")}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
