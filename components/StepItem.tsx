type StepItemProps = {
  number: string;
  title: string;
  description: string;
  isLast?: boolean;
};

export default function StepItem({
  number,
  title,
  description,
  isLast,
}: StepItemProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest font-display text-sm font-bold text-cream-light">
          {number}
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-forest/30" />}
      </div>
      <div className="pb-8">
        <h4 className="mb-1 font-display font-bold text-forest-dark">
          {title}
        </h4>
        <p className="text-sm leading-relaxed text-forest-dark/80">
          {description}
        </p>
      </div>
    </div>
  );
}