"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.errors.passwordMismatch"));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(t(data.code));
        return;
      }

      router.push("/login");
    } catch {
      setError(t("common.api.serverError"));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("metadata.title")}</h1>
          <p className="text-gray-600 mt-2">{t("auth.register")}</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label={t("auth.name")}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />

              <Input
                label={t("auth.email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Input
                label={t("auth.password")}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              <Input
                label={t("auth.confirmPassword")}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              {error && (
                <p className="text-red-600 text-sm" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {t("auth.register")}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
              {t("auth.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
