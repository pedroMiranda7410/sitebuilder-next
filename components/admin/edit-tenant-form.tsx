"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FONTS = [
  "Inter",
  "Playfair Display",
  "Cormorant Garamond",
  "Poppins",
  "Montserrat",
];

interface EditTenantFormProps {
  tenantId: string;
  initialName: string;
  initialSlug: string;
  initialDomain: string | null;
  initialPrimaryColor: string;
  initialSecondaryColor: string;
  initialFont: string;
  initialLogoUrl: string | null;
  initialActive: boolean;
}

export function EditTenantForm({
  tenantId,
  initialName,
  initialSlug,
  initialDomain,
  initialPrimaryColor,
  initialSecondaryColor,
  initialFont,
  initialLogoUrl,
  initialActive,
}: EditTenantFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState(initialName);
  const [domain, setDomain] = useState(initialDomain ?? "");
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor);
  const [font, setFont] = useState(initialFont);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl ?? "");
  const [active, setActive] = useState(initialActive);

  const previewStyle: React.CSSProperties = {
    fontFamily: font,
    backgroundColor: primaryColor,
    color: secondaryColor,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setSuccess(false);

    const res = await fetch(`/api/admin/tenants/${tenantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        domain: domain || null,
        themePrimaryColor: primaryColor,
        themeSecondaryColor: secondaryColor,
        themeFont: font,
        logoUrl: logoUrl || null,
        active,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErrors(data.errors ?? [data.error ?? "Erro ao salvar"]);
    } else {
      setSuccess(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <ul className="text-sm text-red-600 space-y-0.5 list-disc list-inside">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Alterações salvas com sucesso.
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Form cols */}
        <div className="col-span-2 space-y-5">
          {/* Dados */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-700 mb-4">Dados do cliente</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-9 px-3 text-sm text-neutral-900 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Slug</label>
                <div className="flex items-center h-9 px-3 text-sm rounded-lg border border-neutral-100 bg-neutral-50 text-neutral-500">
                  <span className="text-neutral-400 mr-1">/</span>
                  <span>{initialSlug}</span>
                  <span className="ml-2 text-xs text-neutral-400">(não editável)</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Domínio</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="exemplo.com.br"
                  className="w-full h-9 px-3 text-sm text-neutral-900 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Logo (URL)</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-9 px-3 text-sm text-neutral-900 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-sm font-medium text-neutral-700">Status ativo</p>
                  <p className="text-xs text-neutral-400">Cliente consegue acessar o painel</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActive((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    active ? "bg-emerald-500" : "bg-neutral-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Identidade visual */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-700 mb-4">Identidade visual</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Cor primária</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-neutral-200 cursor-pointer p-0.5"
                    />
                    <code className="text-sm text-neutral-600">{primaryColor}</code>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Cor secundária</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-neutral-200 cursor-pointer p-0.5"
                    />
                    <code className="text-sm text-neutral-600">{secondaryColor}</code>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Fonte</label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  className="w-full h-9 px-3 text-sm text-neutral-900 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                  style={{ fontFamily: font }}
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <a
              href={`/admin/tenants/${tenantId}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-800 border border-neutral-300 rounded-lg hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
            >
              Cancelar
            </a>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-950 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="col-span-1">
          <div className="sticky top-8">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">Preview ao vivo</p>
            <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
              <div className="px-5 py-5" style={previewStyle}>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-semibold" style={{ fontFamily: font }}>{name}</span>
                  <div className="flex gap-2 text-xs opacity-60">
                    <span>Início</span>
                    <span>Sobre</span>
                  </div>
                </div>
                <p className="text-xl font-bold leading-snug" style={{ fontFamily: font, color: secondaryColor }}>
                  Bem-vinda
                </p>
                <p className="text-xs opacity-60 mt-1" style={{ color: secondaryColor }}>
                  Subtítulo do site
                </p>
                <div
                  className="mt-3 inline-block px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: secondaryColor, color: primaryColor, fontFamily: font }}
                >
                  Saiba mais
                </div>
              </div>
              <div className="bg-white px-4 py-3 border-t border-neutral-100 flex items-center gap-2">
                {[primaryColor, secondaryColor].map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                ))}
                <span className="text-xs text-neutral-400 ml-1" style={{ fontFamily: font }}>{font}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
