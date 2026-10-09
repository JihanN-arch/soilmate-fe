import { ReactNode } from "react";

// Kartu bergaya "Lingkungan Lahan Terdeteksi": pita judul hijau di atas, isi putih di bawah.
export default function SectionCard({
  title,
  icon,
  action,
  children,
  className = "",
  bodyClassName = "",
}: {
  title: string;
  icon?: ReactNode;
  action?: ReactNode; // elemen kecil di kanan pita, mis. badge
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={className}>
      <div className="flex items-center justify-center gap-2 rounded-t-2xl bg-forest px-4 py-3">
        {icon}
        <h3 className="text-center font-display text-sm font-bold uppercase tracking-wide text-white">{title}</h3>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      <div className={`rounded-b-2xl bg-white p-4 shadow-lg ${bodyClassName}`}>{children}</div>
    </section>
  );
}
