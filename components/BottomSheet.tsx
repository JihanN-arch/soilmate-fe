"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85dvh] w-full max-w-[420px] overflow-y-auto rounded-t-2xl bg-white p-5 pb-8"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-forest-dark">{title}</h2>
          <button onClick={onClose} aria-label="Tutup">
            <X className="h-5 w-5 text-forest-dark" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
