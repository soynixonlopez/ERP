import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-base font-semibold transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:scale-[1.02] hover:shadow-lg disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none",
  {
    variants: {
      variant: {
        primary: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-95",
        secondary: "bg-white border border-[var(--border)] text-[var(--foreground)] hover:bg-slate-50",
        accent: "bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-95",
        ghost: "bg-transparent text-[var(--foreground)] hover:bg-slate-100"
      },
      size: {
        sm: "h-10 px-3.5 text-sm",
        md: "h-11 px-4.5",
        lg: "h-12 px-6 text-lg"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps): JSX.Element {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
