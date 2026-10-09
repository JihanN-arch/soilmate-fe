"use client";

import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

export type Kategori = "Semua kategori" | "Pangan" | "Perkebunan" | "Hortikultura";

const OPTIONS: Kategori[] = ["Semua kategori", "Pangan", "Perkebunan", "Hortikultura"];

export default function FilterTanaman({
  value,
  onChange,
}: {
  value: Kategori;
  onChange: (val: Kategori) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
     <button
  onClick={() => setOpen(true)}
  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-3 py-1.5 text-[10px] font-bold ${
          value !== "Semua kategori"
            ? "border-forest-dark bg-forest-dark text-white"
            : "border-forest-dark bg-white text-forest-dark"
        }`}
      >
        {value !== "Semua kategori" && <Check className="h-3.5 w-3.5" />}
        {value === "Semua kategori" ? "FILTER KATEGORI" : value.toUpperCase()}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between bg-[#8BAA5C] px-5 py-4">
              <h2 className="font-display text-base font-bold text-white">FILTER KATEGORI</h2>
              <button onClick={() => setOpen(false)} aria-label="Tutup">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="space-y-2 p-4">
              {OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                    value === opt
                      ? "bg-forest-dark text-white"
                      : "bg-gray-50 text-forest-dark hover:bg-forest/5"
                  }`}
                >
                  {opt}
                  {value === opt && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}