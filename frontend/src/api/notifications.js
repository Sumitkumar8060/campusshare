import { api } from "./axios";

/** GET /api/notifications (auth required) */
export function getNotifications() {
  return api.get("/notifications").then((res) => res.data);
}

/** PATCH /api/notifications/:id/read (auth required) */
export function markNotificationRead(id) {
  return api.patch(`/notifications/${id}/read`).then((res) => res.data);
}
