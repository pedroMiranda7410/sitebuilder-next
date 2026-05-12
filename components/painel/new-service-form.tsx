"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewServiceForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function toSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/painel/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, position: 0, visible: true }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? data.errors?.[0] ?? "Erro ao criar serviço");
      return;
    }

    const service = await res.json();
    router.push(`/painel/servicos/${service.id}/edit`);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-5">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Slug do serviço <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(toSlug(e.target.value))}
          placeholder="ex: mentoria"
          className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
          required
        />
        <p className="text-xs text-neutral-400 mt-1.5">
          Apenas letras minúsculas, números e hífens. Ex: <code>mentoria</code>, <code>coaching-executivo</code>
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !slug}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Criando..." : "Criar serviço"}
      </button>
    </form>
  );
}
