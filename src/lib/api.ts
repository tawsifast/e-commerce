import type { Order, Product, Review, User } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; params?: Record<string, unknown> } = {}
): Promise<T> {
  const { method = "GET", body, params } = options;

  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Network error — check the API server");
  }

  if (!res.ok) {
    const data: unknown = await parseJson(res).catch(() => null);
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : data && typeof data === "object" && "error" in data
          ? String((data as { error: unknown }).error)
          : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return parseJson<T>(res);
}

export function getApiErrorMessage(err: unknown, fallback = "Something went wrong") {
  if (err instanceof Error) return err.message;
  return fallback;
}

// ============================================================
// API endpoint helpers — expected REST contract for your
// Express + Mongo backend. All requests go through NEXT_PUBLIC_API_BASE_URL.
// ============================================================

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

const restProducts = {
  list: (q: Record<string, unknown> = {}) =>
    request<ProductListResponse>("/products", { params: q }),
  featured: () =>
    request<{ items: Product[] }>("/products/featured").then((r) => r.items),
  bestSellers: () =>
    request<{ items: Product[] }>("/products/best-sellers").then((r) => r.items),
  categories: () =>
    request<{ items: CategorySummary[] }>("/products/categories").then((r) => r.items),
  get: (id: string) =>
    request<{ product: Product }>(`/products/${id}`).then((r) => r.product),
  reviews: (id: string) =>
    request<{ items: ReviewItem[] }>(`/products/${id}/reviews`).then((r) => r.items),
  addReview: (id: string, payload: { rating: number; comment: string }) =>
    request<{ review: Review }>(`/products/${id}/reviews`, { method: "POST", body: payload }).then((r) => r.review),
};

export const ProductsAPI = restProducts;

const restWishlist = {
  list: () => request<{ items: Product[] }>("/wishlist").then((r) => r.items),
  add: (productId: string) =>
    request<unknown>("/wishlist", { method: "POST", body: { productId } }),
  remove: (productId: string) =>
    request<unknown>(`/wishlist/${productId}`, { method: "DELETE" }),
};

export const WishlistAPI = restWishlist;

const restOrders = {
  create: (payload: unknown) =>
    request("/orders/checkout", { method: "POST", body: payload }),
  confirm: (orderId: string, sessionId: string) =>
    request<{ order: Order }>(`/orders/${orderId}/confirm`, { method: "POST", body: { sessionId } }).then((r) => r.order),
  myOrders: (page = 1, limit = 10) =>
    request(`/orders/my`, { params: { page, limit } }),
  cancel: (orderId: string) =>
    request<{ order: Order }>(`/orders/${orderId}/cancel`, { method: "POST" }).then((r) => r.order),
};

export const OrdersAPI = restOrders;

const restReviews = {
  latest: () =>
    request<{ items: HomeReview[] }>("/reviews/latest").then((r) => r.items),
};

export const ReviewsAPI = restReviews;

// ============================================================
// Seller
// ============================================================
const restSeller = {
  overview: () => request<unknown>("/seller/overview"),
  analytics: (range = "30d") =>
    request<unknown>("/seller/analytics", { params: { range } }),
  products: (q: Record<string, unknown> = {}) =>
    request<unknown>("/seller/products", { params: q }),
  createProduct: (payload: ProductPayload) =>
    request<{ product: unknown }>("/seller/products", { method: "POST", body: payload }).then((r) => r.product),
  updateProduct: (id: string, payload: ProductPayload) =>
    request<{ product: unknown }>(`/seller/products/${id}`, { method: "PATCH", body: payload }).then((r) => r.product),
  deleteProduct: (id: string) =>
    request<unknown>(`/seller/products/${id}`, { method: "DELETE" }),
  orders: (page = 1, limit = 10) =>
    request<unknown>("/seller/orders", { params: { page, limit } }),
  updateOrderStatus: (orderId: string, status: string) =>
    request<{ order: unknown }>(`/seller/orders/${orderId}/status`, { method: "PATCH", body: { status } }).then((r) => r.order),
  requestSellerRole: () =>
    request<unknown>("/seller/apply", { method: "POST" }),
};

export const SellerAPI = restSeller;

// ============================================================
// Admin
// ============================================================
const restAdmin = {
  overview: () => request<unknown>("/admin/overview"),
  users: (q: Record<string, unknown> = {}) =>
    request<unknown>("/admin/users", { params: q }),
  updateUserRole: (id: string, role: string) =>
    request<{ user: unknown }>(`/admin/users/${id}/role`, { method: "PATCH", body: { role } }).then((r) => r.user),
  toggleUserBlock: (id: string, blocked: boolean) =>
    request<{ user: unknown }>(`/admin/users/${id}/block`, { method: "PATCH", body: { blocked } }).then((r) => r.user),
  deleteUser: (id: string) =>
    request<unknown>(`/admin/users/${id}`, { method: "DELETE" }),
  products: (q: Record<string, unknown> = {}) =>
    request<unknown>("/admin/products", { params: q }),
  toggleProductVisibility: (id: string, hidden: boolean) =>
    request<{ product: unknown }>(`/admin/products/${id}/visibility`, { method: "PATCH", body: { hidden } }).then((r) => r.product),
  deleteProduct: (id: string) =>
    request<unknown>(`/admin/products/${id}`, { method: "DELETE" }),
  orders: (q: Record<string, unknown> = {}) =>
    request<unknown>("/admin/orders", { params: q }),
  updateOrderStatus: (id: string, status: string) =>
    request<{ order: unknown }>(`/admin/orders/${id}/status`, { method: "PATCH", body: { status } }).then((r) => r.order),
};

export const AdminAPI = restAdmin;