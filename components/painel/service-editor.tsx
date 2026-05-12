"use client";

import { useState, useCallback, useRef } from "react";
import { LayoutGrid, FileText, Eye, EyeOff, Plus, X } from "lucide-react";

interface ServiceEditorProps {
  serviceId: string;
  slug: string;
  initialVisible: boolean;
  initialHasDetailPage: boolean;
  initialCardContent: Record<string, unknown>;
  initialDetailContent: Record<string, unknown>;
  tenantLanguages: string[];
}

type LangMap = Record<string, string>;

function getLang(value: unknown, lang: string): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    return (value as Record<string, string>)[lang] ?? "";
  }
  return "";
}

function putLang(current: unknown, lang: string, newValue: string): LangMap {
  const base: LangMap =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...(current as LangMap) }
      : {};
  base[lang] = newValue;
  return base;
}

function getStrArr(value: unknown, lang: string): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "object" && value !== null) {
    const arr = (value as Record<string, unknown>)[lang];
    return Array.isArray(arr) ? (arr as string[]) : [];
  }
  return [];
}

function setStrArr(current: unknown, lang: string, arr: string[]): Record<string, string[]> {
  const base: Record<string, string[]> =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...(current as Record<string, string[]>) }
      : {};
  base[lang] = arr;
  return base;
}

const LANG_LABELS: Record<string, string> = {
  pt: "PT",
  en: "EN",
  es: "ES",
  fr: "FR",
  de: "DE",
  it: "IT",
};

export function ServiceEditor({
  serviceId,
  slug,
  initialVisible,
  initialHasDetailPage,
  initialCardContent,
  initialDetailContent,
  tenantLanguages,
}: ServiceEditorProps) {
  const langs = tenantLanguages.length > 0 ? tenantLanguages : ["pt"];
  const [lang, setLang] = useState(langs[0]);
  const [activeTab, setActiveTab] = useState<"card" | "detail">("card");
  const [visible, setVisible] = useState(initialVisible);
  const [hasDetailPage, setHasDetailPage] = useState(initialHasDetailPage);
  const [cardContent, setCardContent] = useState(initialCardContent);
  const [detailContent, setDetailContent] = useState(initialDetailContent);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (
      patch: Partial<{
        visible: boolean;
        hasDetailPage: boolean;
        cardContent: Record<string, unknown>;
        detailContent: Record<string, unknown>;
      }>
    ) => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/painel/services/${serviceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        setSaveStatus(res.ok ? "saved" : "error");
      } catch {
        setSaveStatus("error");
      }
    },
    [serviceId]
  );

  function scheduleSave(patch: Parameters<typeof save>[0]) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(patch), 1500);
  }

  function updateCard(key: string, value: unknown) {
    const next = { ...cardContent, [key]: value };
    setCardContent(next);
    scheduleSave({ cardContent: next });
  }

  function updateDetail(key: string, value: unknown) {
    const next = { ...detailContent, [key]: value };
    setDetailContent(next);
    scheduleSave({ detailContent: next });
  }

  function updateCardLang(key: string, value: string) {
    updateCard(key, putLang(cardContent[key], lang, value));
  }

  function updateDetailLang(key: string, value: string) {
    updateDetail(key, putLang(detailContent[key], lang, value));
  }

  async function toggleVisible() {
    const next = !visible;
    setVisible(next);
    await save({ visible: next });
  }

  async function toggleHasDetailPage() {
    const next = !hasDetailPage;
    setHasDetailPage(next);
    if (next && activeTab === "card") setActiveTab("detail");
    await save({ hasDetailPage: next });
  }

  // Benefits helpers
  function getBenefits(): string[] {
    return getStrArr(detailContent.benefits, lang);
  }

  function setBenefits(arr: string[]) {
    updateDetail("benefits", setStrArr(detailContent.benefits, lang, arr));
  }

  // Gallery helpers
  function getGallery(): string[] {
    const g = detailContent.gallery;
    return Array.isArray(g) ? (g as string[]) : [];
  }

  function setGallery(arr: string[]) {
    updateDetail("gallery", arr);
  }

  return (
    <div className="space-y-6">
      {/* Top controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={toggleVisible}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl border transition-colors ${
            visible
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {visible ? "Visível" : "Oculto"}
        </button>

        <label className="inline-flex items-center gap-2.5 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={hasDetailPage}
              onChange={toggleHasDetailPage}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-neutral-200 rounded-full peer-checked:bg-neutral-900 transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </div>
          <span className="text-sm font-medium text-neutral-700">Tem página individual</span>
        </label>

        <div className="ml-auto text-xs text-neutral-400">
          {saveStatus === "saving" && "Salvando..."}
          {saveStatus === "saved" && "Salvo"}
          {saveStatus === "error" && (
            <span className="text-red-500">Erro ao salvar</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("card")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "card"
              ? "border-neutral-900 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Card (listagem)
        </button>
        <button
          onClick={() => hasDetailPage && setActiveTab("detail")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "detail"
              ? "border-neutral-900 text-neutral-900"
              : hasDetailPage
              ? "border-transparent text-neutral-500 hover:text-neutral-700"
              : "border-transparent text-neutral-300 cursor-not-allowed"
          }`}
          title={!hasDetailPage ? 'Ative "Tem página individual" para editar' : undefined}
        >
          <FileText className="w-4 h-4" />
          Página de detalhe
          {!hasDetailPage && (
            <span className="text-[10px] font-normal text-neutral-400">(desativado)</span>
          )}
        </button>
      </div>

      {/* Language selector */}
      {langs.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-medium">Idioma:</span>
          <div className="flex gap-1">
            {langs.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                  lang === l
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white text-neutral-500 border-neutral-300 hover:border-neutral-400 hover:text-neutral-700"
                }`}
              >
                {LANG_LABELS[l] ?? l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Card Tab */}
      {activeTab === "card" && (
        <div className="space-y-5 max-w-2xl">
          <div className="bg-white rounded-xl border border-neutral-200 px-5 py-5 space-y-5">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Card na listagem
            </p>

            <Field label="Nome do serviço" required>
              <input
                type="text"
                value={getLang(cardContent.title, lang)}
                onChange={(e) => updateCardLang("title", e.target.value)}
                placeholder="Ex: Mentoria"
                className={inputCls}
              />
            </Field>

            <Field label="Categoria / Tag">
              <input
                type="text"
                value={getLang(cardContent.tag, lang)}
                onChange={(e) => updateCardLang("tag", e.target.value)}
                placeholder="Ex: Desenvolvimento Humano"
                className={inputCls}
              />
            </Field>

            <Field label="Resumo (aparece no card)">
              <textarea
                value={getLang(cardContent.summary, lang)}
                onChange={(e) => updateCardLang("summary", e.target.value)}
                placeholder="Texto curto que aparece abaixo do título na listagem"
                rows={3}
                className={inputCls}
              />
            </Field>

            <Field label="Foto do card">
              <input
                type="url"
                value={typeof cardContent.card_image_url === "string" ? cardContent.card_image_url : ""}
                onChange={(e) => updateCard("card_image_url", e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
              <ImagePreview url={typeof cardContent.card_image_url === "string" ? cardContent.card_image_url : ""} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Link do botão">
                <input
                  type="text"
                  value={typeof cardContent.link_url === "string" ? cardContent.link_url : ""}
                  onChange={(e) => updateCard("link_url", e.target.value)}
                  placeholder={`service-detail.html?service=${slug}`}
                  className={inputCls}
                />
              </Field>
              <Field label="Texto do botão">
                <input
                  type="text"
                  value={getLang(cardContent.link_text, lang)}
                  onChange={(e) => updateCardLang("link_text", e.target.value)}
                  placeholder="Saiba mais"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* Detail Tab */}
      {activeTab === "detail" && hasDetailPage && (
        <div className="space-y-5 max-w-2xl">
          {/* Hero */}
          <Section title="Hero da página">
            <Field label="Foto de capa (hero)">
              <input
                type="url"
                value={typeof detailContent.hero_image_url === "string" ? detailContent.hero_image_url : ""}
                onChange={(e) => updateDetail("hero_image_url", e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
              <ImagePreview url={typeof detailContent.hero_image_url === "string" ? detailContent.hero_image_url : ""} />
            </Field>

            <Field label="Subtítulo (abaixo do título no hero)">
              <input
                type="text"
                value={getLang(detailContent.subtitle, lang)}
                onChange={(e) => updateDetailLang("subtitle", e.target.value)}
                placeholder="Uma jornada de clareza e transformação"
                className={inputCls}
              />
            </Field>
          </Section>

          {/* Sobre */}
          <Section title="Sobre este trabalho">
            <Field label="Descrição completa">
              <textarea
                value={getLang(detailContent.description, lang)}
                onChange={(e) => updateDetailLang("description", e.target.value)}
                placeholder="Texto longo descrevendo o serviço..."
                rows={5}
                className={inputCls}
              />
            </Field>
          </Section>

          {/* Benefícios */}
          <Section title="Benefícios">
            <Field label="Lista de benefícios">
              <BenefitsList
                items={getBenefits()}
                onChange={setBenefits}
              />
            </Field>
          </Section>

          {/* Para quem é */}
          <Section title="Para quem é">
            <Field label='Texto "Para quem é este serviço?"'>
              <textarea
                value={getLang(detailContent.for_whom, lang)}
                onChange={(e) => updateDetailLang("for_whom", e.target.value)}
                placeholder="Para pessoas que buscam..."
                rows={3}
                className={inputCls}
              />
            </Field>
            <Field label='Foto da seção "Para quem é"'>
              <input
                type="url"
                value={typeof detailContent.for_whom_image === "string" ? detailContent.for_whom_image : ""}
                onChange={(e) => updateDetail("for_whom_image", e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
              <ImagePreview url={typeof detailContent.for_whom_image === "string" ? detailContent.for_whom_image : ""} />
            </Field>
          </Section>

          {/* Galeria */}
          <Section title="Galeria (opcional)">
            <GalleryEditor
              items={getGallery()}
              onChange={setGallery}
            />
          </Section>

          {/* CTA */}
          <Section title="CTA final">
            <Field label="Título do CTA">
              <input
                type="text"
                value={getLang(detailContent.cta_title, lang)}
                onChange={(e) => updateDetailLang("cta_title", e.target.value)}
                placeholder="Pronto para começar?"
                className={inputCls}
              />
            </Field>
            <Field label="Descrição do CTA">
              <textarea
                value={getLang(detailContent.cta_description, lang)}
                onChange={(e) => updateDetailLang("cta_description", e.target.value)}
                placeholder="Vamos conversar sobre o que faz sentido para você"
                rows={2}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Texto do botão">
                <input
                  type="text"
                  value={getLang(detailContent.cta_text, lang)}
                  onChange={(e) => updateDetailLang("cta_text", e.target.value)}
                  placeholder="Agendar conversa"
                  className={inputCls}
                />
              </Field>
              <Field label="Link do botão">
                <input
                  type="text"
                  value={typeof detailContent.cta_url === "string" ? detailContent.cta_url : ""}
                  onChange={(e) => updateDetail("cta_url", e.target.value)}
                  placeholder="index.html#contact"
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 px-5 py-5 space-y-5">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}

function ImagePreview({ url }: { url: string }) {
  if (!url || !url.startsWith("http")) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="preview"
      className="mt-2 h-24 w-auto rounded-lg border border-neutral-200 object-cover"
      onError={(e) => (e.currentTarget.style.display = "none")}
    />
  );
}

function BenefitsList({
  items,
  onChange,
}: {
  items: string[];
  onChange: (arr: string[]) => void;
}) {
  function update(idx: number, value: string) {
    const next = [...items];
    next[idx] = value;
    onChange(next);
  }

  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  function add() {
    onChange([...items, ""]);
  }

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-neutral-400 text-sm">•</span>
          <input
            type="text"
            value={item}
            onChange={(e) => update(idx, e.target.value)}
            placeholder="Descreva o benefício..."
            className={inputCls + " flex-1"}
          />
          <button
            type="button"
            onClick={() => remove(idx)}
            className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mt-1"
      >
        <Plus className="w-4 h-4" />
        Adicionar benefício
      </button>
    </div>
  );
}

function GalleryEditor({
  items,
  onChange,
}: {
  items: string[];
  onChange: (arr: string[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  function confirmAdd() {
    if (newUrl.trim()) {
      onChange([...items, newUrl.trim()]);
    }
    setNewUrl("");
    setAdding(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {items.map((url, idx) => (
          <div key={idx} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="w-20 h-20 object-cover rounded-lg border border-neutral-200"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <button
              onClick={() => remove(idx)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {adding ? (
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              autoFocus
              className="w-56 px-3 py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmAdd();
                if (e.key === "Escape") { setAdding(false); setNewUrl(""); }
              }}
            />
            <button onClick={confirmAdd} className="text-sm text-neutral-900 font-medium hover:underline">
              OK
            </button>
            <button onClick={() => { setAdding(false); setNewUrl(""); }} className="text-sm text-neutral-400 hover:text-neutral-700">
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-1 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px] text-center leading-tight">Adicionar foto</span>
          </button>
        )}
      </div>
    </div>
  );
}
