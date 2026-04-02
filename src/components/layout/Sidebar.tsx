"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { LayoutDashboard, Users, Settings, LogOut, Wallet, Menu, X } from "lucide-react";

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: t("navigation.dashboard"), icon: LayoutDashboard },
    { href: "/groups", label: t("navigation.groups"), icon: Users },
    { href: "/settings", label: t("navigation.settings"), icon: Settings },
  ];

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-green-600 focus:text-white focus:rounded-lg"
      >
        {t("navigation.skipToContent")}
      </a>

      {/* Mobil Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-green-500" />
          <span className="font-bold">Expense Share</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-800 rounded-lg">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobil Spacer */}
      <div className="lg:hidden h-16" />

      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white p-4 flex flex-col",
          "lg:translate-x-0 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center gap-2 mb-8">
          <Wallet className="w-6 h-6 text-green-500" />
          <h1 className="text-xl font-bold">Expense Share</h1>
        </div>

        <nav aria-label={t("navigation.dashboard")} className="flex-1">
          <ul className="space-y-2" role="list">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-green-500",
                      isActive ? "bg-green-600 text-white" : "hover:bg-gray-800 text-gray-300"
                    )}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {session?.user && (
          <div className="border-t border-gray-700 pt-4 mt-4">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center font-medium"
                aria-hidden="true"
              >
                {session.user.name?.charAt(0).toUpperCase() || "?"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={handleLogout}
              innerClassName="flex items-center gap-2 justify-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t("auth.logout")}
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
