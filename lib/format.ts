export function rupiah(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "-";
  const neg = n < 0;
  const s = "Rp " + Math.round(Math.abs(n)).toLocaleString("id-ID");
  return neg ? "−" + s : s;
}

export function rupiahRingkas(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "-";
  const a = Math.abs(n);
  const neg = n < 0 ? "−" : "";
  if (a >= 1e9) return `${neg}Rp ${(a / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  if (a >= 1e6) return `${neg}Rp ${(a / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (a >= 1e3) return `${neg}Rp ${(a / 1e3).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  return `${neg}Rp ${Math.round(a)}`;
}

export function tanggal(iso?: string | null, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("id-ID", opts);
}

export function hariSejak(iso?: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

export function hariIniISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
