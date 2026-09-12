import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef(({ className, error, rows = 4, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40",
        error ? "border-red-400 focus:border-red-500" : "border-ink-200 focus:border-brand-500",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
