type StepProgressProps = {
  step: 1 | 2 | 3;
  label: string;
};

export default function StepProgress({ step, label }: StepProgressProps) {
  const widthPercent = step === 1 ? "33%" : step === 2 ? "66%" : "100%";

  return (
    <div className="bg-white px-4 py-3 text-center">
      <p className="mb-2 text-sm font-semibold text-forest-dark">{label}</p>
      <div className="mx-auto h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-forest-dark/20">
        <div
          className="h-full rounded-full bg-forest"
          style={{ width: widthPercent }}
        />
      </div>
    </div>
  );
}