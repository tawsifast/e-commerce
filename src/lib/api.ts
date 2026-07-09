import axios, { AxiosError } from "axios";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:5000/api";

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

export function getApiErrorMessage(err: unknown, fallback = "Something went wrong") {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

// ---- Types matching the expected Express/Mongo API contract ----

export type UserRole = "buyer" | "seller" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  role: UserRole;
  banned?: boolean;
  createdAt?: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  tags?: string[];
  specifications?: Record<string, string>;
  status: "pending" | "approved" | "rejected";
  rejectionFeedback?: string;
  seller: { _id: string; name: string; photo?: string } | string;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
}

export interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string; photo?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Order {
  _id: string;
  buyer: string | User;
  items: {
    product: Product | string;
    title: string;
    image?: string;
    price: number;
    quantity: number;
    seller: string;
  }[];
  totalAmount: number;
  address: { line1: string; city: string; state?: string; zip: string; country: string };
  contact: string;
  notes?: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  transactionId?: string;
  createdAt: string;
}

// ---- Endpoint helpers ----

export const AuthAPI = {
  register: (payload: { name: string; email: string; password: string; photo?: string }) =>
    api.post<{ token: string; user: User }>("/auth/register", payload).then((r) => r.data),
  login: (payload: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>("/auth/login", payload).then((r) => r.data),
  googleLogin: (idToken: string) =>
    api.post<{ token: string; user: User }>("/auth/google", { idToken }).then((r) => r.data),
  me: () => api.get<{ user: User }>("/auth/me").then((r) => r.data.user),
  updateProfile: (payload: Partial<Pick<User, "name" | "photo" | "email">>) =>
    api.patch<{ user: User }>("/auth/me", payload).then((r) => r.data.user),
};

export interface ProductQuery {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
  page?: number;
  limit?: number;
}

export const ProductsAPI = {
  list: (q: ProductQuery = {}) =>
    api
      .get<{ items: Product[]; total: number; page: number; pages: number }>("/products", { params: q })
      .then((r) => r.data),
  featured: () => api.get<{ items: Product[] }>("/products/featured").then((r) => r.data.items),
  bestSellers: () => api.get<{ items: Product[] }>("/products/best-sellers").then((r) => r.data.items),
  categories: () => api.get<{ items: { name: string; count: number; image?: string }[] }>("/products/categories").then((r) => r.data.items),
  get: (id: string) => api.get<{ product: Product }>(`/products/${id}`).then((r) => r.data.product),
  reviews: (id: string) => api.get<{ items: Review[] }>(`/products/${id}/reviews`).then((r) => r.data.items),
  addReview: (id: string, payload: { rating: number; comment: string }) =>
    api.post<{ review: Review }>(`/products/${id}/reviews`, payload).then((r) => r.data.review),
};

export const WishlistAPI = {
  list: () => api.get<{ items: Product[] }>("/wishlist").then((r) => r.data.items),
  add: (productId: string) => api.post("/wishlist", { productId }).then((r) => r.data),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`).then((r) => r.data),
};

export const OrdersAPI = {
  create: (payload: {
    items: { product: string; quantity: number }[];
    address: Order["address"];
    contact: string;
    notes?: string;
    couponCode?: string;
  }) => api.post<{ clientSecret: string; orderId: string }>("/orders/checkout", payload).then((r) => r.data),
  confirm: (orderId: string, paymentIntentId: string) =>
    api.post<{ order: Order }>(`/orders/${orderId}/confirm`, { paymentIntentId }).then((r) => r.data.order),
  myOrders: (page = 1, limit = 10) =>
    api
      .get<{ items: Order[]; total: number; page: number; pages: number }>("/orders/my", { params: { page, limit } })
      .then((r) => r.data),
};

export const ReviewsAPI = {
  latest: () => api.get<{ items: Review[] }>("/reviews/latest").then((r) => r.data.items),
};
