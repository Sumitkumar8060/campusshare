import { api } from "./axios";

/**
 * POST /api/requests (auth required)
 * body: { itemId, message }
 */
export function createRequest(payload) {
  return api.post("/requests", payload).then((res) => res.data);
}

/** GET /api/requests/my (auth required) — requests I sent as a requester */
export function getMyRequests() {
  return api.get("/requests/my").then((res) => res.data);
}

/** GET /api/requests/incoming (auth required) — requests I received as an owner */
export function getIncomingRequests() {
  return api.get("/requests/incoming").then((res) => res.data);
}

/** PATCH /api/requests/:id/accept (auth required, owner only) */
export function acceptRequest(id) {
  return api.patch(`/requests/${id}/accept`).then((res) => res.data);
}

/** PATCH /api/requests/:id/reject (auth required, owner only) */
export function rejectRequest(id) {
  return api.patch(`/requests/${id}/reject`).then((res) => res.data);
}
