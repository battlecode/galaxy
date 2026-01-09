import type { LanguagesEnum } from "../api/_autogen";

/**
 * Map of LanguagesEnum values to human-readable labels
 */
export const LANGUAGE_LABELS: Record<LanguagesEnum, string> = {
  java8: "Java 8",
  java21: "Java 21",
  py3: "Python 3",
};

/**
 * Get human-readable label for a language enum value
 * @param language - The LanguagesEnum value
 * @returns Human-readable language label
 */
export const getLanguageLabel = (language: LanguagesEnum): string =>
  LANGUAGE_LABELS[language];

/**
 * Get all supported language options as {value, label} pairs
 * @param supportedLanguages - Array of supported LanguagesEnum values
 * @returns Array of {value, label} objects for dropdown/select components
 */
export const getLanguageOptions = (
  supportedLanguages: LanguagesEnum[],
): Array<{ value: LanguagesEnum; label: string }> =>
  supportedLanguages.map((lang) => ({
    value: lang,
    label: getLanguageLabel(lang),
  }));
