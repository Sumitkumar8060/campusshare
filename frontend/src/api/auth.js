import { api } from "./axios";

/**
 * POST /api/auth/register
 * body: { name, email, password, confirmPassword, college, phone }
 * returns: { _id, name, email, college, phone }
 */
export function registerUser(payload) {
  return api.post("/auth/register", payload).then((res) => res.data);
}

/**
 * POST /api/auth/login
 * body: { email, password }
 * returns: { _id, name, email, college, token }
 */
export function loginUser(payload) {
  return api.post("/auth/login", payload).then((res) => res.data);
}
