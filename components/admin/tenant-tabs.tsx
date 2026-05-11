"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Calendar, Eye, EyeOff, GripVertical, Mail, User, Pencil, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SectionFieldsManager } from "@/components/admin/section-fields-manager";

interface SectionField {
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

interface Section {
  id: string;
  label: string;
  sectionKey: string;
  sectionType: string;
  position: number;
  visible: boolean;
  fields: SectionField[];
}

interface SiteEvent {
  id: string;
  title: string;
  slug: string;
  eventDate: string | null;
  registrationOpen: boolean;
  _count: { signups: number };
}

interface TenantUser {
  id: string;
  name: string | null;
  email: string;
}

interface TenantTabsProps {
  sections: Section[];
  events: SiteEvent[];
  users: TenantUser[];
  tenantId: string;
}

function SectionRow({ section }: { section: Section }) {
  const [expanded, setExpanded] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"fields" | "content">("fields");

  return (
    <div className="border-b border-neutral-100 last:border-0">
      {/* Row header */}
      <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50/60 transition-colors">
        <GripVertical className="w-4 h-4 text-neutral-300 flex-shrink-0" />
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          {expanded
            ? <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            : <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          }
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900">{section.label}</p>
            <p className="text-xs text-neutral-400">
              {section.sectionKey} · {section.sectionType} · {section.fields.length} campo{section.fields.length !== 1 ? "s" : ""}
            </p>
          </div>
        </button>
        <span className="text-xs text-neutral-400 tabular-nums">#{section.position}</span>
        <div className={`flex-shrink-0 ${section.visible ? "text-emerald-500" : "text-neutral-300"}`}>
          {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </div>
        <Link
          href={`/admin/secoes/${section.id}/edit`}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-neutral-300 rounded-lg text-neutral-800 hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
        >
          <Pencil className="w-3 h-3" />
          Editar
        </Link>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="bg-neutral-50 border-t border-neutral-100 px-4 pt-3 pb-4">
          {/* Sub-tabs */}
          <div className="flex gap-1 mb-4 border-b border-neutral-200">
            {(["fields", "content"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
                  activeSubTab === tab
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {tab === "fields" ? `Campos (${section.fields.length})` : "Conteúdo"}
              </button>
            ))}
          </div>

          {activeSubTab === "fields" && (
            <SectionFieldsManager
              entityId={section.id}
              entityType="section"
              initialFields={section.fields}
            />
          )}

          {activeSubTab === "content" && (
            <div className="text-center py-6">
              <p className="text-sm text-neutral-500 mb-3">
                Edite o conteúdo desta seção no editor completo.
              </p>
              <Link
                href={`/admin/secoes/${section.id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-neutral-950 text-white rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Abrir editor
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TenantTabs({ sections, events, users, tenantId }: TenantTabsProps) {
  return (
    <Tabs.Root defaultValue="sections">
      <Tabs.List className="flex gap-1 border-b border-neutral-200 mb-6">
        {[
          { value: "sections", label: `Seções (${sections.length})` },
          { value: "events",   label: `Eventos (${events.length})` },
          { value: "users",    label: `Usuário` },
        ].map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className="px-4 py-2.5 text-sm font-medium text-neutral-500 border-b-2 border-transparent -mb-px transition-colors data-[state=active]:text-neutral-900 data-[state=active]:border-neutral-900"
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Sections */}
      <Tabs.Content value="sections">
        <div className="bg-white rounded-xl border border-neutral-200">
          {sections.length === 0 && (
            <div className="py-12 text-center text-sm text-neutral-400">
              Nenhuma seção cadastrada.
            </div>
          )}
          {sections.map((section) => (
            <SectionRow key={section.id} section={section} />
          ))}
        </div>
      </Tabs.Content>

      {/* Events */}
      <Tabs.Content value="events">
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          {events.length === 0 && (
            <div className="py-12 text-center text-sm text-neutral-400">
              Nenhum evento cadastrado.
            </div>
          )}
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-4 px-4 py-3.5 hover:bg-neutral-50/60 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900">{event.title}</p>
                <p className="text-xs text-neutral-400">
                  {event.eventDate
                    ? format(new Date(event.eventDate), "d MMM yyyy", { locale: ptBR })
                    : "Sem data"}{" "}
                  · /{event.slug}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {event._count.signups}
                </span>
                <Badge variant={event.registrationOpen ? "success" : "default"}>
                  {event.registrationOpen ? "Aberto" : "Fechado"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Tabs.Content>

      {/* Users */}
      <Tabs.Content value="users">
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          {users.length === 0 && (
            <div className="py-12 text-center text-sm text-neutral-400">
              Nenhum usuário vinculado.
            </div>
          )}
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-4 px-4 py-4">
              <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-neutral-500">
                  {(user.name ?? user.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                {user.name && (
                  <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                )}
                <p className="text-sm text-neutral-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </p>
              </div>
              <Badge variant="default">client</Badge>
            </div>
          ))}
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}
