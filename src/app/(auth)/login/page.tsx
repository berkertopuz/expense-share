"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Wallet } from "lucide-react";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("auth.errors.loginFailed"));
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="flex items-center justify-center gap-5 text-3xl font-bold text-gray-900">
            <Wallet className="w-8 h-8 text-green-500" />
            Expense Share
          </h1>
          <p className="text-gray-600 mt-2">{t("auth.login")}</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          {/* Google Login */}
          <Button
            type="button"
            variant="secondary"
            className="w-full mb-6"
            innerClassName="flex items-center gap-2"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{t("auth.loginWithGoogle")}</span>
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t("auth.orContinueWith")}</span>
            </div>
          </div>

          {/* Email Login */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                autoComplete="current-password"
              />

              {error && (
                <p className="text-red-600 text-sm" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {t("auth.login")}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
              {t("auth.register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
