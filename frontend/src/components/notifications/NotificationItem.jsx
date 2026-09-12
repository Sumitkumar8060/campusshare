import { Link } from "react-router-dom";
import { Package, CheckCircle2, XCircle, Bell } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { timeAgo, cn } from "@/lib/utils";

const iconByType = {
  NEW_REQUEST: Package,
  REQUEST_ACCEPTED: CheckCircle2,
  REQUEST_REJECTED: XCircle,
};

const toneByType = {
  NEW_REQUEST: "bg-brand-50 text-brand-600",
  REQUEST_ACCEPTED: "bg-emerald-50 text-emerald-600",
  REQUEST_REJECTED: "bg-red-50 text-red-600",
};

export function NotificationItem({ notification, onMarkRead }) {
  const Icon = iconByType[notification.type] || Bell;
  const tone = toneByType[notification.type] || "bg-ink-100 text-ink-500";
  const link = notification.item?._id ? `/listings/${notification.item._id}` : null;

  const content = (
    <Card
      className={cn(
        "flex items-start gap-4 p-4 transition-colors",
        !notification.isRead && "border-brand-200 bg-brand-50/40"
      )}
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", tone)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink-800">{notification.message}</p>
        <p className="mt-1 text-xs text-ink-400">{timeAgo(notification.createdAt)}</p>
      </div>
      {!notification.isRead && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onMarkRead(notification._id);
          }}
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-100"
        >
          Mark read
        </button>
      )}
    </Card>
  );

  return link ? (
    <Link to={link} onClick={() => !notification.isRead && onMarkRead(notification._id)}>
      {content}
    </Link>
  ) : (
    content
  );
}
