import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";
import { routing } from "./routing";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeMessages(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = merged[key];
    if (isObject(baseValue) && isObject(value)) {
      merged[key] = mergeMessages(baseValue, value);
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }

  const enMessages = (await import("../messages/en.json")).default as Record<string, unknown>;
  const localeMessages =
    locale === "en"
      ? enMessages
      : (await import(`../messages/${locale}.json`)).default as Record<string, unknown>;

  return {
    locale,
    messages: mergeMessages(enMessages, localeMessages) as AbstractIntlMessages,
  };
});
