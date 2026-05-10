"use client";

import { useState } from "react";
import { Check, Loader2, Eye, EyeOff } from "lucide-react";

const FONTS = [
  "Inter",
  "Playfair Display",
  "Cormorant Garamond",
  "Poppins",
  "Montserrat",
];

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ConfiguracoesClientProps {
  tenantId: string;
  initialPrimaryColor: string;
  initialSecondaryColor: string;
  initialFont: string;
  initialDomain: string | null;
  tenantName: string;
  tenantSlug: string;
  userEmail: string;
  userId: string;
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <span
      className={`flex items-center gap-1.5 text-xs ${
        status === "saving"
          ? "text-neutral-400"
          : status === "saved"
          ? "text-emerald-600"
          : "text-red-500"
      }`}
    >
      {status === "saving" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {status === "saved" && <Check className="w-3.5 h-3.5" />}
      {status === "saving" ? "Salvando..." : status === "saved" ? "Salvo" : "Erro ao salvar"}
    </span>
  );
}

export function ConfiguracoesClient({
  tenantId,
  initialPrimaryColor,
  initialSecondaryColor,
  initialFont,
  initialDomain,
  tenantName,
  tenantSlug,
  userEmail,
  userId,
}: ConfiguracoesClientProps) {
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor);
  const [font, setFont] = useState(initialFont);
  const [domain, setDomain] = useState(initialDomain ?? "");
  const [themeStatus, setThemeStatus] = useState<SaveStatus>("idle");

  const [email, setEmail] = useState(userEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accessStatus, setAccessStatus] = useState<SaveStatus>("idle");
  const [accessError, setAccessError] = useState("");

  async function saveTheme() {
    setThemeStatus("saving");
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themePrimaryColor: primaryColor,
          themeSecondaryColor: secondaryColor,
          themeFont: font,
          domain: domain || null,
        }),
      });
      setThemeStatus(res.ok ? "saved" : "error");
    } catch {
      setThemeStatus("error");
    }
    setTimeout(() => setThemeStatus("idle"), 3000);
  }

  async function saveAccess(e: React.FormEvent) {
    e.preventDefault();
    setAccessStatus("saving");
    setAccessError("");

    try {
      const res = await fetch("/api/painel/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email !== userEmail ? email : undefined,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAccessError(data.error ?? "Erro ao salvar");
        setAccessStatus("error");
      } else {
        setAccessStatus("saved");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch {
      setAccessStatus("error");
      setAccessError("Erro de conexão");
    }
    setTimeout(() => setAccessStatus("idle"), 3000);
  }

  // Live preview style
  const previewStyle: React.CSSProperties = {
    fontFamily: font,
    backgroundColor: primaryColor,
    color: secondaryColor,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Configurações do site</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Personalize a aparência e as configurações do seu site.
        </p>
      </div>

      <div className="space-y-5">
        {/* Identidade visual */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Identidade visual</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Cores e fonte que aparecem em todo o seu site
              </p>
            </div>
            <SaveIndicator status={themeStatus} />
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2">
                    Cor principal
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-neutral-200 cursor-pointer p-0.5"
                    />
                    <code className="text-sm text-neutral-600">{primaryColor}</code>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2">
                    Cor de destaque
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-neutral-200 cursor-pointer p-0.5"
                    />
                    <code className="text-sm text-neutral-600">{secondaryColor}</code>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">Fonte</label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                  style={{ fontFamily: font }}
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={saveTheme}
                disabled={themeStatus === "saving"}
                className="w-full py-2.5 text-sm font-medium bg-neutral-950 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {themeStatus === "saving" ? "Salvando..." : "Salvar aparência"}
              </button>
            </div>

            {/* Live preview */}
            <div>
              <p className="text-xs text-neutral-400 mb-2">Preview ao vivo</p>
              <div className="rounded-xl overflow-hidden border border-neutral-100 shadow-sm">
                <div className="px-4 py-5" style={previewStyle}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-sm" style={{ fontFamily: font }}>
                      {tenantName}
                    </span>
                    <div className="flex gap-2 text-xs opacity-60">
                      <span>Início</span>
                      <span>Sobre</span>
                    </div>
                  </div>
                  <p
                    className="text-lg font-bold leading-snug"
                    style={{ fontFamily: font, color: secondaryColor }}
                  >
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
                <div className="bg-white px-4 py-3 flex items-center gap-2">
                  <div
                    className="text-xs font-medium px-2 py-1 rounded"
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Domínio */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900">Domínio</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Configure um domínio personalizado para o seu site
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1.5">
                Seu domínio
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="meusite.com.br"
                className="w-full h-10 px-3 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-300 max-w-sm"
              />
            </div>
            <div className="bg-neutral-50 rounded-xl px-4 py-3 text-xs text-neutral-600 space-y-1.5">
              <p className="font-medium text-neutral-800">Como apontar seu domínio para o Netlify:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Acesse o painel do seu registro de domínio (ex: Registro.br, GoDaddy)</li>
                <li>Encontre as configurações de DNS</li>
                <li>
                  Adicione um registro CNAME apontando para:{" "}
                  <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-200">
                    seu-site.netlify.app
                  </code>
                </li>
                <li>Aguarde até 48h para a propagação</li>
              </ol>
            </div>
            <button
              onClick={saveTheme}
              disabled={themeStatus === "saving"}
              className="px-4 py-2 text-sm font-medium bg-neutral-950 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              Salvar domínio
            </button>
          </div>
        </div>

        {/* Acesso */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Acesso</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Altere seu email ou senha de login</p>
            </div>
            <SaveIndicator status={accessStatus} />
          </div>
          <form onSubmit={saveAccess} className="p-6 space-y-4 max-w-sm">
            {accessError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{accessError}</p>
            )}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1.5">
                Senha atual
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full h-10 px-3 pr-10 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1.5">
                Nova senha{" "}
                <span className="text-neutral-400 font-normal">(deixe vazio para não alterar)</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full h-10 px-3 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-300"
              />
            </div>
            <button
              type="submit"
              disabled={accessStatus === "saving"}
              className="w-full py-2.5 text-sm font-medium bg-neutral-950 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {accessStatus === "saving" ? "Salvando..." : "Salvar acesso"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
