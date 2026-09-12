import { Link } from "react-router-dom";
import { Check, X, ImageOff, Phone, School } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge, requestStatusMeta, listingTypeMeta } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export function RequestCard({ request, perspective, onAccept, onReject, actionLoading }) {
  const item = request.item;
  const statusMeta = requestStatusMeta(request.status);
  const typeMeta = item ? listingTypeMeta(item.listingType) : null;
  const person = perspective === "received" ? request.requester : request.owner;
  const isPending = request.status === "PENDING";

  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <Link
        to={item ? `/listings/${item._id}` : "#"}
        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-100"
      >
        {item?.images?.[0] ? (
          <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="h-6 w-6 text-ink-300" />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={item ? `/listings/${item._id}` : "#"}
            className="font-semibold text-ink-900 hover:text-brand-600"
          >
            {item?.name || "Item no longer available"}
          </Link>
          {typeMeta && <Badge variant={typeMeta.variant}>{typeMeta.label}</Badge>}
          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
        </div>

        <p className="mt-1 text-sm text-ink-500">
          {perspective === "received" ? "From " : "To "}
          <span className="font-medium text-ink-700">{person?.name || "Unknown user"}</span>
          {person?.college && (
            <span className="ml-1.5 inline-flex items-center gap-1 text-ink-400">
              <School className="h-3 w-3" /> {person.college}
            </span>
          )}
        </p>

        {request.message && (
          <p className="mt-1.5 rounded-lg bg-ink-50 px-3 py-1.5 text-sm text-ink-600">
            “{request.message}”
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-400">
          <span>Requested {formatDate(request.createdAt)}</span>
          {perspective === "received" && request.status === "ACCEPTED" && person?.phone && (
            <span className="flex items-center gap-1 text-ink-500">
              <Phone className="h-3 w-3" /> {person.phone}
            </span>
          )}
        </div>
      </div>

      {perspective === "received" && isPending && (
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            onClick={() => onAccept?.(request._id)}
            loading={actionLoading === `accept-${request._id}`}
          >
            <Check className="h-4 w-4" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outlineDanger"
            onClick={() => onReject?.(request._id)}
            loading={actionLoading === `reject-${request._id}`}
          >
            <X className="h-4 w-4" />
            Reject
          </Button>
        </div>
      )}
    </Card>
  );
}
