import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ size = 20, className }) {
  return (
    <Loader2
      className={cn("animate-spin text-brand-600", className)}
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
}

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-md bg-ink-200/70", className)} />;
}
