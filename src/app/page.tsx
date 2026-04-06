import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Wallet } from "lucide-react";

export default async function Home() {
  const t = await getTranslations();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-linear-to-b from-green-50 to-white">
      <h1 className="flex items-center gap-4 text-4xl font-bold mb-4">
        <Wallet className="w-8 h-8 text-green-500" />
        {t("metadata.title")}
      </h1>
      <p className="text-gray-700 mb-8 text-center max-w-md">{t("metadata.description")}</p>

      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          {t("auth.login")}
        </Link>
      </div>
    </main>
  );
}
