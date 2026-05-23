import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  resolveLanguageCode,
} from "./languages.js";
import { hasTranslation, translate } from "./translations.js";

const I18nContext = createContext(null);

function readInitialLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  try {
    return resolveLanguageCode(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(readInitialLanguage);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }

    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Keep the in-memory language when localStorage is unavailable.
    }
  }, [language]);

  const setLanguage = useCallback((nextLanguage) => {
    setLanguageState(resolveLanguageCode(nextLanguage));
  }, []);

  const t = useCallback((key, params) => translate(language, key, params), [language]);

  const has = useCallback(
    (key, targetLanguage = language) => hasTranslation(targetLanguage, key),
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      currentLanguage: language,
      setLanguage,
      t,
      has,
      availableLanguages: AVAILABLE_LANGUAGES,
    }),
    [has, language, setLanguage, t],
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export default I18nContext;
