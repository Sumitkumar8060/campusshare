import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef(({ className, error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40",
        error ? "border-red-400 focus:border-red-500" : "border-ink-200 focus:border-brand-500",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
