"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastVariant = "success" | "error";
type ToastDetail = { message: string; variant: ToastVariant };

export function Toaster() {
  const [toastData, setToastData] = useState<ToastDetail | null>(null);

  useEffect(() => {
    const handleToast = (e: CustomEvent<ToastDetail>) => {
      setToastData(e.detail);
      // Les erreurs restent affichées plus longtemps, le temps d'être lues.
      setTimeout(() => setToastData(null), e.detail.variant === "error" ? 6000 : 3000);
    };
    window.addEventListener("show-toast", handleToast as EventListener);
    return () => window.removeEventListener("show-toast", handleToast as EventListener);
  }, []);

  if (!toastData) return null;

  const isError = toastData.variant === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 ${
        isError ? "bg-red-600 text-white" : "bg-gray-900 text-white"
      }`}
    >
      {isError ? (
        <AlertCircle size={20} className="text-white flex-shrink-0" />
      ) : (
        <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
      )}
      <span className="text-sm font-medium">{toastData.message}</span>
      <button onClick={() => setToastData(null)} className="ml-4 text-white/70 hover:text-white transition-colors">
        <X size={16} />
      </button>
    </div>
  );
}

export const toast = (message: string, variant: ToastVariant = "success") => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("show-toast", { detail: { message, variant } }));
  }
};
