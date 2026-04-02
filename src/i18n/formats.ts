import type { Locale } from "./config";

const currencyByLocale: Record<Locale, string> = {
  tr: "TRY",
  en: "USD",
};

export const createFormats = (locale: Locale) =>
  ({
    dateTime: {
      short: {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
      long: {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      },
    },
    number: {
      currency: {
        style: "currency",
        currency: currencyByLocale[locale],
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
      percent: {
        style: "percent",
        maximumFractionDigits: 1,
      },
    },
  }) as const;
