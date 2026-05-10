"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const FONTS = [
  "Inter",
  "Playfair Display",
  "Cormorant Garamond",
  "Poppins",
  "Montserrat",
];

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#!";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function NewTenantForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [domain, setDomain] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const [font, setFont] = useState("Inter");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setSlug(slugify(name));
  }, [name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const tenantRes = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          domain: domain || null,
          themePrimaryColor: primaryColor,
          themeSecondaryColor: secondaryColor,
          themeFont: font,
        }),
      });

      const tenantData = await tenantRes.json();

      if (!tenantRes.ok) {
        setErrors(tenantData.errors ?? [tenantData.error ?? "Erro ao criar cliente"]);
        return;
      }

      if (email && password) {
        const importRes = await fetch("/api/admin/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenant: {
              slug: tenantData.slug,
              name: tenantData.name,
              themePrimaryColor: primaryColor,
              themeSecondaryColor: secondaryColor,
              themeFont: font,
              domain: domain || null,
            },
            user: { email, password, name },
            sections: [],
          }),
        });

        if (!importRes.ok) {
          const d = await importRes.json();
          setErrors(d.errors ?? [d.error ?? "Erro ao criar usuário"]);
          return;
        }
      }

      router.push(`/admin/tenants/${tenantData.id}`);
    } finally {
      setLoading(false);
    }
  }

  const previewStyle: React.CSSProperties = {
    fontFamily: font,
    backgroundColor: primaryColor,
    color: secondaryColor,
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700 mb-1">Corrija os erros abaixo:</p>
          <ul className="text-sm text-red-600 space-y-0.5 list-disc list-inside">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left + center cols: form */}
        <div className="col-span-2 space-y-6">
          {/* Dados do cliente */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-700 mb-4">Dados do cliente</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: Andreia Silva"
                  className="w-full h-9 px-3 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-neutral-400 border border-r-0 border-neutral-200 rounded-l-lg bg-neutral-50">
                    /
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    required
                    placeholder="andreia-silva"
                    className="flex-1 h-9 px-3 text-sm rounded-r-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-1">Usado na URL da API</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Domínio <span className="text-neutral-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="andreia.com.br"
                  className="w-full h-9 px-3 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>
          </div>

          {/* Identidade visual */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-700 mb-4">Identidade visual</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Cor primária
                  </label>
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
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Cor secundária
                  </label>
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
                  className="w-full h-9 px-3 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                  style={{ fontFamily: font }}
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Acesso */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-700 mb-1">Acesso do cliente</h2>
            <p className="text-xs text-neutral-400 mb-4">
              Opcional — cria um login para o cliente acessar o painel.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Email de login
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full h-9 px-3 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Senha temporária
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="flex-1 h-9 px-3 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setPassword(generatePassword())}
                    className="inline-flex items-center gap-1.5 px-3 h-9 text-sm border border-neutral-300 rounded-lg text-neutral-800 hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Gerar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <a
              href="/admin/tenants"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-800 border border-neutral-300 rounded-lg hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
            >
              Cancelar
            </a>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-950 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Criando...
                </>
              ) : (
                "Criar cliente"
              )}
            </button>
          </div>
        </div>

        {/* Right col: live preview */}
        <div className="col-span-1">
          <div className="sticky top-8">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
              Preview ao vivo
            </p>
            <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
              {/* Mock header */}
              <div className="px-5 py-4" style={previewStyle}>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-base font-semibold" style={{ fontFamily: font }}>
                    {name || "Nome do site"}
                  </span>
                  <div className="flex gap-3 text-xs opacity-70">
                    <span>Início</span>
                    <span>Sobre</span>
                    <span>Contato</span>
                  </div>
                </div>
                <div>
                  <p
                    className="text-2xl font-bold leading-snug mb-2"
                    style={{ fontFamily: font, color: secondaryColor }}
                  >
                    Bem-vinda
                  </p>
                  <p className="text-sm opacity-70" style={{ color: secondaryColor }}>
                    Subtítulo do site aparece aqui
                  </p>
                  <div
                    className="mt-4 inline-block px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: secondaryColor, color: primaryColor, fontFamily: font }}
                  >
                    Saiba mais
                  </div>
                </div>
              </div>
              {/* Mock body */}
              <div className="bg-white px-5 py-4">
                <div className="space-y-2">
                  <div className="h-2.5 bg-neutral-100 rounded-full w-3/4" />
                  <div className="h-2.5 bg-neutral-100 rounded-full w-full" />
                  <div className="h-2.5 bg-neutral-100 rounded-full w-5/6" />
                </div>
              </div>
              <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between">
                <div className="flex gap-2">
                  {[primaryColor, secondaryColor].map((c, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border border-black/10"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span className="text-xs text-neutral-400" style={{ fontFamily: font }}>
                  {font}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
