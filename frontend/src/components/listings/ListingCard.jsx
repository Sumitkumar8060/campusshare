import { Link } from "react-router-dom";
import { MapPin, ImageOff } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge, listingTypeMeta } from "@/components/ui/Badge";
import { formatCurrency, timeAgo } from "@/lib/utils";

export function ListingPrice({ item }) {
  if (item.listingType === "GiveAway") {
    return <span className="text-lg font-bold text-give-500">Free</span>;
  }
  if (item.listingType === "Rent") {
    return (
      <span className="text-lg font-bold text-ink-900">
        {formatCurrency(item.rentPricePerDay)}
        <span className="text-sm font-medium text-ink-400"> /day</span>
      </span>
    );
  }
  return <span className="text-lg font-bold text-ink-900">{formatCurrency(item.price)}</span>;
}

export function ListingCard({ item }) {
  const { variant, label } = listingTypeMeta(item.listingType);
  const image = item.images?.[0];

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.15 }}>
      <Link to={`/listings/${item._id}`}>
        <Card className="group overflow-hidden">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
            {image ? (
              <img
                src={image}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-300">
                <ImageOff className="h-10 w-10" />
              </div>
            )}
            <div className="absolute left-3 top-3 flex gap-1.5">
              <Badge variant={variant}>{label}</Badge>
              {!item.isAvailable && <Badge variant="neutral">Unavailable</Badge>}
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 font-semibold text-ink-900">{item.name}</h3>
            </div>
            <p className="mt-0.5 line-clamp-1 text-xs text-ink-400">{item.category}</p>
            <div className="mt-2.5 flex items-center justify-between">
              <ListingPrice item={item} />
              <Badge variant="neutral">{item.condition}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-500">
              <span className="flex min-w-0 items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.location}</span>
              </span>
              <span className="shrink-0">{timeAgo(item.createdAt)}</span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
