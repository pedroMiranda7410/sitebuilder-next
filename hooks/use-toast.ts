"use client";

import { useState, useCallback } from "react";

type ToastVariant = "default" | "success" | "error";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

let globalToastHandler: ((toast: Omit<Toast, "id">) => void) | null = null;

export function useToastStore() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  globalToastHandler = addToast;

  return { toasts, removeToast };
}

export function useToast() {
  const toast = useCallback(
    (message: string, variant: ToastVariant = "default") => {
      if (globalToastHandler) {
        globalToastHandler({ message, variant });
      }
    },
    []
  );

  return {
    toast,
    success: (message: string) => toast(message, "success"),
    error: (message: string) => toast(message, "error"),
  };
}
