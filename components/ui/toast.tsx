"use client";

import { useToastStore } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

const variantConfig = {
  default: { icon: Info, className: "bg-neutral-900 text-white" },
  success: { icon: CheckCircle2, className: "bg-green-600 text-white" },
  error: { icon: AlertCircle, className: "bg-red-600 text-white" },
};

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const { icon: Icon, className } = variantConfig[toast.variant];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg min-w-[280px] max-w-sm",
              "animate-in slide-in-from-bottom-2 fade-in-0",
              className
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 focus:outline-none"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
