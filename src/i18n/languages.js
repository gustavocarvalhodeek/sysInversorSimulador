export const DEFAULT_LANGUAGE = "pt-BR";
export const LANGUAGE_STORAGE_KEY = "cfw100.language";

export const AVAILABLE_LANGUAGES = [
  { code: "pt-BR", label: "Portugu\u00eas", shortLabel: "PT" },
  { code: "en-US", label: "English", shortLabel: "EN" },
];

export function isSupportedLanguage(code) {
  return AVAILABLE_LANGUAGES.some((language) => language.code === code);
}

export function resolveLanguageCode(code) {
  return isSupportedLanguage(code) ? code : DEFAULT_LANGUAGE;
}
