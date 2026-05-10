"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TranslatableField } from "@/lib/i18n";

const LANG_LABELS: Record<string, string> = {
  pt: "PT",
  en: "EN",
  es: "ES",
};

interface TranslatableTextareaProps {
  value: TranslatableField;
  onChange: (value: TranslatableField) => void;
  languages: string[];
  label: string;
  placeholder?: string;
  hint?: string;
  rows?: number;
}

export function TranslatableTextarea({
  value,
  onChange,
  languages,
  label,
  placeholder,
  hint,
  rows = 4,
}: TranslatableTextareaProps) {
  const [activeLang, setActiveLang] = useState(languages[0] ?? "pt");

  function getCurrentText(): string {
    if (typeof value === "string") return value;
    return value[activeLang] ?? "";
  }

  function handleChange(text: string) {
    if (languages.length === 1) {
      onChange({ [languages[0]]: text });
    } else {
      const current = typeof value === "string" ? { [languages[0]]: value } : { ...value };
      onChange({ ...current, [activeLang]: text });
    }
  }

  function ensureAllLangs(): Record<string, string> {
    const base = typeof value === "string" ? { [languages[0]]: value } : { ...(value as Record<string, string>) };
    for (const lang of languages) {
      if (!(lang in base)) base[lang] = "";
    }
    return base;
  }

  const showTabs = languages.length > 1;
  const currentText = getCurrentText();

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-600">{label}</label>

      {showTabs && (
        <div className="flex gap-0 border border-neutral-200 rounded-t-xl overflow-hidden border-b-0">
          {languages.map((lang) => {
            const obj = ensureAllLangs();
            const isEmpty = !obj[lang];
            return (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1",
                  activeLang === lang
                    ? "bg-white text-neutral-900"
                    : "bg-neutral-50 text-neutral-500 hover:text-neutral-700"
                )}
              >
                {LANG_LABELS[lang] ?? lang.toUpperCase()}
                {isEmpty && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <textarea
        value={currentText}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "w-full px-3 py-2.5 text-sm text-neutral-900 bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400 resize-y transition",
          showTabs ? "rounded-b-xl rounded-t-none" : "rounded-xl"
        )}
      />

      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
