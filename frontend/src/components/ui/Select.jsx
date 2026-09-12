import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = forwardRef(({ className, error, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-sm text-ink-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40",
          error ? "border-red-400 focus:border-red-500" : "border-ink-200 focus:border-brand-500",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
    </div>
  );
});
Select.displayName = "Select";
