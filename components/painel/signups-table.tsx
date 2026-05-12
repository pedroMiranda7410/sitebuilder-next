"use client";

import { Download } from "lucide-react";
import type { FormField } from "@/components/painel/eventos-client";

interface Signup {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  responses: Record<string, unknown>;
  createdAt: string;
}

interface SignupsTableProps {
  formSchema: FormField[];
  signups: Signup[];
  eventTitle: string;
}

function getLabel(field: FormField): string {
  return field.label.pt ?? field.label.en ?? field.id;
}

function formatValue(value: unknown, field: FormField): string {
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        const opt = field.options?.find((o) => o.value === v);
        return opt ? (opt.label.pt ?? opt.label.en ?? String(v)) : String(v);
      })
      .join(", ");
  }
  if (field.type === "toggle") {
    return value === true || value === "true" ? "Sim" : "Não";
  }
  if (field.options) {
    const opt = field.options.find((o) => o.value === String(value));
    if (opt) return opt.label.pt ?? opt.label.en ?? String(value);
  }
  return String(value);
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function SignupsTable({ formSchema, signups, eventTitle }: SignupsTableProps) {
  const inputFields = formSchema.filter(
    (f) => f.type !== "heading" && f.type !== "paragraph"
  );

  function exportCsv() {
    const headers = ["Data de inscrição", ...inputFields.map(getLabel)];
    const rows = signups.map((signup) => {
      const date = new Date(signup.createdAt).toLocaleString("pt-BR");
      const cells = inputFields.map((field) =>
        formatValue(signup.responses[field.id], field)
      );
      return [date, ...cells];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inscritos-${eventTitle.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (signups.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 py-16 text-center text-sm text-neutral-400">
        Nenhuma inscrição ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-x-auto">
        {inputFields.length === 0 ? (
          // Fallback: no formSchema, show name/email/phone columns
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 whitespace-nowrap">Nome</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 whitespace-nowrap">E-mail</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 whitespace-nowrap">Telefone</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 whitespace-nowrap">Data</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((s) => (
                <tr key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="px-5 py-3 text-neutral-900">{s.name ?? "—"}</td>
                  <td className="px-5 py-3 text-neutral-600">{s.email ?? "—"}</td>
                  <td className="px-5 py-3 text-neutral-600">{s.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-neutral-400 text-xs whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // Dynamic columns from formSchema
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                {inputFields.map((field) => (
                  <th
                    key={field.id}
                    className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 whitespace-nowrap"
                  >
                    {getLabel(field)}
                    {field.required && <span className="text-red-400 ml-0.5">*</span>}
                  </th>
                ))}
                <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 whitespace-nowrap">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {signups.map((signup) => (
                <tr key={signup.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  {inputFields.map((field) => (
                    <td key={field.id} className="px-5 py-3 text-neutral-700 max-w-[200px] truncate">
                      {formatValue(signup.responses[field.id], field)}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-neutral-400 text-xs whitespace-nowrap">
                    {new Date(signup.createdAt).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
