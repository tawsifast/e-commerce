import { cookies } from "next/headers";
import type { Product, Review, User } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

const SESSION_COOKIE =
  process.env.BETTER_AUTH_COOKIE ?? "better-auth.session_token";

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

export interface OrderItemDoc {
  productId: string;
  title: string;
  image?: string;
  price: number;
  quantity: number;
  seller: { _id: string; name: string };
}

export interface OrderDoc {
  _id: string;
  buyer: { _id: string; name: string };
  items: OrderItemDoc[];
  totalAmount: number;
  total: number;
  status: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  address: {
    line1?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  contact?: string;
  notes?: string;
}

export interface OrdersPage {
  items: OrderDoc[];
  total: number;
  page: number;
  pages: number;
}

export interface SellerOverview {
  revenue: number;
  revenueDelta: number;
  orders: number;
  ordersDelta: number;
  productsCount: number;
  avgRating: number;
}

export interface SellerAnalytics {
  salesSeries: { date: string; revenue: number }[];
  topProducts: { title: string; sold: number }[];
  categoryBreakdown: { name: string; value: number }[];
}

export interface SellerOrder {
  _id: string;
  buyer?: { name?: string };
  total?: number;
  createdAt?: string;
  status: string;
}

export interface SellerOrdersPage {
  items: SellerOrder[];
  totalPages: number;
}

export interface AdminOverview {
  usersCount: number;
  sellersCount: number;
  productsCount: number;
  gmv: number;
  revenueSeries: { date: string; revenue: number }[];
}

export interface AdminOrder {
  _id: string;
  buyer?: { name?: string };
  total?: number;
  createdAt?: string;
  status: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  photo?: string;
  blocked?: boolean;
  createdAt?: string;
}

export interface AdminUsersPage {
  items: AdminUser[];
  totalPages: number;
}

export interface AdminProduct {
  _id: string;
  title: string;
  price: number;
  discountPrice?: number;
  hidden?: boolean;
  images?: string[];
  seller?: { _id: string; name: string };
}

export interface AdminProductsPage {
  items: AdminProduct[];
  totalPages: number;
}

export interface AdminOrdersPage {
  items: AdminOrder[];
  totalPages: number;
}

async function serverFetch<T>(
  path: string,
  qs?: Record<string, string | number | undefined | null>,
): Promise<T> {
  const cookieStore = await cookies();

  let sessionCookie = cookieStore.get(SESSION_COOKIE);
  if (!sessionCookie) {
    sessionCookie = cookieStore
      .getAll()
      .find((c) => c.name.includes("session") || c.name.includes("better-auth"));
  }

  const url = new URL(`${API_BASE_URL}${path}`);
  if (qs) {
    for (const [k, v] of Object.entries(qs)) {
      if (v == null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(sessionCookie ? { cookie: `${sessionCookie.name}=${sessionCookie.value}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `API request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const serverAPI = {
  products: (q: Record<string, string | number | undefined> = {}) =>
    serverFetch<ProductListResponse>("/products", q),

  featured: () =>
    serverFetch<{ items: Product[] }>("/products/featured").then((r) => r.items),

  bestSellers: () =>
    serverFetch<{ items: Product[] }>("/products/best-sellers").then((r) => r.items),

  categories: () =>
    serverFetch<{ items: CategorySummary[] }>("/products/categories").then((r) => r.items),

  product: (id: string) =>
    serverFetch<{ product: Product }>(`/products/${id}`).then((r) => r.product),

  reviews: (id: string) =>
    serverFetch<{ items: ReviewItem[] }>(`/products/${id}/reviews`).then((r) => r.items),

  latestReviews: () =>
    serverFetch<{ items: HomeReview[] }>("/reviews/latest").then((r) => r.items),

  myOrders: (page = 1, limit = 10) =>
    serverFetch<OrdersPage>("/orders/my", { page, limit }),

  wishlist: () =>
    serverFetch<{ items: Product[] }>("/wishlist").then((r) => r.items),

  sellerOverview: () => serverFetch<SellerOverview>("/seller/overview"),

  sellerAnalytics: (range = "30d") =>
    serverFetch<SellerAnalytics>("/seller/analytics", { range }),

  sellerProducts: () =>
    serverFetch<{ items: (Product & { sold?: number })[] }>("/seller/products").then(
      (r) => r.items,
    ),

  sellerOrders: (page = 1, limit = 10) =>
    serverFetch<SellerOrdersPage>("/seller/orders", { page, limit }),

  adminOverview: () => serverFetch<AdminOverview>("/admin/overview"),

  adminUsers: (page = 1, limit = 15) =>
    serverFetch<AdminUsersPage>("/admin/users", { page, limit }),

  adminProducts: (page = 1, limit = 15) =>
    serverFetch<AdminProductsPage>("/admin/products", { page, limit }),

  adminOrders: (page = 1, limit = 15) =>
    serverFetch<AdminOrdersPage>("/admin/orders", { page, limit }),
};