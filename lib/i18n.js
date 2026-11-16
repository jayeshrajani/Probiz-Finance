// English source strings are the keys; Hindi pages receive a dictionary of translations (see lib/i18n-static.js).
import { createContext, useCallback, useContext, useMemo } from "react";

export const LOCALES = ["en", "hi"];
export const DEFAULT_LOCALE = "en";

const I18nContext = createContext({ locale: DEFAULT_LOCALE, messages: null });

// Development only: Hindi pages collect untranslated text in window.__i18nMissing (see npm run check:i18n for the static check).
const devMissing = process.env.NODE_ENV !== "production" && typeof window !== "undefined" ? (window.__i18nMissing ||= new Set()) : null;

export function translate(messages, text, vars) {
  if (typeof text !== "string" || !text) return text;
  if (devMissing && messages && !messages[text]) devMissing.add(text);
  let out = (messages && messages[text]) || text;
  if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] === undefined || vars[k] === null ? m : String(vars[k])));
  return out;
}

export function I18nProvider({ locale, messages, children }) {
  const value = useMemo(() => ({ locale: locale || DEFAULT_LOCALE, messages: locale === "hi" ? messages || null : null }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useLocale = () => useContext(I18nContext).locale;

export function useT() {
  const { messages } = useContext(I18nContext);
  return useCallback((text, vars) => translate(messages, text, vars), [messages]);
}

export function useI18n() {
  const { locale, messages } = useContext(I18nContext);
  const t = useCallback((text, vars) => translate(messages, text, vars), [messages]);
  return { locale, t };
}
