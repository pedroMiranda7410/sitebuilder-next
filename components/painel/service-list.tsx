"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, GripVertical, Pencil, FileText } from "lucide-react";

interface ServiceItem {
  id: string;
  slug: string;
  position: number;
  visible: boolean;
  hasDetailPage: boolean;
  cardContent: Record<string, unknown>;
}

interface ServiceListProps {
  initialServices: ServiceItem[];
  tenantPrimaryColor: string;
}

function getTitle(cardContent: Record<string, unknown>): string {
  const title = cardContent.title;
  if (!title) return "(sem título)";
  if (typeof title === "string") return title;
  if (typeof title === "object" && title !== null) {
    const t = title as Record<string, string>;
    return t.pt ?? t.en ?? "(sem título)";
  }
  return "(sem título)";
}

function getTag(cardContent: Record<string, unknown>): string | null {
  const tag = cardContent.tag;
  if (!tag) return null;
  if (typeof tag === "string") return tag;
  if (typeof tag === "object" && tag !== null) {
    const t = tag as Record<string, string>;
    return t.pt ?? t.en ?? null;
  }
  return null;
}

function getImageUrl(cardContent: Record<string, unknown>): string | null {
  const url = cardContent.card_image_url;
  return typeof url === "string" ? url : null;
}

export function ServiceList({ initialServices, tenantPrimaryColor }: ServiceListProps) {
  const [services, setServices] = useState(initialServices);

  async function toggleVisible(id: string, current: boolean) {
    const res = await fetch(`/api/painel/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !current }),
    });
    if (res.ok) {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, visible: !current } : s))
      );
    }
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-400 text-sm bg-white rounded-2xl border border-neutral-200">
        Nenhum serviço cadastrado ainda.{" "}
        <Link href="/painel/servicos/novo" className="text-neutral-900 underline underline-offset-2">
          Criar primeiro serviço
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
      {services.map((service) => {
        const title = getTitle(service.cardContent);
        const tag = getTag(service.cardContent);
        const imageUrl = getImageUrl(service.cardContent);

        return (
          <div
            key={service.id}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50/60 transition-colors"
          >
            <GripVertical className="w-4 h-4 text-neutral-300 flex-shrink-0" />

            {/* Thumbnail */}
            <div
              className="w-10 h-10 rounded-lg flex-shrink-0 bg-neutral-100 overflow-hidden"
              style={imageUrl ? undefined : { backgroundColor: tenantPrimaryColor + "22" }}
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-lg font-bold"
                  style={{ color: tenantPrimaryColor }}
                >
                  {title.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">{title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {tag && (
                  <span className="text-xs text-neutral-400 truncate">{tag}</span>
                )}
                {service.hasDetailPage && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                    <FileText className="w-2.5 h-2.5" />
                    Página individual
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => toggleVisible(service.id, service.visible)}
                className={`p-1.5 rounded-lg transition-colors ${
                  service.visible
                    ? "text-emerald-500 hover:bg-emerald-50"
                    : "text-neutral-300 hover:bg-neutral-100"
                }`}
                title={service.visible ? "Ocultar" : "Exibir"}
              >
                {service.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <Link
                href={`/painel/servicos/${service.id}/edit`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-neutral-300 rounded-lg text-neutral-800 hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Editar
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
