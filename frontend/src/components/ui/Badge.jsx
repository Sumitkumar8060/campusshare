import { cn } from "@/lib/utils";

const variants = {
  neutral: "bg-ink-100 text-ink-700",
  brand: "bg-brand-50 text-brand-700",
  sell: "bg-sell-50 text-sell-700 text-[color:var(--color-sell-500)]",
  rent: "bg-rent-50 text-[color:var(--color-rent-500)]",
  give: "bg-give-50 text-[color:var(--color-give-500)]",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
};

export function Badge({ className, variant = "neutral", children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/** Maps a backend listingType to a badge variant + label. */
export function listingTypeMeta(listingType) {
  switch (listingType) {
    case "Sell":
      return { variant: "sell", label: "For Sale" };
    case "Rent":
      return { variant: "rent", label: "For Rent" };
    case "GiveAway":
      return { variant: "give", label: "Give Away" };
    default:
      return { variant: "neutral", label: listingType || "Listing" };
  }
}

/** Maps a backend request status to a badge variant. */
export function requestStatusMeta(status) {
  switch (status) {
    case "PENDING":
      return { variant: "warning", label: "Pending" };
    case "ACCEPTED":
      return { variant: "success", label: "Accepted" };
    case "REJECTED":
      return { variant: "danger", label: "Rejected" };
    case "CANCELLED":
      return { variant: "neutral", label: "Cancelled" };
    case "COMPLETED":
      return { variant: "brand", label: "Completed" };
    default:
      return { variant: "neutral", label: status };
  }
}
