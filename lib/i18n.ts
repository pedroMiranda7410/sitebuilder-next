export type TranslatableField = string | Record<string, string>;

export function t(
  field: TranslatableField | undefined,
  lang: string,
  fallback = ""
): string {
  if (!field) return fallback;
  if (typeof field === "string") return field;
  return field[lang] ?? field["pt"] ?? field["en"] ?? fallback;
}

export function isTranslatable(field: unknown): boolean {
  return typeof field === "object" && field !== null && !Array.isArray(field);
}

export function availableLangs(field: TranslatableField): string[] {
  if (typeof field === "string") return ["pt"];
  return Object.keys(field);
}
