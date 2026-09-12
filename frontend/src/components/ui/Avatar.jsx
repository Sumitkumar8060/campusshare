import { useState } from "react";
import { getInitials, cn } from "@/lib/utils";

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

export function Avatar({ name, src, size = "md", className }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-semibold text-brand-700 ring-1 ring-inset ring-black/5",
        sizes[size],
        className
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || "User"}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{getInitials(name) || "?"}</span>
      )}
    </div>
  );
}
