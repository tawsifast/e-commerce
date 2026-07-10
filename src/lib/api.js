import axios, { AxiosError } from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

export const TOKEN_KEY = "marketa_token";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiErrorMessage(err, fallback = "Something went wrong") {
  if (err instanceof AxiosError) {
    const data = err.response?.data;
    return data?.message ?? data?.error ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

// ============================================================
// API endpoint helpers — expected REST contract for your
// Express + Mongo backend. All requests go through VITE_API_BASE_URL.
// ============================================================

export const AuthAPI = {
  register: (payload) =>
    api.post("/auth/register", payload).then((r) => r.data),
  login: (payload) =>
    api.post("/auth/login", payload).then((r) => r.data),
  googleLogin: (idToken) =>
    api.post("/auth/google", { idToken }).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data.user),
  updateProfile: (payload) =>
    api.patch("/auth/me", payload).then((r) => r.data.user),
  changePassword: (payload) =>
    api.patch("/auth/password", payload).then((r) => r.data),
};

export const ProductsAPI = {
  list: (q = {}) =>
    api.get("/products", { params: q }).then((r) => r.data),
  featured: () => api.get("/products/featured").then((r) => r.data.items),
  bestSellers: () => api.get("/products/best-sellers").then((r) => r.data.items),
  categories: () => api.get("/products/categories").then((r) => r.data.items),
  get: (id) => api.get(`/products/${id}`).then((r) => r.data.product),
  reviews: (id) => api.get(`/products/${id}/reviews`).then((r) => r.data.items),
  addReview: (id, payload) =>
    api.post(`/products/${id}/reviews`, payload).then((r) => r.data.review),
};

export const WishlistAPI = {
  list: () => api.get("/wishlist").then((r) => r.data.items),
  add: (productId) => api.post("/wishlist", { productId }).then((r) => r.data),
  remove: (productId) => api.delete(`/wishlist/${productId}`).then((r) => r.data),
};

export const OrdersAPI = {
  create: (payload) =>
    api.post("/orders/checkout", payload).then((r) => r.data),
  confirm: (orderId, paymentIntentId) =>
    api.post(`/orders/${orderId}/confirm`, { paymentIntentId }).then((r) => r.data.order),
  myOrders: (page = 1, limit = 10) =>
    api.get("/orders/my", { params: { page, limit } }).then((r) => r.data),
  cancel: (orderId) =>
    api.post(`/orders/${orderId}/cancel`).then((r) => r.data.order),
};

export const ReviewsAPI = {
  latest: () => api.get("/reviews/latest").then((r) => r.data.items),
};
