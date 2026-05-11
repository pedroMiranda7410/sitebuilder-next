"use client";

import { useState } from "react";
import { TranslatableInput } from "@/components/ui/translatable-input";
import { TranslatableTextarea } from "@/components/ui/translatable-textarea";
import type { TranslatableField } from "@/lib/i18n";
import { GripVertical, Plus, Trash2, Pencil, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface SectionField {
  key: string;
  label: string;
  type: string;
  translatable: boolean;
  placeholder?: string | null;
  helpText?: string | null;
  required?: boolean;
  position?: number | null;
  options?: Record<string, unknown> | null;
}

interface FieldEditorProps {
  fields: SectionField[];
  content: Record<string, unknown>;
  languages: string[];
  onChange: (key: string, value: unknown) => void;
}

// ─── Scalar field wrappers ────────────────────────────────────────────────────

function FieldWrapper({ label, hint, required, children }: {
  label: string;
  hint?: string | null;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

function ImageUrlField({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const isValid = value?.startsWith("http");
  return (
    <div className="space-y-2">
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "https://..."}
        className="w-full h-10 px-3 text-sm rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400"
      />
      {isValid && (
        <div className="rounded-xl overflow-hidden border border-neutral-100 bg-neutral-50 h-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}
    </div>
  );
}

// ─── List editor ──────────────────────────────────────────────────────────────

function ListEditor({ value, onChange, languages, translatable }: {
  value: (string | TranslatableField)[];
  onChange: (v: (string | TranslatableField)[]) => void;
  languages: string[];
  translatable: boolean;
}) {
  function addItem() {
    const empty: TranslatableField = translatable && languages.length > 1
      ? Object.fromEntries(languages.map((l) => [l, ""]))
      : "";
    onChange([...value, empty]);
  }
  function updateItem(idx: number, v: TranslatableField) {
    const next = [...value];
    next[idx] = v;
    onChange(next);
  }
  function removeItem(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-2">
      {value.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <div className="flex-1">
            {translatable ? (
              <TranslatableInput
                label=""
                value={item as TranslatableField}
                onChange={(v) => updateItem(idx, v)}
                languages={languages}
              />
            ) : (
              <input
                type="text"
                value={item as string}
                onChange={(e) => updateItem(idx, e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            )}
          </div>
          <button
            onClick={() => removeItem(idx)}
            className="mt-1 p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full py-2 text-sm font-medium border-2 border-dashed border-neutral-200 rounded-xl text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        Adicionar item
      </button>
    </div>
  );
}

// ─── Gallery editor ───────────────────────────────────────────────────────────

function GalleryEditor({ value, onChange }: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [newUrl, setNewUrl] = useState("");

  function add() {
    if (!newUrl.startsWith("http")) return;
    onChange([...value, newUrl]);
    setNewUrl("");
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {value.map((url, idx) => (
          <div key={idx} className="relative rounded-xl overflow-hidden border border-neutral-200 aspect-square bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => onChange(value.filter((_, i) => i !== idx))}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <div className="aspect-square rounded-xl border-2 border-dashed border-neutral-200 flex items-center justify-center">
          <Plus className="w-5 h-5 text-neutral-300" />
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="https://... Cole a URL e pressione Adicionar"
          className="flex-1 h-10 px-3 text-sm rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400"
        />
        <button
          onClick={add}
          disabled={!newUrl.startsWith("http")}
          className="px-3 py-2 text-sm font-medium bg-neutral-950 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-40"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}

// ─── FAQ editor ───────────────────────────────────────────────────────────────

type FaqItem = { question: TranslatableField; answer: TranslatableField };

function FaqEditor({ value, onChange, languages }: {
  value: FaqItem[];
  onChange: (v: FaqItem[]) => void;
  languages: string[];
}) {
  function addItem() {
    const empty: TranslatableField = languages.length > 1
      ? Object.fromEntries(languages.map((l) => [l, ""])) : "";
    onChange([...value, { question: empty, answer: empty }]);
  }
  function updateItem(idx: number, key: "question" | "answer", v: TranslatableField) {
    const next = [...value];
    next[idx] = { ...next[idx], [key]: v };
    onChange(next);
  }
  function removeItem(idx: number) { onChange(value.filter((_, i) => i !== idx)); }

  return (
    <div className="space-y-4">
      {value.map((item, idx) => (
        <div key={idx} className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-neutral-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Pergunta {idx + 1}</span>
            <button onClick={() => removeItem(idx)} className="p-1 text-neutral-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <TranslatableInput
            label="Pergunta"
            value={item.question}
            onChange={(v) => updateItem(idx, "question", v)}
            languages={languages}
          />
          <TranslatableTextarea
            label="Resposta"
            value={item.answer}
            onChange={(v) => updateItem(idx, "answer", v)}
            languages={languages}
            rows={3}
          />
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full py-2 text-sm font-medium border-2 border-dashed border-neutral-200 rounded-xl text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        Adicionar pergunta
      </button>
    </div>
  );
}

// ─── Details editor ───────────────────────────────────────────────────────────

type DetailItem = { label: TranslatableField; value: TranslatableField };

function DetailsEditor({ value, onChange, languages }: {
  value: DetailItem[];
  onChange: (v: DetailItem[]) => void;
  languages: string[];
}) {
  function addItem() {
    const empty: TranslatableField = languages.length > 1
      ? Object.fromEntries(languages.map((l) => [l, ""])) : "";
    onChange([...value, { label: empty, value: empty }]);
  }
  function updateItem(idx: number, key: "label" | "value", v: TranslatableField) {
    const next = [...value];
    next[idx] = { ...next[idx], [key]: v };
    onChange(next);
  }
  function removeItem(idx: number) { onChange(value.filter((_, i) => i !== idx)); }

  return (
    <div className="space-y-3">
      {value.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <TranslatableInput label="Chave" value={item.label} onChange={(v) => updateItem(idx, "label", v)} languages={languages} />
            <TranslatableInput label="Valor" value={item.value} onChange={(v) => updateItem(idx, "value", v)} languages={languages} />
          </div>
          <button onClick={() => removeItem(idx)} className="mt-6 p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full py-2 text-sm font-medium border-2 border-dashed border-neutral-200 rounded-xl text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        Adicionar detalhe
      </button>
    </div>
  );
}

// ─── Cards editor ─────────────────────────────────────────────────────────────

type CardItem = Record<string, TranslatableField | string>;

function CardsEditor({ value, onChange, languages, cardFields }: {
  value: CardItem[];
  onChange: (v: CardItem[]) => void;
  languages: string[];
  cardFields: string[];
}) {
  const [editingIdx, setEditingIdx] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<CardItem>({});

  const defaultCardFields = cardFields.length > 0 ? cardFields : ["title", "text", "image_url", "link_url"];

  function openNew() {
    setDraft({});
    setEditingIdx("new");
  }
  function openEdit(idx: number) {
    setDraft({ ...value[idx] });
    setEditingIdx(idx);
  }
  function saveCard() {
    if (editingIdx === "new") {
      onChange([...value, draft]);
    } else {
      onChange(value.map((c, i) => (i === editingIdx ? draft : c)));
    }
    setEditingIdx(null);
  }
  function removeCard(idx: number) {
    if (!confirm("Remover este card?")) return;
    onChange(value.filter((_, i) => i !== idx));
  }

  const getTitle = (card: CardItem) => {
    const t = card.title ?? card.name ?? "";
    if (typeof t === "string") return t;
    return t[languages[0]] ?? "";
  };

  return (
    <div className="space-y-2">
      {value.map((card, idx) => (
        <div key={idx} className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-4 py-3">
          <GripVertical className="w-4 h-4 text-neutral-300 flex-shrink-0" />
          <p className="flex-1 text-sm font-medium text-neutral-900 truncate">{getTitle(card) || `Card ${idx + 1}`}</p>
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={() => openEdit(idx)}
              className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => removeCard(idx)}
              className="px-2.5 py-1.5 text-xs font-medium text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={openNew}
        className="w-full py-2.5 text-sm font-medium border-2 border-dashed border-neutral-200 rounded-xl text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        Adicionar card
      </button>

      <Modal open={editingIdx !== null} onClose={() => setEditingIdx(null)} title={editingIdx === "new" ? "Novo card" : "Editar card"}>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {defaultCardFields.map((fieldKey) => {
            const isImageUrl = fieldKey.includes("image") || fieldKey.includes("photo") || fieldKey.includes("cover");
            const isUrl = fieldKey.includes("url") && !isImageUrl;
            const val = (draft[fieldKey] ?? "") as TranslatableField;

            return (
              <div key={fieldKey}>
                {isImageUrl ? (
                  <FieldWrapper label={fieldKey.replace(/_/g, " ")}>
                    <ImageUrlField value={typeof val === "string" ? val : ""} onChange={(v) => setDraft((d) => ({ ...d, [fieldKey]: v }))} />
                  </FieldWrapper>
                ) : isUrl ? (
                  <FieldWrapper label={fieldKey.replace(/_/g, " ")}>
                    <input type="url" value={typeof val === "string" ? val : ""} onChange={(e) => setDraft((d) => ({ ...d, [fieldKey]: e.target.value }))} placeholder="https://..." className="w-full h-10 px-3 text-sm rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                  </FieldWrapper>
                ) : (
                  <TranslatableInput label={fieldKey.replace(/_/g, " ")} value={val} onChange={(v) => setDraft((d) => ({ ...d, [fieldKey]: v }))} languages={languages} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setEditingIdx(null)} className="flex-1 py-2.5 text-sm font-medium border border-neutral-300 rounded-xl hover:bg-neutral-100 transition-colors">Cancelar</button>
          <button onClick={saveCard} className="flex-1 py-2.5 text-sm font-medium bg-neutral-950 text-white rounded-xl hover:bg-neutral-800 transition-colors">Salvar</button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function FieldEditor({ fields, content, languages, onChange }: FieldEditorProps) {
  if (fields.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-neutral-400">
        Nenhum campo configurado para esta seção.
        <br />
        <span className="text-xs">O administrador pode adicionar campos na aba "Campos" do painel admin.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {fields
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((field) => {
          const val = content[field.key];
          const lang = languages[0] ?? "pt";

          switch (field.type) {
            case "text":
              return (
                <TranslatableInput
                  key={field.key}
                  label={field.label}
                  hint={field.helpText ?? undefined}
                  value={(val as TranslatableField) ?? ""}
                  onChange={(v) => onChange(field.key, v)}
                  languages={field.translatable ? languages : [lang]}
                  placeholder={field.placeholder ?? undefined}
                />
              );

            case "textarea":
            case "richtext":
              return (
                <TranslatableTextarea
                  key={field.key}
                  label={field.label}
                  hint={field.helpText ?? undefined}
                  value={(val as TranslatableField) ?? ""}
                  onChange={(v) => onChange(field.key, v)}
                  languages={field.translatable ? languages : [lang]}
                  placeholder={field.placeholder ?? undefined}
                  rows={4}
                />
              );

            case "image_url":
              return (
                <FieldWrapper key={field.key} label={field.label} hint={field.helpText} required={field.required}>
                  <ImageUrlField
                    value={(val as string) ?? ""}
                    onChange={(v) => onChange(field.key, v)}
                    placeholder={field.placeholder ?? undefined}
                  />
                </FieldWrapper>
              );

            case "url":
            case "email":
            case "phone":
              return (
                <FieldWrapper key={field.key} label={field.label} hint={field.helpText} required={field.required}>
                  <input
                    type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "url"}
                    value={(val as string) ?? ""}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    placeholder={field.placeholder ?? undefined}
                    className="w-full h-10 px-3 text-sm rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400"
                  />
                </FieldWrapper>
              );

            case "number":
              return (
                <FieldWrapper key={field.key} label={field.label} hint={field.helpText} required={field.required}>
                  <input
                    type="number"
                    value={(val as string) ?? ""}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </FieldWrapper>
              );

            case "boolean":
              return (
                <label key={field.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!(val as boolean)}
                    onChange={(e) => onChange(field.key, e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 accent-neutral-900"
                  />
                  <div>
                    <p className="text-sm font-medium text-neutral-600">{field.label}</p>
                    {field.helpText && <p className="text-xs text-neutral-400">{field.helpText}</p>}
                  </div>
                </label>
              );

            case "color":
              return (
                <FieldWrapper key={field.key} label={field.label} hint={field.helpText}>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={(val as string) ?? "#000000"}
                      onChange={(e) => onChange(field.key, e.target.value)}
                      className="w-10 h-10 rounded-xl border border-neutral-200 cursor-pointer p-0.5"
                    />
                    <code className="text-sm text-neutral-600">{(val as string) ?? "#000000"}</code>
                  </div>
                </FieldWrapper>
              );

            case "select": {
              const choices = (field.options?.choices as string[]) ?? [];
              return (
                <FieldWrapper key={field.key} label={field.label} hint={field.helpText} required={field.required}>
                  <select
                    value={(val as string) ?? ""}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    <option value="">Selecione...</option>
                    {choices.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </FieldWrapper>
              );
            }

            case "date":
              return (
                <FieldWrapper key={field.key} label={field.label} hint={field.helpText} required={field.required}>
                  <input
                    type="date"
                    value={(val as string) ?? ""}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </FieldWrapper>
              );

            case "list":
              return (
                <FieldWrapper key={field.key} label={field.label} hint={field.helpText}>
                  <ListEditor
                    value={((val as (string | TranslatableField)[]) ?? [])}
                    onChange={(v) => onChange(field.key, v)}
                    languages={languages}
                    translatable={field.translatable}
                  />
                </FieldWrapper>
              );

            case "gallery":
              return (
                <FieldWrapper key={field.key} label={field.label} hint={field.helpText}>
                  <GalleryEditor
                    value={(val as string[]) ?? []}
                    onChange={(v) => onChange(field.key, v)}
                  />
                </FieldWrapper>
              );

            case "faq":
              return (
                <FieldWrapper key={field.key} label={field.label} hint={field.helpText}>
                  <FaqEditor
                    value={(val as FaqItem[]) ?? []}
                    onChange={(v) => onChange(field.key, v)}
                    languages={languages}
                  />
                </FieldWrapper>
              );

            case "details":
              return (
                <FieldWrapper key={field.key} label={field.label} hint={field.helpText}>
                  <DetailsEditor
                    value={(val as DetailItem[]) ?? []}
                    onChange={(v) => onChange(field.key, v)}
                    languages={languages}
                  />
                </FieldWrapper>
              );

            case "cards": {
              const cardFields = (field.options?.fields as string[]) ?? [];
              return (
                <FieldWrapper key={field.key} label={field.label} hint={field.helpText}>
                  <CardsEditor
                    value={(val as CardItem[]) ?? []}
                    onChange={(v) => onChange(field.key, v)}
                    languages={languages}
                    cardFields={cardFields}
                  />
                </FieldWrapper>
              );
            }

            default:
              return (
                <FieldWrapper key={field.key} label={field.label} hint={field.helpText}>
                  <input
                    type="text"
                    value={(val as string) ?? ""}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    placeholder={field.placeholder ?? undefined}
                    className="w-full h-10 px-3 text-sm rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </FieldWrapper>
              );
          }
        })}
    </div>
  );
}
