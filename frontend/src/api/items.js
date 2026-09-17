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
 * Accepts a FormData instance (name, category, description, condition,
 * listingType, price, rentPricePerDay, securityDeposit, availableFrom,
 * availableUntil, quantity, location, and up to 5 "images" file entries —
 * matches the backend's upload.array("images", 5)).
 *
 * The `api` axios instance sets a default "Content-Type: application/json"
 * header. That default would otherwise stick on this request too, which
 * breaks multipart uploads (the browser needs to set its own
 * "multipart/form-data; boundary=..." header). Explicitly clearing it here
 * lets axios/the browser generate the correct multipart header and boundary.
 */
export function createItem(payload) {
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
  return api
    .post("/items", payload, isFormData ? { headers: { "Content-Type": undefined } } : undefined)
    .then((res) => res.data);
}

/** PUT /api/items/:id (auth required, owner only) */
export function updateItem(id, payload) {
  return api.put(`/items/${id}`, payload).then((res) => res.data);
}

/** DELETE /api/items/:id (auth required, owner only) */
export function deleteItem(id) {
  return api.delete(`/items/${id}`).then((res) => res.data);
}