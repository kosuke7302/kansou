import * as React from "react";

type BadgeVariant = "default" | "manga" | "anime" | "drama" | "movie";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800",
  manga: "bg-blue-100 text-blue-800",
  anime: "bg-purple-100 text-purple-800",
  drama: "bg-green-100 text-green-800",
  movie: "bg-orange-100 text-orange-800",
};

const variantLabels: Record<BadgeVariant, string> = {
  default: "",
  manga: "漫画",
  anime: "アニメ",
  drama: "ドラマ",
  movie: "映画",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children ?? variantLabels[variant]}
    </span>
  );
}
