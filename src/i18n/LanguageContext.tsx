import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { type Language, t, type TranslationKey } from "./translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem("game-language") as Language) || "ar";
  });

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem("game-language", l);
  }, []);

  useEffect(() => {
    document.body.style.direction = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const translate = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => t(key, lang, params),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translate, isRTL: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
