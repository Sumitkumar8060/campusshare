import { api } from "./axios";

/**
 * GET /api/users/profile (auth required)
 * returns full user document (minus password)
 */
export function getProfile() {
  return api.get("/users/profile").then((res) => res.data);
}

/**
 * PUT /api/users/profile (auth required)
 * body: any subset of { name, college, phone, profileImage }
 * returns updated { _id, name, email, college, phone, profileImage }
 */
export function updateProfile(payload) {
  return api.put("/users/profile", payload).then((res) => res.data);
}
