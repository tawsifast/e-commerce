import axios, { AxiosError } from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

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

// ============================================================
// Seller
// ============================================================
export const SellerAPI = {
  overview: () => api.get("/seller/overview").then((r) => r.data),
  analytics: (range = "30d") =>
    api.get("/seller/analytics", { params: { range } }).then((r) => r.data),
  products: (q = {}) =>
    api.get("/seller/products", { params: q }).then((r) => r.data),
  createProduct: (payload) =>
    api.post("/seller/products", payload).then((r) => r.data.product),
  updateProduct: (id, payload) =>
    api.patch(`/seller/products/${id}`, payload).then((r) => r.data.product),
  deleteProduct: (id) =>
    api.delete(`/seller/products/${id}`).then((r) => r.data),
  orders: (page = 1, limit = 10) =>
    api.get("/seller/orders", { params: { page, limit } }).then((r) => r.data),
  updateOrderStatus: (orderId, status) =>
    api.patch(`/seller/orders/${orderId}/status`, { status }).then((r) => r.data.order),
  requestSellerRole: () =>
    api.post("/seller/apply").then((r) => r.data),
};

// ============================================================
// Admin
// ============================================================
export const AdminAPI = {
  overview: () => api.get("/admin/overview").then((r) => r.data),
  users: (q = {}) => api.get("/admin/users", { params: q }).then((r) => r.data),
  updateUserRole: (id, role) =>
    api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data.user),
  toggleUserBlock: (id, blocked) =>
    api.patch(`/admin/users/${id}/block`, { blocked }).then((r) => r.data.user),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  products: (q = {}) => api.get("/admin/products", { params: q }).then((r) => r.data),
  toggleProductVisibility: (id, hidden) =>
    api.patch(`/admin/products/${id}/visibility`, { hidden }).then((r) => r.data.product),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`).then((r) => r.data),
  orders: (q = {}) => api.get("/admin/orders", { params: q }).then((r) => r.data),
  updateOrderStatus: (id, status) =>
    api.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data.order),
};

