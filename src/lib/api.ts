import axios, { AxiosError } from "axios";
import type { Order, Product, Review, User } from "./types";
import {
  mockAdmin,
  mockAuth,
  mockOrders,
  mockProducts,
  mockReviews,
  mockSeller,
  mockWishlist,
} from "./mock-data";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

// Mock mode is on by default so the app runs without the backend.
// Attach the real API later by setting NEXT_PUBLIC_API_BASE_URL
// (or NEXT_PUBLIC_USE_MOCK=false) and removing ./mock-data.ts.
export const USE_MOCK_API =
  !process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Exchange the better-auth session for the API JWT cookie issued by the
// Express server. The cookie is HttpOnly and auto-sent on every request.
export async function exchangeApiToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/token`, { method: "POST", credentials: "include" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function logoutApiToken(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
  } catch {
    // best effort — token expires on its own
  }
}

export function getApiErrorMessage(err: unknown, fallback = "Something went wrong") {
  if (err instanceof AxiosError) {
    const data = err.response?.data;
    return data?.message ?? data?.error ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

// ============================================================
// API endpoint helpers — expected REST contract for your
// Express + Mongo backend. All requests go through NEXT_PUBLIC_API_BASE_URL.
// ============================================================

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  photo?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ReviewItem extends Review {
  user: User;
}

export interface HomeReview {
  _id: string;
  rating: number;
  comment: string;
  user: { _id: string; name: string };
  createdAt: string;
}

export interface CategorySummary {
  name: string;
  count: number;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface ProductPayload {
  title: string;
  description?: string;
  price: number;
  discountPrice?: number;
  category?: string;
  stock: number;
  images: string[];
}

const restAuth = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register", payload).then((r) => r.data),
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", payload).then((r) => r.data),
  googleLogin: (idToken: string) =>
    api.post<AuthResponse>("/auth/google", { idToken }).then((r) => r.data),
  me: () => api.get<{ user: User }>("/auth/me").then((r) => r.data.user),
  updateProfile: (payload: Partial<RegisterPayload>) =>
    api.patch<{ user: User }>("/auth/me", payload).then((r) => r.data.user),
  changePassword: (payload: ChangePasswordPayload) =>
    api.patch("/auth/password", payload).then((r) => r.data),
};

export const AuthAPI = USE_MOCK_API ? mockAuth : restAuth;

const restProducts = {
  list: (q: Record<string, unknown> = {}) =>
    api.get<ProductListResponse>("/products", { params: q }).then((r) => r.data),
  featured: () =>
    api.get<{ items: Product[] }>("/products/featured").then((r) => r.data.items),
  bestSellers: () =>
    api.get<{ items: Product[] }>("/products/best-sellers").then((r) => r.data.items),
  categories: () =>
    api.get<{ items: CategorySummary[] }>("/products/categories").then((r) => r.data.items),
  get: (id: string) =>
    api.get<{ product: Product }>(`/products/${id}`).then((r) => r.data.product),
  reviews: (id: string) =>
    api.get<{ items: ReviewItem[] }>(`/products/${id}/reviews`).then((r) => r.data.items),
  addReview: (id: string, payload: { rating: number; comment: string }) =>
    api.post<{ review: Review }>(`/products/${id}/reviews`, payload).then((r) => r.data.review),
};

export const ProductsAPI = USE_MOCK_API ? mockProducts : restProducts;

const restWishlist = {
  list: () => api.get("/wishlist").then((r) => r.data.items),
  add: (productId: string) =>
    api.post("/wishlist", { productId }).then((r) => r.data),
  remove: (productId: string) =>
    api.delete(`/wishlist/${productId}`).then((r) => r.data),
};

export const WishlistAPI = USE_MOCK_API ? mockWishlist : restWishlist;

const restOrders = {
  create: (payload: unknown) =>
    api.post("/orders/checkout", payload).then((r) => r.data),
  confirm: (orderId: string, sessionId: string) =>
    api.post<{ order: Order }>(`/orders/${orderId}/confirm`, { sessionId }).then((r) => r.data.order),
  myOrders: (page = 1, limit = 10) =>
    api.get("/orders/my", { params: { page, limit } }).then((r) => r.data),
  cancel: (orderId: string) =>
    api.post<{ order: Order }>(`/orders/${orderId}/cancel`).then((r) => r.data.order),
};

export const OrdersAPI = USE_MOCK_API ? mockOrders : restOrders;

const restReviews = {
  latest: () =>
    api.get<{ items: HomeReview[] }>("/reviews/latest").then((r) => r.data.items),
};

export const ReviewsAPI = USE_MOCK_API ? mockReviews : restReviews;

// ============================================================
// Seller
// ============================================================
const restSeller = {
  overview: () => api.get("/seller/overview").then((r) => r.data),
  analytics: (range = "30d") =>
    api.get("/seller/analytics", { params: { range } }).then((r) => r.data),
  products: (q: Record<string, unknown> = {}) =>
    api.get("/seller/products", { params: q }).then((r) => r.data),
  createProduct: (payload: ProductPayload) =>
    api.post("/seller/products", payload).then((r) => r.data.product),
  updateProduct: (id: string, payload: ProductPayload) =>
    api.patch(`/seller/products/${id}`, payload).then((r) => r.data.product),
  deleteProduct: (id: string) =>
    api.delete(`/seller/products/${id}`).then((r) => r.data),
  orders: (page = 1, limit = 10) =>
    api.get("/seller/orders", { params: { page, limit } }).then((r) => r.data),
  updateOrderStatus: (orderId: string, status: string) =>
    api.patch(`/seller/orders/${orderId}/status`, { status }).then((r) => r.data.order),
  requestSellerRole: () =>
    api.post("/seller/apply").then((r) => r.data),
};

export const SellerAPI = USE_MOCK_API ? mockSeller : restSeller;

// ============================================================
// Admin
// ============================================================
const restAdmin = {
  overview: () => api.get("/admin/overview").then((r) => r.data),
  users: (q: Record<string, unknown> = {}) =>
    api.get("/admin/users", { params: q }).then((r) => r.data),
  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data.user),
  toggleUserBlock: (id: string, blocked: boolean) =>
    api.patch(`/admin/users/${id}/block`, { blocked }).then((r) => r.data.user),
  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`).then((r) => r.data),
  products: (q: Record<string, unknown> = {}) =>
    api.get("/admin/products", { params: q }).then((r) => r.data),
  toggleProductVisibility: (id: string, hidden: boolean) =>
    api.patch(`/admin/products/${id}/visibility`, { hidden }).then((r) => r.data.product),
  deleteProduct: (id: string) =>
    api.delete(`/admin/products/${id}`).then((r) => r.data),
  orders: (q: Record<string, unknown> = {}) =>
    api.get("/admin/orders", { params: q }).then((r) => r.data),
  updateOrderStatus: (id: string, status: string) =>
    api.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data.order),
};

export const AdminAPI = USE_MOCK_API ? mockAdmin : restAdmin;
