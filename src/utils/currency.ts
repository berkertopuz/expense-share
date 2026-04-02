type CurrencyCode = "TRY" | "USD" | "EUR";
type Locale = "tr-TR" | "en-US" | "de-DE";

// Currying
export const formatCurrency =
  (locale: Locale) =>
  (currency: CurrencyCode) =>
  (amount: number): string => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

export const formatTRY = formatCurrency("tr-TR")("TRY");
export const formatUSD = formatCurrency("en-US")("USD");
export const formatEUR = formatCurrency("de-DE")("EUR");

export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d,-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
};
