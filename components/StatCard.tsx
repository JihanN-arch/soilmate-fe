import { ReactNode } from "react";

type StatCardProps = {
  title: ReactNode;
  description: string;
};

export default function StatCard({ title, description }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-sand p-6 shadow-sm">
      <h3 className="mb-2 font-display text-lg font-bold text-forest-dark">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-forest-dark/80">
        {description}
      </p>
    </div>
  );
}
