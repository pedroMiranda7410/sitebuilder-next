export const FIELD_TYPES = {
  text:     { label: "Texto curto",              icon: "Type" },
  textarea: { label: "Texto longo",              icon: "AlignLeft" },
  richtext: { label: "Texto formatado",          icon: "FileText" },
  image_url:{ label: "URL de imagem",            icon: "Image" },
  url:      { label: "Link/URL",                 icon: "Link" },
  email:    { label: "E-mail",                   icon: "Mail" },
  phone:    { label: "Telefone",                 icon: "Phone" },
  boolean:  { label: "Sim/Não",                  icon: "ToggleLeft" },
  number:   { label: "Número",                   icon: "Hash" },
  date:     { label: "Data",                     icon: "Calendar" },
  select:   { label: "Seleção única",            icon: "ChevronDown" },
  color:    { label: "Cor",                      icon: "Palette" },
  list:     { label: "Lista de itens",           icon: "List" },
  cards:    { label: "Cards",                    icon: "LayoutGrid" },
  gallery:  { label: "Galeria de fotos",         icon: "Images" },
  faq:      { label: "Perguntas e respostas",    icon: "HelpCircle" },
  details:  { label: "Detalhes (chave/valor)",   icon: "Table" },
} as const;

export type FieldType = keyof typeof FIELD_TYPES;

// Non-translatable field types (values stored as-is, not i18n objects)
export const NON_TRANSLATABLE_TYPES: FieldType[] = [
  "image_url",
  "url",
  "email",
  "phone",
  "boolean",
  "number",
  "date",
  "color",
  "gallery",
];

export function isNonTranslatableByDefault(type: FieldType): boolean {
  return NON_TRANSLATABLE_TYPES.includes(type);
}

// Generate snake_case key from a label string
export function labelToKey(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}
