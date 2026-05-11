"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, Type, AlignLeft, Image, Link, Mail, Phone, ToggleLeft, Hash, Calendar, ChevronDown, Palette, List, LayoutGrid, Images, HelpCircle, Table, FileText } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { FIELD_TYPES, type FieldType, labelToKey, isNonTranslatableByDefault } from "@/lib/field-types";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  text:      <Type className="w-3.5 h-3.5" />,
  textarea:  <AlignLeft className="w-3.5 h-3.5" />,
  richtext:  <FileText className="w-3.5 h-3.5" />,
  image_url: <Image className="w-3.5 h-3.5" />,
  url:       <Link className="w-3.5 h-3.5" />,
  email:     <Mail className="w-3.5 h-3.5" />,
  phone:     <Phone className="w-3.5 h-3.5" />,
  boolean:   <ToggleLeft className="w-3.5 h-3.5" />,
  number:    <Hash className="w-3.5 h-3.5" />,
  date:      <Calendar className="w-3.5 h-3.5" />,
  select:    <ChevronDown className="w-3.5 h-3.5" />,
  color:     <Palette className="w-3.5 h-3.5" />,
  list:      <List className="w-3.5 h-3.5" />,
  cards:     <LayoutGrid className="w-3.5 h-3.5" />,
  gallery:   <Images className="w-3.5 h-3.5" />,
  faq:       <HelpCircle className="w-3.5 h-3.5" />,
  details:   <Table className="w-3.5 h-3.5" />,
};

interface Field {
  id: string;
  key: string;
  label: string;
  type: string;
  translatable: boolean;
  placeholder: string | null;
  helpText: string | null;
  required: boolean;
  position: number;
  options: Record<string, unknown> | null;
}

interface FieldDraft {
  key: string;
  label: string;
  type: FieldType;
  translatable: boolean;
  placeholder: string;
  helpText: string;
  required: boolean;
}

const DEFAULT_DRAFT: FieldDraft = {
  key: "",
  label: "",
  type: "text",
  translatable: true,
  placeholder: "",
  helpText: "",
  required: false,
};

interface SectionFieldsManagerProps {
  entityId: string;
  entityType: "section" | "service";
  initialFields: Field[];
}

export function SectionFieldsManager({ entityId, entityType, initialFields }: SectionFieldsManagerProps) {
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [draft, setDraft] = useState<FieldDraft>(DEFAULT_DRAFT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [keyManuallyEdited, setKeyManuallyEdited] = useState(false);

  const baseUrl = entityType === "section"
    ? `/api/admin/sections/${entityId}/fields`
    : `/api/admin/services/${entityId}/fields`;

  function openNew() {
    setEditingField(null);
    setDraft(DEFAULT_DRAFT);
    setKeyManuallyEdited(false);
    setError("");
    setModalOpen(true);
  }

  function openEdit(field: Field) {
    setEditingField(field);
    setDraft({
      key: field.key,
      label: field.label,
      type: field.type as FieldType,
      translatable: field.translatable,
      placeholder: field.placeholder ?? "",
      helpText: field.helpText ?? "",
      required: field.required,
    });
    setKeyManuallyEdited(true);
    setError("");
    setModalOpen(true);
  }

  function handleLabelChange(label: string) {
    setDraft((d) => ({
      ...d,
      label,
      key: keyManuallyEdited ? d.key : labelToKey(label),
    }));
  }

  function handleTypeChange(type: FieldType) {
    setDraft((d) => ({
      ...d,
      type,
      translatable: isNonTranslatableByDefault(type) ? false : d.translatable,
    }));
  }

  async function save() {
    if (!draft.label.trim() || !draft.key.trim()) {
      setError("Label e key são obrigatórios");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const body = {
        key: draft.key,
        label: draft.label,
        type: draft.type,
        translatable: draft.translatable,
        placeholder: draft.placeholder || null,
        helpText: draft.helpText || null,
        required: draft.required,
        position: editingField?.position ?? fields.length + 1,
      };

      const res = await fetch(
        editingField ? `${baseUrl}/${editingField.id}` : baseUrl,
        {
          method: editingField ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? data.errors?.[0] ?? "Erro ao salvar");
        return;
      }

      if (editingField) {
        setFields((prev) => prev.map((f) => (f.id === editingField.id ? data : f)));
      } else {
        setFields((prev) => [...prev, data]);
      }
      setModalOpen(false);
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  async function deleteField(field: Field) {
    if (!confirm(`Remover o campo "${field.label}"? O valor salvo no conteúdo NÃO será apagado.`)) return;
    const res = await fetch(`${baseUrl}/${field.id}`, { method: "DELETE" });
    if (res.ok) {
      setFields((prev) => prev.filter((f) => f.id !== field.id));
    }
  }

  return (
    <div>
      <div className="divide-y divide-neutral-100">
        {fields.length === 0 && (
          <p className="py-6 text-center text-sm text-neutral-400">
            Nenhum campo definido ainda.
          </p>
        )}
        {fields
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((field) => (
            <div key={field.id} className="flex items-center gap-3 py-2.5 px-1">
              <GripVertical className="w-4 h-4 text-neutral-300 flex-shrink-0" />
              <span className="text-neutral-400 flex-shrink-0">
                {TYPE_ICONS[field.type] ?? <Type className="w-3.5 h-3.5" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900">{field.label}</p>
                <p className="text-xs text-neutral-400">
                  <code className="font-mono">{field.key}</code>
                  {" · "}
                  {FIELD_TYPES[field.type as FieldType]?.label ?? field.type}
                  {field.translatable && " · traduzível"}
                  {field.required && " · obrigatório"}
                </p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => openEdit(field)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteField(field)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
      </div>

      <button
        onClick={openNew}
        className="mt-3 w-full py-2 text-sm font-medium border-2 border-dashed border-neutral-200 rounded-xl text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        Adicionar campo
      </button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingField ? "Editar campo" : "Novo campo"}
      >
        <div className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">
              Nome do campo (label) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={draft.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="Ex: Título principal"
              className="w-full h-10 px-3 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <p className="text-xs text-neutral-400 mt-1">Aparece assim para o cliente no painel</p>
          </div>

          {/* Key */}
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">
              Chave interna (key) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={draft.key}
              onChange={(e) => {
                setKeyManuallyEdited(true);
                setDraft((d) => ({ ...d, key: e.target.value }));
              }}
              placeholder="title"
              disabled={!!editingField}
              className="w-full h-10 px-3 text-sm font-mono rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:bg-neutral-50 disabled:text-neutral-400"
            />
            <p className="text-xs text-neutral-400 mt-1">Usada no JSON da API e no código do site</p>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">
              Tipo do campo <span className="text-red-500">*</span>
            </label>
            <select
              value={draft.type}
              onChange={(e) => handleTypeChange(e.target.value as FieldType)}
              className="w-full h-10 px-3 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
            >
              {Object.entries(FIELD_TYPES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Translatable */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.translatable}
              onChange={(e) => setDraft((d) => ({ ...d, translatable: e.target.checked }))}
              className="mt-0.5 w-4 h-4 rounded border-neutral-300 accent-neutral-900"
            />
            <div>
              <p className="text-sm font-medium text-neutral-800">Campo traduzível (PT/EN/ES)</p>
              <p className="text-xs text-neutral-400">Permite preencher em múltiplos idiomas</p>
            </div>
          </label>

          {/* Help text */}
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">
              Texto de ajuda <span className="text-neutral-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={draft.helpText}
              onChange={(e) => setDraft((d) => ({ ...d, helpText: e.target.value }))}
              placeholder="Ex: Cole a URL completa da imagem"
              className="w-full h-10 px-3 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* Required */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.required}
              onChange={(e) => setDraft((d) => ({ ...d, required: e.target.checked }))}
              className="w-4 h-4 rounded border-neutral-300 accent-neutral-900"
            />
            <span className="text-sm font-medium text-neutral-800">Campo obrigatório</span>
          </label>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 text-sm font-medium text-neutral-800 border border-neutral-300 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 py-2.5 text-sm font-medium bg-neutral-950 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {saving ? "Salvando..." : editingField ? "Salvar" : "Adicionar campo"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
