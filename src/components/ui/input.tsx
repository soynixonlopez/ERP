import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps): JSX.Element {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
        className
      )}
      {...props}
    />
  );
}
