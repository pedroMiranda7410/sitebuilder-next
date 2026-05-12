"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  X,
  ToggleLeft,
  ToggleRight,
  Pencil,
  GripVertical,
  ChevronRight,
  ChevronLeft,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FormFieldType =
  | "text" | "email" | "phone" | "textarea"
  | "select" | "checkbox" | "radio"
  | "toggle" | "heading" | "paragraph";

export interface FormFieldOption {
  label: { pt: string; en?: string };
  value: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: { pt: string; en?: string };
  placeholder?: { pt: string; en?: string };
  required: boolean;
  position: number;
  options?: FormFieldOption[];
}

interface Evento {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  eventDate: string | null;
  location: string | null;
  coverImageUrl: string | null;
  registrationOpen: boolean;
  collectSignups: boolean;
  formSchema: FormField[];
  _count: { signups: number };
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-3 text-sm text-neutral-900 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400 transition-colors";

const textareaCls =
  "w-full px-3 py-2.5 text-sm text-neutral-900 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400 resize-none transition-colors";

const outlineBtnCls =
  "flex-1 py-2.5 text-sm font-medium text-neutral-800 border border-neutral-300 rounded-xl hover:bg-neutral-100 hover:border-neutral-400 transition-colors";

const primaryBtnCls =
  "flex-1 py-2.5 text-sm font-medium bg-neutral-950 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-40";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function nanoid() {
  return "field_" + Math.random().toString(36).slice(2, 10);
}

// ─── Field type metadata ──────────────────────────────────────────────────────

const FIELD_TYPES: { type: FormFieldType; label: string; icon: string; hasOptions: boolean }[] = [
  { type: "text",      label: "Texto curto",           icon: "📝", hasOptions: false },
  { type: "email",     label: "E-mail",                icon: "📧", hasOptions: false },
  { type: "phone",     label: "Telefone",              icon: "📱", hasOptions: false },
  { type: "textarea",  label: "Texto longo",           icon: "📄", hasOptions: false },
  { type: "checkbox",  label: "Múltipla escolha",      icon: "☑️",  hasOptions: true  },
  { type: "radio",     label: "Escolha única (radio)", icon: "🔘", hasOptions: true  },
  { type: "select",    label: "Lista suspensa",        icon: "▼",  hasOptions: true  },
  { type: "toggle",    label: "Sim/Não",               icon: "✅", hasOptions: false },
  { type: "heading",   label: "Título (separador)",    icon: "——", hasOptions: false },
  { type: "paragraph", label: "Parágrafo explicativo", icon: "¶",  hasOptions: false },
];

function fieldTypeMeta(type: FormFieldType) {
  return FIELD_TYPES.find((f) => f.type === type)!;
}

function fieldTypeLabel(type: FormFieldType) {
  const meta = fieldTypeMeta(type);
  return `${meta.icon} ${meta.label}`;
}

function isInputField(type: FormFieldType) {
  return !["heading", "paragraph"].includes(type);
}

// ─── Add/Edit field modal ─────────────────────────────────────────────────────

function FieldModal({
  field,
  onClose,
  onSave,
}: {
  field?: FormField;
  onClose: () => void;
  onSave: (f: FormField) => void;
}) {
  const [step, setStep] = useState<"type" | "config">(field ? "config" : "type");
  const [type, setType] = useState<FormFieldType>(field?.type ?? "text");
  const [labelPt, setLabelPt] = useState(field?.label.pt ?? "");
  const [labelEn, setLabelEn] = useState(field?.label.en ?? "");
  const [placeholderPt, setPlaceholderPt] = useState(field?.placeholder?.pt ?? "");
  const [required, setRequired] = useState(field?.required ?? false);
  const [options, setOptions] = useState<FormFieldOption[]>(
    field?.options ?? []
  );

  const meta = fieldTypeMeta(type);

  function handleSave() {
    const f: FormField = {
      id: field?.id ?? nanoid(),
      type,
      label: { pt: labelPt.trim(), en: labelEn.trim() || undefined },
      placeholder:
        placeholderPt.trim()
          ? { pt: placeholderPt.trim() }
          : undefined,
      required: isInputField(type) ? required : false,
      position: field?.position ?? 0,
      options: meta.hasOptions ? options : undefined,
    };
    onSave(f);
    onClose();
  }

  function addOption() {
    setOptions((prev) => [
      ...prev,
      { label: { pt: "", en: "" }, value: "opt_" + Math.random().toString(36).slice(2, 7) },
    ]);
  }

  function removeOption(idx: number) {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateOptionLabelPt(idx: number, val: string) {
    setOptions((prev) =>
      prev.map((o, i) =>
        i === idx ? { ...o, label: { ...o.label, pt: val }, value: o.value || slugify(val) } : o
      )
    );
  }

  function updateOptionLabelEn(idx: number, val: string) {
    setOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, label: { ...o.label, en: val } } : o))
    );
  }

  const canSave = labelPt.trim().length > 0 && (!meta.hasOptions || options.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            {step === "config" && !field && (
              <button
                onClick={() => setStep("type")}
                className="p-1 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-neutral-500" />
              </button>
            )}
            <h2 className="text-base font-semibold text-neutral-900">
              {step === "type"
                ? "Adicionar campo"
                : field
                ? "Editar campo"
                : `Configurar: ${meta.label}`}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        {/* Step 1: choose type */}
        {step === "type" && (
          <div className="px-4 py-4 space-y-1">
            {FIELD_TYPES.map((ft) => (
              <button
                key={ft.type}
                onClick={() => {
                  setType(ft.type);
                  setStep("config");
                  setOptions([]);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-neutral-800 hover:bg-neutral-50 transition-colors text-left"
              >
                <span className="w-6 text-center">{ft.icon}</span>
                {ft.label}
                <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
              </button>
            ))}
          </div>
        )}

        {/* Step 2: configure field */}
        {step === "config" && (
          <div className="px-6 py-5 space-y-4">
            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1.5">
                Pergunta / Label <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-400 w-5">PT</span>
                  <input
                    type="text"
                    value={labelPt}
                    onChange={(e) => setLabelPt(e.target.value)}
                    placeholder="Ex: Seu nome completo"
                    className={inputCls}
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-400 w-5">EN</span>
                  <input
                    type="text"
                    value={labelEn}
                    onChange={(e) => setLabelEn(e.target.value)}
                    placeholder="Ex: Your full name"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Placeholder (only for input types) */}
            {isInputField(type) && !meta.hasOptions && type !== "toggle" && (
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1.5">
                  Placeholder (opcional)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-400 w-5">PT</span>
                  <input
                    type="text"
                    value={placeholderPt}
                    onChange={(e) => setPlaceholderPt(e.target.value)}
                    placeholder="Dica para o preenchimento"
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            {/* Options (for select/checkbox/radio) */}
            {meta.hasOptions && (
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  Opções de resposta
                </label>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={opt.label.pt}
                          onChange={(e) => updateOptionLabelPt(idx, e.target.value)}
                          placeholder="PT"
                          className={inputCls}
                        />
                        <input
                          type="text"
                          value={opt.label.en ?? ""}
                          onChange={(e) => updateOptionLabelEn(idx, e.target.value)}
                          placeholder="EN"
                          className={inputCls}
                        />
                      </div>
                      <button
                        onClick={() => removeOption(idx)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addOption}
                    className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar opção
                  </button>
                </div>
              </div>
            )}

            {/* Required toggle (only for actual inputs) */}
            {isInputField(type) && (
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  className="w-4 h-4 rounded accent-neutral-900"
                />
                <span className="text-sm text-neutral-700">Campo obrigatório</span>
              </label>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className={outlineBtnCls}>
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={primaryBtnCls}
              >
                {field ? "Salvar campo" : "Adicionar campo"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Form builder ─────────────────────────────────────────────────────────────

function FormBuilder({
  fields,
  onChange,
}: {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const sorted = [...fields].sort((a, b) => a.position - b.position);

  function addField(f: FormField) {
    const withPosition = { ...f, position: fields.length + 1 };
    onChange([...fields, withPosition]);
  }

  function updateField(updated: FormField) {
    onChange(fields.map((f) => (f.id === updated.id ? updated : f)));
  }

  function removeField(id: string) {
    const remaining = fields.filter((f) => f.id !== id);
    const reindexed = remaining.map((f, i) => ({ ...f, position: i + 1 }));
    onChange(reindexed);
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...sorted];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next.map((f, i) => ({ ...f, position: i + 1 })));
  }

  function moveDown(idx: number) {
    if (idx === sorted.length - 1) return;
    const next = [...sorted];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next.map((f, i) => ({ ...f, position: i + 1 })));
  }

  return (
    <div className="space-y-3">
      {showAdd && (
        <FieldModal onClose={() => setShowAdd(false)} onSave={addField} />
      )}
      {editingField && (
        <FieldModal
          field={editingField}
          onClose={() => setEditingField(null)}
          onSave={updateField}
        />
      )}

      {sorted.length === 0 && (
        <div className="text-center py-8 text-sm text-neutral-400 border border-dashed border-neutral-200 rounded-xl">
          Nenhum campo adicionado. Clique em &quot;+ Adicionar campo&quot; para começar.
        </div>
      )}

      {sorted.map((field, idx) => {
        const meta = fieldTypeMeta(field.type);
        return (
          <div
            key={field.id}
            className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-3 group hover:border-neutral-300 transition-colors"
          >
            {/* Drag/reorder handles */}
            <div className="flex flex-col gap-0.5 flex-shrink-0">
              <button
                onClick={() => moveUp(idx)}
                className="w-5 h-4 flex items-center justify-center text-neutral-300 hover:text-neutral-600 transition-colors disabled:opacity-30"
                disabled={idx === 0}
              >
                ▴
              </button>
              <button
                onClick={() => moveDown(idx)}
                className="w-5 h-4 flex items-center justify-center text-neutral-300 hover:text-neutral-600 transition-colors disabled:opacity-30"
                disabled={idx === sorted.length - 1}
              >
                ▾
              </button>
            </div>

            <GripVertical className="w-4 h-4 text-neutral-300 flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {meta.icon} {field.label.pt || "(sem label)"}
              </p>
              <p className="text-xs text-neutral-400">
                {meta.label}
                {isInputField(field.type) && (
                  <span className="ml-1">· {field.required ? "Obrigatório" : "Opcional"}</span>
                )}
                {field.options && field.options.length > 0 && (
                  <span className="ml-1">· {field.options.length} opções</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setEditingField(field)}
                className="p-1.5 text-neutral-400 hover:text-neutral-800 transition-colors"
                title="Editar campo"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => removeField(field.id)}
                className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                title="Remover campo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      <button
        onClick={() => setShowAdd(true)}
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mt-1"
      >
        <Plus className="w-4 h-4" />
        Adicionar campo
      </button>
    </div>
  );
}

// ─── Event modal ──────────────────────────────────────────────────────────────

function EventModal({
  event,
  onClose,
  onSave,
}: {
  event?: Evento;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}) {
  const isEdit = !!event;

  function toLocalDatetime(iso: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const [title, setTitle] = useState(event?.title ?? "");
  const [date, setDate] = useState(toLocalDatetime(event?.eventDate ?? null));
  const [location, setLocation] = useState(event?.location ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(event?.coverImageUrl ?? "");
  const [registrationOpen, setRegistrationOpen] = useState(event?.registrationOpen ?? true);
  const [collectSignups, setCollectSignups] = useState(event?.collectSignups ?? false);
  const [formSchema, setFormSchema] = useState<FormField[]>(event?.formSchema ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        title,
        eventDate: date ? new Date(date).toISOString() : null,
        location: location || null,
        description: description || null,
        coverImageUrl: coverImageUrl || null,
        registrationOpen,
        collectSignups,
        formSchema,
      };
      if (!isEdit) {
        payload.slug = slugify(title) + "-" + Date.now();
      }
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar evento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">
            {isEdit ? "Editar evento" : "Novo evento"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Section 1 — Event data */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Dados do evento
            </p>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1.5">
                Nome do evento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex: Círculo de Mulheres — Agosto"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1.5">Data e hora</label>
                <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1.5">Local</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="São Paulo, SP"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1.5">Descrição</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Sobre o evento..." className={textareaCls} />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1.5">Foto de capa (URL)</label>
              <input type="text" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://..." className={inputCls} />
              {coverImageUrl?.startsWith("http") && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImageUrl} alt="Preview" className="mt-2 w-full h-28 object-cover rounded-xl" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
              )}
            </div>
          </div>

          {/* Section 2 — Signups */}
          <div className="space-y-4 pt-2 border-t border-neutral-100">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Inscrições
            </p>

            {/* collect signups choice */}
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors">
                <input
                  type="radio"
                  name="collect"
                  checked={!collectSignups}
                  onChange={() => setCollectSignups(false)}
                  className="mt-0.5 accent-neutral-900"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-800">Não coletar inscrições</p>
                  <p className="text-xs text-neutral-500">O evento não terá formulário</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors">
                <input
                  type="radio"
                  name="collect"
                  checked={collectSignups}
                  onChange={() => setCollectSignups(true)}
                  className="mt-0.5 accent-neutral-900"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-800">Coletar inscrições</p>
                  <p className="text-xs text-neutral-500">Formulário customizável abaixo</p>
                </div>
              </label>
            </div>

            {/* registration open toggle */}
            {collectSignups && (
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Inscrições abertas</p>
                  <p className="text-xs text-neutral-500">Desmarque para pausar novas inscrições</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRegistrationOpen((v) => !v)}
                  className={`transition-colors ${registrationOpen ? "text-emerald-600" : "text-neutral-300"}`}
                >
                  {registrationOpen ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>
            )}
          </div>

          {/* Section 3 — Form builder */}
          {collectSignups && (
            <div className="space-y-4 pt-2 border-t border-neutral-100">
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Formulário de inscrição
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Monte os campos que os inscritos vão preencher
                </p>
              </div>
              <FormBuilder fields={formSchema} onChange={setFormSchema} />
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className={outlineBtnCls}>
              Cancelar
            </button>
            <button type="submit" disabled={saving || !title.trim()} className={primaryBtnCls}>
              {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EventosClient({ events: initial }: { events: Evento[] }) {
  const [events, setEvents] = useState(initial);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleCreate(data: Record<string, unknown>) {
    const res = await fetch("/api/painel/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error ?? "Erro ao criar evento");
    }
    const created = await res.json();
    setEvents((prev) => [
      ...prev,
      {
        id: created.id,
        title: created.title,
        slug: created.slug,
        description: created.description ?? null,
        eventDate: created.eventDate ?? null,
        location: created.location ?? null,
        coverImageUrl: created.coverImageUrl ?? null,
        registrationOpen: created.registrationOpen ?? false,
        collectSignups: created.collectSignups ?? false,
        formSchema: created.formSchema ?? [],
        _count: { signups: 0 },
      },
    ]);
  }

  async function handleEdit(data: Record<string, unknown>) {
    if (!editingEvent) return;
    const res = await fetch(`/api/painel/events/${editingEvent.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error ?? "Erro ao salvar evento");
    }
    const updated = await res.json();
    setEvents((prev) =>
      prev.map((e) =>
        e.id === updated.id
          ? {
              ...e,
              title: updated.title,
              eventDate: updated.eventDate,
              location: updated.location,
              description: updated.description,
              coverImageUrl: updated.coverImageUrl,
              registrationOpen: updated.registrationOpen,
              collectSignups: updated.collectSignups,
              formSchema: updated.formSchema ?? [],
            }
          : e
      )
    );
  }

  async function toggleRegistration(id: string, current: boolean) {
    setTogglingId(id);
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, registrationOpen: !current } : e))
    );
    await fetch(`/api/painel/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationOpen: !current }),
    });
    setTogglingId(null);
  }

  return (
    <>
      {showCreateModal && (
        <EventModal onClose={() => setShowCreateModal(false)} onSave={handleCreate} />
      )}
      {editingEvent && (
        <EventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={handleEdit}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Eventos</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {events.length} evento{events.length !== 1 ? "s" : ""} cadastrado
            {events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo evento
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-neutral-200 py-20 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-neutral-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-600">Nenhum evento criado ainda</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Crie seu primeiro evento para começar a receber inscrições
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-1 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Criar evento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-300 transition-colors"
            >
              {/* Cover */}
              {event.coverImageUrl?.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.coverImageUrl}
                  alt={event.title}
                  className="w-full h-36 object-cover"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-neutral-300" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-neutral-900 text-sm leading-snug">
                    {event.title}
                  </h3>
                  <span
                    className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                      event.registrationOpen && event.collectSignups
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {event.collectSignups
                      ? event.registrationOpen
                        ? "Inscrições abertas"
                        : "Inscrições pausadas"
                      : "Sem inscrições"}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  {event.eventDate && (
                    <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      {format(new Date(event.eventDate), "d 'de' MMMM 'de' yyyy 'às' HH'h'mm", {
                        locale: ptBR,
                      })}
                    </p>
                  )}
                  {event.location && (
                    <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {event.location}
                    </p>
                  )}
                  {event.collectSignups && (
                    <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      {event._count.signups} inscrito{event._count.signups !== 1 ? "s" : ""}
                      {event.formSchema.length > 0 && (
                        <span className="text-neutral-400">· {event.formSchema.length} campo{event.formSchema.length !== 1 ? "s" : ""}</span>
                      )}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => setEditingEvent(event)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 border border-neutral-300 rounded-lg hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    Editar
                  </button>
                  {event.collectSignups && (
                    <>
                      <button
                        onClick={() => toggleRegistration(event.id, event.registrationOpen)}
                        disabled={togglingId === event.id}
                        className="flex-1 py-1.5 text-xs font-medium text-neutral-800 border border-neutral-300 rounded-lg hover:bg-neutral-100 hover:border-neutral-400 transition-colors disabled:opacity-40"
                      >
                        {event.registrationOpen ? "Pausar inscrições" : "Abrir inscrições"}
                      </button>
                      <Link
                        href={`/painel/eventos/${event.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 border border-neutral-300 rounded-lg hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
                      >
                        <Users className="w-3 h-3" />
                        Inscritos
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
