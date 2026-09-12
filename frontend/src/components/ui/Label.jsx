import { cn } from "@/lib/utils";

export function Label({ className, required, children, ...props }) {
  return (
    <label className={cn("mb-1.5 block text-sm font-medium text-ink-700", className)} {...props}>
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-500">{message}</p>;
}
