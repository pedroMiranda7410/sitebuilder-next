"use client";

import { useState } from "react";
import { Calendar, MapPin, Users, Plus, X, ToggleLeft, ToggleRight, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Evento {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  eventDate: string | null;
  location: string | null;
  coverImageUrl: string | null;
  registrationOpen: boolean;
  _count: { signups: number };
}

interface EventosClientProps {
  events: Evento[];
}

// Shared input classes — dark text, readable placeholder
const inputCls =
  "w-full h-10 px-3 text-sm text-neutral-900 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400 transition-colors";

const textareaCls =
  "w-full px-3 py-2.5 text-sm text-neutral-900 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400 resize-none transition-colors";

// Shared button classes
const outlineBtnCls =
  "flex-1 py-2.5 text-sm font-medium text-neutral-800 border border-neutral-300 rounded-xl hover:bg-neutral-100 hover:border-neutral-400 transition-colors";

const primaryBtnCls =
  "flex-1 py-2.5 text-sm font-medium bg-neutral-950 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-40";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ─── Modal (create + edit) ────────────────────────────────────────────────────

function EventModal({
  event,
  onClose,
  onSave,
}: {
  event?: Evento;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}) {
  const isEdit = !!event;

  function toLocalDatetime(iso: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const [title, setTitle] = useState(event?.title ?? "");
  const [date, setDate] = useState(toLocalDatetime(event?.eventDate ?? null));
  const [location, setLocation] = useState(event?.location ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(event?.coverImageUrl ?? "");
  const [registrationOpen, setRegistrationOpen] = useState(event?.registrationOpen ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        title,
        eventDate: date ? new Date(date).toISOString() : null,
        location: location || null,
        description: description || null,
        coverImageUrl: coverImageUrl || null,
        registrationOpen,
      };
      if (!isEdit) {
        payload.slug = slugify(title) + "-" + Date.now();
      }
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar evento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">
            {isEdit ? "Editar evento" : "Novo evento"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1.5">
              Nome do evento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Círculo de Mulheres — Agosto"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1.5">
              Quando será?
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1.5">Onde será?</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: São Paulo, SP ou Online via Zoom"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1.5">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Conte um pouco sobre o evento..."
              className={textareaCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1.5">
              Foto de capa (URL)
            </label>
            <input
              type="text"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className={inputCls}
            />
            {coverImageUrl?.startsWith("http") && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImageUrl}
                alt="Preview"
                className="mt-2 w-full h-28 object-cover rounded-xl"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            )}
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-neutral-600">Abrir inscrições</p>
              <p className="text-xs text-neutral-500">Permite que visitantes se inscrevam</p>
            </div>
            <button
              type="button"
              onClick={() => setRegistrationOpen((v) => !v)}
              className={`transition-colors ${
                registrationOpen ? "text-emerald-600" : "text-neutral-300"
              }`}
            >
              {registrationOpen ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className={outlineBtnCls}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className={primaryBtnCls}
            >
              {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EventosClient({ events: initial }: EventosClientProps) {
  const [events, setEvents] = useState(initial);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleCreate(data: Record<string, unknown>) {
    const res = await fetch("/api/painel/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error ?? "Erro ao criar evento");
    }
    const created = await res.json();
    setEvents((prev) => [
      ...prev,
      {
        id: created.id,
        title: created.title,
        slug: created.slug,
        description: created.description ?? null,
        eventDate: created.eventDate ?? null,
        location: created.location ?? null,
        coverImageUrl: created.coverImageUrl ?? null,
        registrationOpen: created.registrationOpen ?? false,
        _count: { signups: 0 },
      },
    ]);
  }

  async function handleEdit(data: Record<string, unknown>) {
    if (!editingEvent) return;
    const res = await fetch(`/api/painel/events/${editingEvent.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error ?? "Erro ao salvar evento");
    }
    // Optimistic update
    const updated = await res.json();
    setEvents((prev) =>
      prev.map((e) =>
        e.id === updated.id
          ? {
              ...e,
              title: updated.title,
              eventDate: updated.eventDate,
              location: updated.location,
              description: updated.description,
              coverImageUrl: updated.coverImageUrl,
              registrationOpen: updated.registrationOpen,
            }
          : e
      )
    );
  }

  async function toggleRegistration(id: string, current: boolean) {
    setTogglingId(id);
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, registrationOpen: !current } : e))
    );
    await fetch(`/api/painel/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationOpen: !current }),
    });
    setTogglingId(null);
  }

  return (
    <>
      {showCreateModal && (
        <EventModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
        />
      )}
      {editingEvent && (
        <EventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={handleEdit}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Eventos</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {events.length} evento{events.length !== 1 ? "s" : ""} cadastrado
            {events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo evento
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-neutral-200 py-20 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-neutral-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-600">Nenhum evento criado ainda</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Crie seu primeiro evento para começar a receber inscrições
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-1 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Criar evento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-300 transition-colors"
            >
              {/* Cover */}
              {event.coverImageUrl?.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.coverImageUrl}
                  alt={event.title}
                  className="w-full h-36 object-cover"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-neutral-300" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-neutral-900 text-sm leading-snug">
                    {event.title}
                  </h3>
                  <span
                    className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                      event.registrationOpen
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {event.registrationOpen ? "Inscrições abertas" : "Encerrado"}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  {event.eventDate && (
                    <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      {format(new Date(event.eventDate), "d 'de' MMMM 'de' yyyy 'às' HH'h'mm", {
                        locale: ptBR,
                      })}
                    </p>
                  )}
                  {event.location && (
                    <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {event.location}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    {event._count.signups} inscrito{event._count.signups !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => setEditingEvent(event)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 border border-neutral-300 rounded-lg hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    Editar
                  </button>
                  <button
                    onClick={() => toggleRegistration(event.id, event.registrationOpen)}
                    disabled={togglingId === event.id}
                    className="flex-1 py-1.5 text-xs font-medium text-neutral-800 border border-neutral-300 rounded-lg hover:bg-neutral-100 hover:border-neutral-400 transition-colors disabled:opacity-40"
                  >
                    {event.registrationOpen ? "Fechar inscrições" : "Abrir inscrições"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
