import { api } from "./axios";

/**
 * GET /api/items?search=&listingType=&category=&condition=&available=
 * Public. Supported query params come straight from itemController.getItems —
 * do not add params the backend doesn't read (e.g. location, price range, pagination).
 */
export function getItems(params = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  return api.get("/items", { params: cleaned }).then((res) => res.data);
}

/** GET /api/items/:id — public */
export function getItemById(id) {
  return api.get(`/items/${id}`).then((res) => res.data);
}

/**
 * POST /api/items (auth required)
 * body: { name, category, description, condition, listingType, price,
 *         rentPricePerDay, securityDeposit, availableFrom, availableUntil,
 *         quantity, location, images }
 */
export function createItem(payload) {
  return api.post("/items", payload).then((res) => res.data);
}

/** PUT /api/items/:id (auth required, owner only) */
export function updateItem(id, payload) {
  return api.put(`/items/${id}`, payload).then((res) => res.data);
}

/** DELETE /api/items/:id (auth required, owner only) */
export function deleteItem(id) {
  return api.delete(`/items/${id}`).then((res) => res.data);
}
