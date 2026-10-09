"use client";

import { AlertCircle } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  variant?: "confirm" | "error";
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
};

export default function Modal({
  open,
  onClose,
  variant = "confirm",
  title,
  description,
  confirmLabel = "Ya",
  cancelLabel = "Tidak",
  onConfirm,
}: ModalProps) {
  if (!open) return null;
  const isError = variant === "error";
  const bannerColor = isError ? "bg-alert" : "bg-[#E8A93C]"; // oranye buat confirm, merah buat error

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className={`${bannerColor} px-6 py-6 text-center text-white`}>
          <AlertCircle className="mx-auto mb-2 h-8 w-8" strokeWidth={2.5} />
          <p className="font-display text-base font-bold">
            {isError ? "WARNING!" : "TUNGGU SEBENTAR!"}
          </p>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="mb-5 text-sm font-semibold text-forest-dark">{title}</p>
          {description && (
            <p className="mb-5 text-xs leading-relaxed text-forest-dark/70">
              {description}
            </p>
          )}
          <div className="flex justify-center gap-3">
            {isError ? (
           <>
  <button
  onClick={onClose}
  className="min-w-[110px] rounded-full border-2 border-forest-dark/30 px-6 py-2.5 text-xs font-semibold text-forest-dark"
>
  TUTUP
</button>
<button
  onClick={onConfirm ?? onClose}
  className="min-w-[110px] rounded-full bg-alert px-6 py-2.5 text-xs font-semibold text-white"
>
  COBA LAGI
</button>
</>
            ) : (
            <>
 <button
  onClick={onClose}
  className="min-w-[110px] rounded-full border-2 border-forest-dark/30 px-6 py-2.5 text-xs font-semibold text-forest-dark"
>
  {cancelLabel}
</button>
<button
  onClick={onConfirm ?? onClose}
  className="min-w-[110px] rounded-full bg-[#E8A93C] px-6 py-2.5 text-xs font-semibold text-white"
>
  {confirmLabel}
</button>
</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}