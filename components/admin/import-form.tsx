"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from "lucide-react";

const EXAMPLE = {
  tenant: {
    slug: "meu-site",
    name: "Meu Site",
    themePrimaryColor: "#1a1a1a",
    themeSecondaryColor: "#ffffff",
    themeFont: "Inter",
    domain: "meusite.com.br",
  },
  user: {
    name: "Cliente Nome",
    email: "cliente@email.com",
    password: "senha123",
  },
  sections: [
    {
      section_key: "hero",
      section_type: "hero",
      label: "Seção Principal",
      position: 1,
      visible: true,
      content: {
        title: "Título do site",
        subtitle: "Subtítulo do site",
        cta_text: "Saiba mais",
        cta_url: "#sobre",
      },
    },
  ],
  events: [
    {
      slug: "evento-1",
      title: "Meu Evento",
      description: "Descrição do evento",
      event_date: "2026-08-01T19:00:00.000Z",
      location: "São Paulo, SP",
      registration_open: true,
    },
  ],
  newsletter_subscribers: [{ email: "inscrito@email.com", name: "Inscrito" }],
};

export function ImportForm() {
  const router = useRouter();
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<{ tenantId: string; slug: string } | null>(null);
  const [showExample, setShowExample] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setSuccess(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      setErrors(["JSON inválido — verifique a sintaxe."]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors ?? [data.error ?? "Erro desconhecido"]);
      } else {
        setSuccess({ tenantId: data.tenantId, slug: data.slug });
        setJson("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      {errors.length > 0 && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm font-medium text-red-700">
              {errors.length} erro{errors.length !== 1 ? "s" : ""} encontrado
              {errors.length !== 1 ? "s" : ""}
            </p>
          </div>
          <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-700">
              Cliente importado com sucesso!
            </p>
          </div>
          <div className="mt-3 flex gap-2">
            <a
              href={`/admin/tenants/${success.tenantId}`}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors"
            >
              Ver cliente →
            </a>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            JSON de importação
          </label>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            rows={20}
            placeholder={'{\n  "tenant": { ... },\n  "sections": [ ... ]\n}'}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-950 text-green-400 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neutral-700 resize-y placeholder:text-neutral-600"
            spellCheck={false}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !json.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-950 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-40"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Importando...
            </>
          ) : (
            "Importar"
          )}
        </button>
      </form>

      {/* Collapsible example */}
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setShowExample((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Ver exemplo de JSON
          {showExample ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </button>
        {showExample && (
          <div className="border-t border-neutral-100 p-5">
            <pre className="text-xs font-mono text-neutral-600 bg-neutral-50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(EXAMPLE, null, 2)}
            </pre>
            <button
              type="button"
              onClick={() => setJson(JSON.stringify(EXAMPLE, null, 2))}
              className="mt-3 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              ↑ Usar como base
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
