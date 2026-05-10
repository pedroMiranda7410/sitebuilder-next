"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { TranslatableInput } from "@/components/ui/translatable-input";
import { TranslatableTextarea } from "@/components/ui/translatable-textarea";
import { t as tField } from "@/lib/i18n";
import type { TranslatableField } from "@/lib/i18n";

// ─── Types ───────────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SectionEditorProps {
  sectionId: string;
  sectionType: string;
  label: string;
  initialContent: Record<string, unknown>;
  tenantPrimaryColor: string;
  tenantSecondaryColor: string;
  tenantFont: string;
  tenantLanguages?: string[];
  saveEndpoint?: string;
}

// Shared props for all section sub-forms
interface FormProps {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
  languages: string[];
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-600">{label}</label>
      {children}
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full px-3 text-sm text-neutral-900 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400 transition"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  large = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  large?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2.5 text-neutral-900 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400 resize-y transition ${
        large ? "text-base" : "text-sm"
      }`}
    />
  );
}

function ImageUrlInput({
  value,
  onChange,
  label,
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  hint?: string;
}) {
  const isValidUrl = value?.startsWith("http");

  return (
    <Field label={label} hint={hint}>
      <TextInput value={value} onChange={onChange} placeholder="https://..." />
      {isValidUrl && (
        <div className="mt-1 rounded-xl overflow-hidden border border-neutral-100 bg-neutral-50 h-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
    </Field>
  );
}

// ─── Section-specific forms ───────────────────────────────────────────────────

function HeroForm({ content, onChange, languages }: FormProps) {
  const set = (key: string, val: TranslatableField | string) =>
    onChange({ ...content, [key]: val });

  return (
    <div className="space-y-5">
      <TranslatableTextarea
        label="Título principal"
        hint="Este é o texto em destaque no topo do seu site."
        value={(content.title as TranslatableField) ?? ""}
        onChange={(v) => set("title", v)}
        placeholder="Um Momento Para Você"
        languages={languages}
        rows={2}
      />
      <TranslatableInput
        label="Frase de apoio"
        hint="Uma frase curta abaixo do título."
        value={(content.subtitle as TranslatableField) ?? ""}
        onChange={(v) => set("subtitle", v)}
        placeholder="Encontre seu caminho de volta para si mesma"
        languages={languages}
      />
      <div>
        <p className="text-sm font-medium text-neutral-600 mb-1.5">Botão de chamada para ação</p>
        <div className="grid grid-cols-2 gap-3">
          <TranslatableInput
            label="Texto do botão"
            value={(content.cta_text as TranslatableField) ?? ""}
            onChange={(v) => set("cta_text", v)}
            placeholder="Conhecer Mais"
            languages={languages}
          />
          <Field label="Destino do botão" hint="Ex: #sobre ou uma URL">
            <TextInput
              value={(content.cta_url as string) ?? ""}
              onChange={(v) => set("cta_url", v)}
              placeholder="#sobre-breve"
            />
          </Field>
        </div>
      </div>
      <ImageUrlInput
        label="Imagem de fundo"
        hint="Cole o link de uma imagem (Unsplash, Google Drive, etc)"
        value={(content.background_image_url as string) ?? ""}
        onChange={(v) => set("background_image_url", v)}
      />
    </div>
  );
}

interface Card {
  title: TranslatableField;
  tag: TranslatableField;
  description: TranslatableField;
  image_url: string;
  cta: TranslatableField;
  cta_url?: string;
}

function CardsForm({ content, onChange, languages }: FormProps) {
  const cards: Card[] = (content.cards as Card[]) ?? [];
  const [editingIdx, setEditingIdx] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Card>({
    title: "",
    tag: "",
    description: "",
    image_url: "",
    cta: "",
    cta_url: "",
  });

  function openNew() {
    const empty = languages.length > 1
      ? Object.fromEntries(languages.map((l) => [l, ""])) as Record<string, string>
      : "";
    setDraft({ title: empty, tag: empty, description: empty, image_url: "", cta: empty, cta_url: "" });
    setEditingIdx("new");
  }

  function openEdit(idx: number) {
    setDraft({ ...cards[idx] });
    setEditingIdx(idx);
  }

  function saveCard() {
    const titleText = tField(draft.title, languages[0]);
    if (!titleText.trim()) return;
    let newCards: Card[];
    if (editingIdx === "new") {
      newCards = [...cards, draft];
    } else {
      newCards = cards.map((c, i) => (i === editingIdx ? draft : c));
    }
    onChange({ ...content, cards: newCards });
    setEditingIdx(null);
  }

  function removeCard(idx: number) {
    if (!confirm("Remover este serviço?")) return;
    onChange({ ...content, cards: cards.filter((_, i) => i !== idx) });
  }

  return (
    <div className="space-y-5">
      <TranslatableInput
        label="Título da seção de serviços"
        value={(content.title as TranslatableField) ?? ""}
        onChange={(v) => onChange({ ...content, title: v })}
        placeholder="O que ofereço"
        languages={languages}
      />

      <div>
        <p className="text-sm font-medium text-neutral-600 mb-3">
          Seus serviços ({cards.length})
        </p>
        <div className="space-y-2">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3"
            >
              {card.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.image_url}
                  alt={tField(card.title, languages[0])}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
              {!card.image_url && (
                <div className="w-10 h-10 rounded-lg bg-neutral-200 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{tField(card.title, languages[0])}</p>
                <p className="text-xs text-neutral-400 truncate">{tField(card.tag, languages[0])}</p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => openEdit(idx)}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-white transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => removeCard(idx)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>

        {editingIdx === null && (
          <button
            onClick={openNew}
            className="mt-3 w-full py-2.5 text-sm font-medium border-2 border-dashed border-neutral-200 rounded-xl text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors"
          >
            + Adicionar serviço
          </button>
        )}
      </div>

      {/* Card editor modal */}
      {editingIdx !== null && (
        <div className="rounded-2xl border-2 border-neutral-900 bg-white p-5 space-y-4">
          <p className="text-sm font-semibold text-neutral-900">
            {editingIdx === "new" ? "Novo serviço" : "Editar serviço"}
          </p>
          <TranslatableInput
            label="Nome do serviço *"
            value={draft.title}
            onChange={(v) => setDraft((d) => ({ ...d, title: v }))}
            placeholder="Ex: Sessão Individual"
            languages={languages}
          />
          <TranslatableInput
            label="Categoria / Tag"
            value={draft.tag}
            onChange={(v) => setDraft((d) => ({ ...d, tag: v }))}
            placeholder="Ex: Terapia Corporal"
            languages={languages}
          />
          <TranslatableTextarea
            label="Descrição"
            value={draft.description}
            onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
            placeholder="Descreva o que é este serviço..."
            languages={languages}
            rows={3}
          />
          <ImageUrlInput
            label="Foto do serviço"
            hint="Cole o link de uma imagem"
            value={draft.image_url}
            onChange={(v) => setDraft((d) => ({ ...d, image_url: v }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <TranslatableInput
              label="Texto do botão"
              value={draft.cta}
              onChange={(v) => setDraft((d) => ({ ...d, cta: v }))}
              placeholder="Agendar sessão"
              languages={languages}
            />
            <Field label="Link do botão">
              <TextInput
                value={draft.cta_url ?? ""}
                onChange={(v) => setDraft((d) => ({ ...d, cta_url: v }))}
                placeholder="#contato"
              />
            </Field>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setEditingIdx(null)}
              className="flex-1 py-2 text-sm font-medium text-neutral-800 border border-neutral-300 rounded-xl hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={saveCard}
              disabled={!tField(draft.title, languages[0]).trim()}
              className="flex-1 py-2 text-sm font-medium bg-neutral-950 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-40"
            >
              Salvar serviço
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AboutForm({ content, onChange, languages }: FormProps) {
  const set = (key: string, val: TranslatableField | string | string[]) =>
    onChange({ ...content, [key]: val });

  // paragraphs can be string[] or Record<string,string>[] for i18n
  const paragraphs = (content.paragraphs as TranslatableField[]) ?? ["", "", ""];

  function setParagraph(idx: number, val: TranslatableField) {
    const newP = [...paragraphs] as TranslatableField[];
    while (newP.length <= idx) newP.push("");
    newP[idx] = val;
    set("paragraphs", newP as unknown as string[]);
  }

  return (
    <div className="space-y-5">
      <ImageUrlInput
        label="Sua foto"
        hint="URL de uma foto sua (preferencialmente quadrada ou retrato)"
        value={(content.photo_url as string) ?? ""}
        onChange={(v) => set("photo_url", v)}
      />
      <TranslatableInput
        label="Título da seção"
        value={(content.title as TranslatableField) ?? ""}
        onChange={(v) => set("title", v)}
        placeholder="Sobre Mim"
        languages={languages}
      />
      <TranslatableInput
        label="Label acima do título"
        value={(content.label as TranslatableField) ?? ""}
        onChange={(v) => set("label", v)}
        placeholder="Minha história"
        languages={languages}
      />
      <TranslatableTextarea
        label="Primeiro parágrafo"
        value={paragraphs[0] ?? ""}
        onChange={(v) => setParagraph(0, v)}
        placeholder="Fale sobre sua trajetória..."
        languages={languages}
        rows={4}
      />
      <TranslatableTextarea
        label="Segundo parágrafo"
        value={paragraphs[1] ?? ""}
        onChange={(v) => setParagraph(1, v)}
        placeholder="Continue sua história..."
        languages={languages}
        rows={3}
      />
      <TranslatableTextarea
        label="Terceiro parágrafo"
        value={paragraphs[2] ?? ""}
        onChange={(v) => setParagraph(2, v)}
        placeholder="Conclusão ou convite..."
        languages={languages}
        rows={3}
      />
      <div className="grid grid-cols-2 gap-3">
        <TranslatableInput
          label="Texto do botão principal"
          value={(content.cta_primary as TranslatableField) ?? ""}
          onChange={(v) => set("cta_primary", v)}
          placeholder="Agendar conversa"
          languages={languages}
        />
        <Field label="Para onde leva">
          <TextInput
            value={(content.cta_primary_url as string) ?? ""}
            onChange={(v) => set("cta_primary_url", v)}
            placeholder="#contato"
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TranslatableInput
          label="Texto do link secundário"
          value={(content.cta_secondary as TranslatableField) ?? ""}
          onChange={(v) => set("cta_secondary", v)}
          placeholder="Ler no Medium"
          languages={languages}
        />
        <Field label="Para onde leva">
          <TextInput
            value={(content.cta_secondary_url as string) ?? ""}
            onChange={(v) => set("cta_secondary_url", v)}
            placeholder="https://medium.com/..."
          />
        </Field>
      </div>
    </div>
  );
}

function TextForm({ content, onChange, languages }: FormProps) {
  const set = (key: string, val: TranslatableField | string) =>
    onChange({ ...content, [key]: val });

  return (
    <div className="space-y-5">
      <TranslatableInput
        label="Título"
        value={(content.title as TranslatableField) ?? ""}
        onChange={(v) => set("title", v)}
        placeholder="Título desta seção"
        languages={languages}
      />
      <TranslatableInput
        label="Label acima do título"
        value={(content.label as TranslatableField) ?? ""}
        onChange={(v) => set("label", v)}
        placeholder="Ex: Bem-vinda"
        languages={languages}
      />
      <TranslatableTextarea
        label="Primeiro parágrafo"
        value={(content.body as TranslatableField) ?? ""}
        onChange={(v) => set("body", v)}
        placeholder="Escreva o texto desta seção..."
        languages={languages}
        rows={5}
      />
      <ImageUrlInput
        label="Foto lateral (opcional)"
        hint="Aparece ao lado do texto"
        value={(content.photo_url as string) ?? ""}
        onChange={(v) => set("photo_url", v)}
      />
      <div className="grid grid-cols-2 gap-3">
        <TranslatableInput
          label="Texto do link"
          value={(content.cta_text as TranslatableField) ?? ""}
          onChange={(v) => set("cta_text", v)}
          placeholder="Saiba mais"
          languages={languages}
        />
        <Field label="Para onde leva">
          <TextInput
            value={(content.cta_url as string) ?? ""}
            onChange={(v) => set("cta_url", v)}
            placeholder="#contato"
          />
        </Field>
      </div>
    </div>
  );
}

function CitacaoForm({ content, onChange, languages }: FormProps) {
  const set = (key: string, val: TranslatableField | string) =>
    onChange({ ...content, [key]: val });

  return (
    <div className="space-y-5">
      <TranslatableTextarea
        label="A frase"
        hint="Uma citação especial para inspirar os visitantes"
        value={(content.text as TranslatableField) ?? ""}
        onChange={(v) => set("text", v)}
        placeholder="O corpo não mente. Ele guarda, ele fala..."
        languages={languages}
        rows={4}
      />
      <TranslatableInput
        label="Autor"
        value={(content.author as TranslatableField) ?? ""}
        onChange={(v) => set("author", v)}
        placeholder="Seu nome"
        languages={languages}
      />
    </div>
  );
}

function FormSectionForm({ content, onChange, languages }: FormProps) {
  const set = (key: string, val: TranslatableField | string) =>
    onChange({ ...content, [key]: val });

  const getSocialLink = (label: string): string => {
    const links = (content.social_links as { url: string; label: string }[]) ?? [];
    return links.find((l) => l.label === label)?.url ?? "";
  };

  const setSocialLink = (label: string, url: string) => {
    const links = (content.social_links as { url: string; label: string }[]) ?? [];
    const existing = links.filter((l) => l.label !== label);
    const newLinks = url ? [...existing, { label, url }] : existing;
    onChange({ ...content, social_links: newLinks });
  };

  return (
    <div className="space-y-5">
      <TranslatableInput
        label="Título"
        value={(content.title as TranslatableField) ?? ""}
        onChange={(v) => set("title", v)}
        placeholder="Entre em Contato"
        languages={languages}
      />
      <TranslatableInput
        label="Label acima do título"
        value={(content.label as TranslatableField) ?? ""}
        onChange={(v) => set("label", v)}
        placeholder="Vamos conversar"
        languages={languages}
      />
      <TranslatableTextarea
        label="Mensagem de abertura"
        hint="Texto convidativo antes do formulário"
        value={(content.subtitle as TranslatableField) ?? ""}
        onChange={(v) => set("subtitle", v)}
        placeholder="Se você sentiu um chamado ao ler estas palavras..."
        languages={languages}
        rows={3}
      />
      <Field label="Seu email para receber as mensagens">
        <TextInput
          value={(content.email_destino as string) ?? ""}
          onChange={(v) => set("email_destino", v)}
          placeholder="seu@email.com"
        />
      </Field>
      <div className="space-y-3">
        <p className="text-sm font-medium text-neutral-600">Links das redes sociais</p>
        <Field label="Instagram">
          <TextInput
            value={getSocialLink("Instagram")}
            onChange={(v) => setSocialLink("Instagram", v)}
            placeholder="https://instagram.com/seu_perfil"
          />
        </Field>
        <Field label="WhatsApp">
          <TextInput
            value={getSocialLink("WhatsApp")}
            onChange={(v) => setSocialLink("WhatsApp", v)}
            placeholder="https://wa.me/55119..."
          />
        </Field>
        <Field label="Medium / Blog">
          <TextInput
            value={getSocialLink("Medium")}
            onChange={(v) => setSocialLink("Medium", v)}
            placeholder="https://medium.com/@seu_perfil"
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Live Preview ─────────────────────────────────────────────────────────────

function LivePreview({
  type,
  content,
  primaryColor,
  secondaryColor,
  font,
  lang,
}: {
  type: string;
  content: Record<string, unknown>;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  lang: string;
}) {
  const tv = (field: unknown) => tField(field as TranslatableField, lang);

  switch (type) {
    case "hero": {
      const bgUrl = content.background_image_url as string;
      return (
        <div
          className="rounded-2xl overflow-hidden h-64 flex flex-col justify-end p-6 relative"
          style={{
            backgroundColor: primaryColor,
            fontFamily: font,
            backgroundImage: bgUrl?.startsWith("http") ? `url(${bgUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {bgUrl?.startsWith("http") && (
            <div className="absolute inset-0 bg-black/40" />
          )}
          <div className="relative">
            <p className="text-2xl font-bold text-white leading-snug whitespace-pre-line">
              {tv(content.title) || "Título principal"}
            </p>
            <p className="text-sm text-white/80 mt-1">
              {tv(content.subtitle) || "Frase de apoio"}
            </p>
            {tv(content.cta_text) && (
              <div
                className="mt-3 inline-block px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: secondaryColor, color: primaryColor }}
              >
                {tv(content.cta_text)}
              </div>
            )}
          </div>
        </div>
      );
    }

    case "cards": {
      const cards = (content.cards as Card[]) ?? [];
      return (
        <div className="rounded-2xl bg-neutral-50 p-4" style={{ fontFamily: font }}>
          <p className="text-xs text-neutral-400 mb-1">{tv(content.title)}</p>
          <div className="grid grid-cols-2 gap-2">
            {cards.slice(0, 4).map((c, i) => (
              <div key={i} className="rounded-xl bg-white border border-neutral-200 overflow-hidden">
                {c.image_url?.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image_url}
                    alt={tv(c.title)}
                    className="w-full h-16 object-cover"
                    onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                  />
                ) : (
                  <div className="w-full h-16 bg-neutral-100" />
                )}
                <div className="p-2">
                  <p className="text-[10px] text-neutral-400">{tv(c.tag)}</p>
                  <p className="text-xs font-medium text-neutral-900">{tv(c.title)}</p>
                </div>
              </div>
            ))}
            {cards.length === 0 && (
              <div className="col-span-2 py-6 text-center text-xs text-neutral-300">
                Adicione serviços para ver o preview
              </div>
            )}
          </div>
        </div>
      );
    }

    case "about": {
      const paragraphs = (content.paragraphs as TranslatableField[]) ?? [];
      return (
        <div className="rounded-2xl bg-white border border-neutral-100 p-5 flex gap-4" style={{ fontFamily: font }}>
          {(content.photo_url as string)?.startsWith("http") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.photo_url as string}
              alt="Foto"
              className="w-20 h-28 object-cover rounded-xl flex-shrink-0"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          ) : (
            <div className="w-20 h-28 rounded-xl bg-neutral-100 flex-shrink-0 flex items-center justify-center">
              <span className="text-3xl text-neutral-300">👤</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-400 mb-0.5">{tv(content.label)}</p>
            <p className="text-sm font-bold text-neutral-900 mb-2">{tv(content.title) || "Sobre Mim"}</p>
            <p className="text-xs text-neutral-600 leading-relaxed line-clamp-5">
              {tv(paragraphs[0]) || "Seu texto aparece aqui..."}
            </p>
          </div>
        </div>
      );
    }

    case "quote":
    case "citacao":
      return (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: primaryColor, fontFamily: font }}
        >
          <p className="text-3xl text-white/30 mb-2">"</p>
          <p className="text-base text-white leading-relaxed italic">
            {tv(content.text) || "A frase aparece aqui..."}
          </p>
          {tv(content.author) && (
            <p className="text-sm text-white/60 mt-3">— {tv(content.author)}</p>
          )}
        </div>
      );

    case "text":
      return (
        <div className="rounded-2xl bg-white border border-neutral-100 p-5 flex gap-4" style={{ fontFamily: font }}>
          <div className="flex-1">
            <p className="text-xs text-neutral-400 mb-0.5">{tv(content.label)}</p>
            <p className="text-sm font-bold text-neutral-900 mb-2">{tv(content.title) || "Título"}</p>
            <p className="text-xs text-neutral-600 leading-relaxed line-clamp-6">
              {tv(content.body) || "Seu texto aparece aqui..."}
            </p>
          </div>
          {(content.photo_url as string)?.startsWith("http") && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.photo_url as string}
              alt="Foto"
              className="w-20 h-28 object-cover rounded-xl flex-shrink-0"
            />
          )}
        </div>
      );

    case "form":
      return (
        <div className="rounded-2xl bg-neutral-50 p-5" style={{ fontFamily: font }}>
          <p className="text-xs text-neutral-400 mb-0.5">{tv(content.label)}</p>
          <p className="text-sm font-bold text-neutral-900 mb-3">{tv(content.title) || "Entre em Contato"}</p>
          <div className="space-y-2">
            {["Nome", "Email", "Mensagem"].map((f) => (
              <div key={f} className="h-8 rounded-lg border border-neutral-200 bg-white px-3 flex items-center">
                <span className="text-xs text-neutral-300">{f}</span>
              </div>
            ))}
            <div
              className="h-9 rounded-lg flex items-center justify-center text-xs font-medium text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Enviar mensagem
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-5 flex items-center justify-center h-40">
          <p className="text-sm text-neutral-400">Preview não disponível</p>
        </div>
      );
  }
}

// ─── Main editor ──────────────────────────────────────────────────────────────

export function SectionEditor({
  sectionId,
  sectionType,
  label,
  initialContent,
  tenantPrimaryColor,
  tenantSecondaryColor,
  tenantFont,
  tenantLanguages = ["pt"],
  saveEndpoint,
}: SectionEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [previewContent, setPreviewContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const debouncedContent = useDebounce(content, 1500);
  const debouncedPreview = useDebounce(content, 500);
  const isFirstSave = useRef(true);

  // Update preview with 500ms debounce
  useEffect(() => {
    setPreviewContent(debouncedPreview);
  }, [debouncedPreview]);

  // Auto-save with 1500ms debounce
  useEffect(() => {
    if (isFirstSave.current) {
      isFirstSave.current = false;
      return;
    }
    async function save() {
      setSaveStatus("saving");
      try {
        const res = await fetch(saveEndpoint ?? `/api/painel/sections/${sectionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: debouncedContent }),
        });
        setSaveStatus(res.ok ? "saved" : "error");
      } catch {
        setSaveStatus("error");
      }
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
    save();
  }, [debouncedContent, sectionId]);

  const formProps: FormProps = { content, onChange: setContent, languages: tenantLanguages };

  function renderForm() {
    switch (sectionType) {
      case "hero":     return <HeroForm {...formProps} />;
      case "cards":    return <CardsForm {...formProps} />;
      case "about":    return <AboutForm {...formProps} />;
      case "text":     return <TextForm {...formProps} />;
      case "citacao":
      case "quote":    return <CitacaoForm {...formProps} />;
      case "form":     return <FormSectionForm {...formProps} />;
      default:
        return (
          <p className="text-sm text-neutral-400">
            Editor não configurado para este tipo de seção ({sectionType}).
          </p>
        );
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
      {/* Form — 60% */}
      <div className="xl:col-span-3">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-neutral-900">Conteúdo</h2>
            <div className="flex items-center gap-2 text-xs">
              {saveStatus === "saving" && (
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Salvando...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                  Salvo ✓
                </span>
              )}
              {saveStatus === "error" && (
                <span className="flex items-center gap-1.5 text-red-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Erro ao salvar
                </span>
              )}
              {saveStatus === "idle" && (
                <span className="text-neutral-300">Alterações salvas automaticamente</span>
              )}
            </div>
          </div>
          {renderForm()}
        </div>
      </div>

      {/* Preview — 40% */}
      <div className="xl:col-span-2">
        <div className="sticky top-8">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
            Preview ao vivo
          </p>
          <LivePreview
            type={sectionType}
            content={previewContent}
            primaryColor={tenantPrimaryColor}
            secondaryColor={tenantSecondaryColor}
            font={tenantFont}
            lang={tenantLanguages[0] ?? "pt"}
          />
          <p className="text-[10px] text-neutral-300 text-center mt-3">
            Atualiza automaticamente enquanto você edita
          </p>
        </div>
      </div>
    </div>
  );
}
