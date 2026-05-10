"use client";

import { Users, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Subscriber {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
}

interface NewsletterClientProps {
  subscribers: Subscriber[];
}

export function NewsletterClient({ subscribers }: NewsletterClientProps) {
  function exportCSV() {
    const rows = [
      ["Nome", "Email", "Data de cadastro"],
      ...subscribers.map((s) => [
        s.name ?? "",
        s.email,
        format(new Date(s.createdAt), "dd/MM/yyyy", { locale: ptBR }),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contatos-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Contatos do site</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Pessoas que se cadastraram no seu site para receber novidades.
          </p>
        </div>
        {subscribers.length > 0 && (
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-neutral-200 bg-white rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar lista
          </button>
        )}
      </div>

      {/* Counter card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 mb-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6 text-neutral-400" />
        </div>
        <div>
          <p className="text-3xl font-bold text-neutral-900 tabular-nums">{subscribers.length}</p>
          <p className="text-sm text-neutral-500">
            contato{subscribers.length !== 1 ? "s" : ""} capturado{subscribers.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 mb-4">
        <p className="text-sm text-amber-800 leading-relaxed">
          💡 <strong>O que fazer com estes contatos?</strong> Exporte a lista em CSV e importe na sua
          plataforma de email preferida. Recomendamos o{" "}
          <a
            href="https://www.brevo.com"
            target="_blank"
            rel="noreferrer"
            className="underline font-medium"
          >
            Brevo
          </a>{" "}
          (gratuito até 300 emails/dia) para começar a enviar newsletters com facilidade.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {subscribers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-neutral-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Nenhum contato ainda</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Quando alguém se cadastrar no seu site, aparecerá aqui.
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-400">Nome</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-400">Email</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-400">Cadastrado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-neutral-500">
                        {(s.name ?? s.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-neutral-800">{s.name ?? <span className="text-neutral-300 italic">Sem nome</span>}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-500">{s.email}</td>
                  <td className="px-5 py-3.5 text-xs text-neutral-400">
                    {format(new Date(s.createdAt), "d MMM yyyy", { locale: ptBR })}
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
