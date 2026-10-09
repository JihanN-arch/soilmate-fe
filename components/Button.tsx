import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
};

const variants = {
  primary:
    "bg-forest text-cream-light hover:bg-forest-light disabled:bg-forest/40",
  secondary:
    "bg-cream-light text-forest border border-forest/30 hover:bg-forest/5",
  ghost:
    "bg-transparent text-forest underline underline-offset-4 hover:text-forest-dark",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
