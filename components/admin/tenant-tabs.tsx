"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { Calendar, Eye, EyeOff, GripVertical, Mail, User, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Section {
  id: string;
  label: string;
  sectionKey: string;
  sectionType: string;
  position: number;
  visible: boolean;
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

export function TenantTabs({ sections, events, users, tenantId }: TenantTabsProps) {
  return (
    <Tabs.Root defaultValue="sections">
      <Tabs.List className="flex gap-1 border-b border-neutral-200 mb-6">
        {[
          { value: "sections", label: `Seções (${sections.length})` },
          { value: "events", label: `Eventos (${events.length})` },
          { value: "users", label: `Usuário` },
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
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          {sections.length === 0 && (
            <div className="py-12 text-center text-sm text-neutral-400">
              Nenhuma seção cadastrada.
            </div>
          )}
          {sections.map((section) => (
            <div
              key={section.id}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50/60 transition-colors"
            >
              <GripVertical className="w-4 h-4 text-neutral-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900">{section.label}</p>
                <p className="text-xs text-neutral-400">
                  {section.sectionKey} · {section.sectionType}
                </p>
              </div>
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
