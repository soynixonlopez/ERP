import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "success" | "warning" | "danger";
};

export function Badge({ className, tone = "default", ...props }: BadgeProps): JSX.Element {
  const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700"
  };

  return (
    <span
      className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", toneClasses[tone], className)}
      {...props}
    />
  );
}
