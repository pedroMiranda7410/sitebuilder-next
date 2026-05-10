"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { GripVertical, Eye, EyeOff, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
  sectionKey: string;
  sectionType: string;
  position: number;
  visible: boolean;
  content: Record<string, unknown>;
}

function SectionVisualPreview({
  type,
  content,
  primaryColor,
}: {
  type: string;
  content: Record<string, unknown>;
  primaryColor: string;
}) {
  switch (type) {
    case "hero":
      return (
        <div
          className="w-full h-full flex flex-col justify-between p-3 rounded-lg"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex gap-1 mb-1">
            <div className="w-4 h-4 rounded bg-white/20 flex items-center justify-center">
              <svg viewBox="0 0 16 16" fill="white" className="w-2.5 h-2.5 opacity-60">
                <path d="M1 2.5A1.5 1.5 0 012.5 1h11A1.5 1.5 0 0115 2.5v6A1.5 1.5 0 0113.5 10H9l-1 2H6l-1-2H2.5A1.5 1.5 0 011 8.5v-6z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="h-2 bg-white/70 rounded mb-1 w-3/4" />
            <div className="h-1.5 bg-white/40 rounded w-1/2" />
            <div className="mt-2 h-5 w-16 rounded-md bg-white/20 flex items-center justify-center">
              <div className="h-1 w-10 bg-white/60 rounded" />
            </div>
          </div>
        </div>
      );

    case "cards":
      return (
        <div className="w-full h-full flex flex-col gap-1.5 p-1">
          <div className="h-1.5 bg-neutral-300 rounded w-1/2 mb-0.5" />
          <div className="flex gap-1.5 flex-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 rounded-md border border-neutral-200 bg-neutral-50 flex flex-col justify-end p-1">
                <div className="h-1 bg-neutral-300 rounded w-full mb-0.5" />
                <div className="h-0.5 bg-neutral-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      );

    case "text":
      return (
        <div className="w-full h-full p-2 flex gap-2">
          <div className="flex-1 flex flex-col justify-center gap-1">
            <div className="h-2 bg-neutral-300 rounded w-3/4" />
            <div className="h-1 bg-neutral-200 rounded w-full" />
            <div className="h-1 bg-neutral-200 rounded w-5/6" />
            <div className="h-1 bg-neutral-200 rounded w-full" />
          </div>
          <div className="w-10 h-full rounded bg-neutral-100 flex-shrink-0" />
        </div>
      );

    case "about":
      return (
        <div className="w-full h-full p-2 flex gap-2">
          <div className="w-10 h-full rounded-lg flex-shrink-0 overflow-hidden bg-neutral-200 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-neutral-400">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-1">
            <div className="h-2 bg-neutral-300 rounded w-2/3" />
            <div className="h-1 bg-neutral-200 rounded w-full" />
            <div className="h-1 bg-neutral-200 rounded w-5/6" />
            <div className="h-1 bg-neutral-200 rounded w-full" />
          </div>
        </div>
      );

    case "quote":
    case "citacao":
      return (
        <div className="w-full h-full flex items-center justify-center p-3">
          <div className="text-center">
            <div className="text-2xl text-neutral-300 mb-1">"</div>
            <div className="h-1 bg-neutral-200 rounded w-full mb-0.5" />
            <div className="h-1 bg-neutral-200 rounded w-3/4 mx-auto mb-1" />
            <div className="h-1 bg-neutral-300 rounded w-1/3 mx-auto" />
          </div>
        </div>
      );

    case "form":
      return (
        <div className="w-full h-full p-2 flex flex-col gap-1">
          <div className="h-1.5 bg-neutral-300 rounded w-1/2 mb-0.5" />
          <div className="h-5 border border-neutral-200 rounded bg-white" />
          <div className="h-5 border border-neutral-200 rounded bg-white" />
          <div className="h-8 border border-neutral-200 rounded bg-white" />
          <div className="h-5 rounded mt-auto" style={{ backgroundColor: "#e0e0e0" }} />
        </div>
      );

    default:
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-neutral-300 text-xs">{type}</div>
        </div>
      );
  }
}

interface SectionCardsProps {
  sections: Section[];
  tenantPrimaryColor: string;
}

export function SectionCards({ sections: initial, tenantPrimaryColor }: SectionCardsProps) {
  const [sections, setSections] = useState(initial);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function toggleVisible(id: string, visible: boolean) {
    setTogglingId(id);
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !visible } : s))
    );
    await fetch(`/api/painel/sections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !visible }),
    });
    setTogglingId(null);
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div
          key={section.id}
          className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-300 transition-colors"
        >
          <div className="flex items-stretch">
            {/* Drag handle */}
            <div className="flex items-center px-3 text-neutral-200 hover:text-neutral-400 cursor-grab border-r border-neutral-100">
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Visual preview */}
            <div className="w-28 h-20 flex-shrink-0 border-r border-neutral-100 bg-neutral-50 p-1.5">
              <SectionVisualPreview
                type={section.sectionType}
                content={section.content}
                primaryColor={tenantPrimaryColor}
              />
            </div>

            {/* Info */}
            <div className="flex-1 flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-semibold text-neutral-900 text-sm">{section.label}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {section.visible ? "Visível no site" : "Oculta do site"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Visibility toggle */}
                <button
                  onClick={() => toggleVisible(section.id, section.visible)}
                  disabled={togglingId === section.id}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors",
                    section.visible
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100"
                  )}
                  title={section.visible ? "Ocultar do site" : "Mostrar no site"}
                >
                  {section.visible ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                  {section.visible ? "Visível" : "Oculta"}
                </button>

                {/* Edit button */}
                <Link
                  href={`/painel/secoes/${section.id}/edit`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
