import { cookies } from "next/headers";
import type { Product, Review, User } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

const SESSION_COOKIE =
  process.env.BETTER_AUTH_COOKIE ?? "better-auth.session_token";

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export interface CategorySummary {
  name: string;
  count: number;
  image?: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface ProductQuery {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
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

// ============================================================
// Public catalogue
// ============================================================

export const getProducts = async (query: ProductQuery): Promise<ProductListResponse> => {
  try {
    const url = new URL(`${API_BASE_URL}/products`);
    if (query.search) url.searchParams.set("search", query.search);
    if (query.category) url.searchParams.set("category", query.category);
    if (query.brand) url.searchParams.set("brand", query.brand);
    if (query.minPrice !== undefined && query.minPrice !== null) url.searchParams.set("minPrice", String(query.minPrice));
    if (query.maxPrice !== undefined && query.maxPrice !== null) url.searchParams.set("maxPrice", String(query.maxPrice));
    if (query.sort) url.searchParams.set("sort", query.sort);
    if (query.page !== undefined && query.page !== null) url.searchParams.set("page", String(query.page));
    if (query.limit !== undefined && query.limit !== null) url.searchParams.set("limit", String(query.limit));

    const headers = new Headers();
    headers.set("Accept", "application/json");

    const response = await fetch(url, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw error;
  }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const headers = new Headers();
    headers.set("Accept", "application/json");

    const response = await fetch(`${API_BASE_URL}/products/featured`, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result.items;
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
    throw error;
  }
};

export const getBestSellingProducts = async (): Promise<Product[]> => {
  try {
    const headers = new Headers();
    headers.set("Accept", "application/json");

    const response = await fetch(`${API_BASE_URL}/products/best-sellers`, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result.items;
  } catch (error) {
    console.error("Failed to fetch best selling products:", error);
    throw error;
  }
};

export const getCategories = async (): Promise<CategorySummary[]> => {
  try {
    const headers = new Headers();
    headers.set("Accept", "application/json");

    const response = await fetch(`${API_BASE_URL}/products/categories`, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result.items;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const headers = new Headers();
    headers.set("Accept", "application/json");

    const response = await fetch(`${API_BASE_URL}/products/${id}`, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result.product;
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    throw error;
  }
};

export const getProductReviews = async (id: string): Promise<ReviewItem[]> => {
  try {
    const headers = new Headers();
    headers.set("Accept", "application/json");

    const response = await fetch(`${API_BASE_URL}/products/${id}/reviews`, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result.items;
  } catch (error) {
    console.error(`Failed to fetch reviews for product ${id}:`, error);
    throw error;
  }
};

export const getLatestReviews = async (): Promise<HomeReview[]> => {
  try {
    const headers = new Headers();
    headers.set("Accept", "application/json");

    const response = await fetch(`${API_BASE_URL}/reviews/latest`, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result.items;
  } catch (error) {
    console.error("Failed to fetch latest reviews:", error);
    throw error;
  }
};

// ============================================================
// Buyer dashboard
// ============================================================

export const getMyOrders = async (page = 1, limit = 10): Promise<OrdersPage> => {
  try {
    const cookieStore = await cookies();

    let sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie) {
      sessionCookie = cookieStore
        .getAll()
        .find((c) => c.name.includes("session") || c.name.includes("better-auth"));
    }

    const url = new URL(`${API_BASE_URL}/orders/my`);
    if (page !== undefined && page !== null) url.searchParams.set("page", String(page));
    if (limit !== undefined && limit !== null) url.searchParams.set("limit", String(limit));

    const tokenResponse = await fetch(`${BETTER_AUTH_URL}/api/auth/token`, {
      headers: sessionCookie ? { cookie: `${sessionCookie.name}=${sessionCookie.value}` } : {},
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const headers = new Headers();
    headers.set("Accept", "application/json");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw error;
  }
};

export const getWishlist = async (): Promise<Product[]> => {
  try {
    const cookieStore = await cookies();

    let sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie) {
      sessionCookie = cookieStore
        .getAll()
        .find((c) => c.name.includes("session") || c.name.includes("better-auth"));
    }

    const tokenResponse = await fetch(`${BETTER_AUTH_URL}/api/auth/token`, {
      headers: sessionCookie ? { cookie: `${sessionCookie.name}=${sessionCookie.value}` } : {},
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const headers = new Headers();
    headers.set("Accept", "application/json");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}/wishlist`, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result.items;
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    throw error;
  }
};

// ============================================================
// Seller dashboard
// ============================================================

export const getSellerOverview = async (): Promise<SellerOverview> => {
  try {
    const cookieStore = await cookies();

    let sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie) {
      sessionCookie = cookieStore
        .getAll()
        .find((c) => c.name.includes("session") || c.name.includes("better-auth"));
    }

    const tokenResponse = await fetch(`${BETTER_AUTH_URL}/api/auth/token`, {
      headers: sessionCookie ? { cookie: `${sessionCookie.name}=${sessionCookie.value}` } : {},
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const headers = new Headers();
    headers.set("Accept", "application/json");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}/seller/overview`, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch seller overview:", error);
    throw error;
  }
};

export const getSellerAnalytics = async (range = "30d"): Promise<SellerAnalytics> => {
  try {
    const cookieStore = await cookies();

    let sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie) {
      sessionCookie = cookieStore
        .getAll()
        .find((c) => c.name.includes("session") || c.name.includes("better-auth"));
    }

    const url = new URL(`${API_BASE_URL}/seller/analytics`);
    if (range !== undefined && range !== null && range !== "") url.searchParams.set("range", range);

    const tokenResponse = await fetch(`${BETTER_AUTH_URL}/api/auth/token`, {
      headers: sessionCookie ? { cookie: `${sessionCookie.name}=${sessionCookie.value}` } : {},
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const headers = new Headers();
    headers.set("Accept", "application/json");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch seller analytics:", error);
    throw error;
  }
};

export const getSellerProducts = async (): Promise<(Product & { sold?: number })[]> => {
  try {
    const cookieStore = await cookies();

    let sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie) {
      sessionCookie = cookieStore
        .getAll()
        .find((c) => c.name.includes("session") || c.name.includes("better-auth"));
    }

    const tokenResponse = await fetch(`${BETTER_AUTH_URL}/api/auth/token`, {
      headers: sessionCookie ? { cookie: `${sessionCookie.name}=${sessionCookie.value}` } : {},
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const headers = new Headers();
    headers.set("Accept", "application/json");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}/seller/products`, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result.items;
  } catch (error) {
    console.error("Failed to fetch seller products:", error);
    throw error;
  }
};

export const getSellerOrders = async (page = 1, limit = 10): Promise<SellerOrdersPage> => {
  try {
    const cookieStore = await cookies();

    let sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie) {
      sessionCookie = cookieStore
        .getAll()
        .find((c) => c.name.includes("session") || c.name.includes("better-auth"));
    }

    const url = new URL(`${API_BASE_URL}/seller/orders`);
    if (page !== undefined && page !== null) url.searchParams.set("page", String(page));
    if (limit !== undefined && limit !== null) url.searchParams.set("limit", String(limit));

    const tokenResponse = await fetch(`${BETTER_AUTH_URL}/api/auth/token`, {
      headers: sessionCookie ? { cookie: `${sessionCookie.name}=${sessionCookie.value}` } : {},
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const headers = new Headers();
    headers.set("Accept", "application/json");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch seller orders:", error);
    throw error;
  }
};

// ============================================================
// Admin dashboard
// ============================================================

export const getAdminOverview = async (): Promise<AdminOverview> => {
  try {
    const cookieStore = await cookies();

    let sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie) {
      sessionCookie = cookieStore
        .getAll()
        .find((c) => c.name.includes("session") || c.name.includes("better-auth"));
    }

    const tokenResponse = await fetch(`${BETTER_AUTH_URL}/api/auth/token`, {
      headers: sessionCookie ? { cookie: `${sessionCookie.name}=${sessionCookie.value}` } : {},
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const headers = new Headers();
    headers.set("Accept", "application/json");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}/admin/overview`, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch admin overview:", error);
    throw error;
  }
};

export const getAdminUsers = async (page = 1, limit = 15): Promise<AdminUsersPage> => {
  try {
    const cookieStore = await cookies();

    let sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie) {
      sessionCookie = cookieStore
        .getAll()
        .find((c) => c.name.includes("session") || c.name.includes("better-auth"));
    }

    const url = new URL(`${API_BASE_URL}/admin/users`);
    if (page !== undefined && page !== null) url.searchParams.set("page", String(page));
    if (limit !== undefined && limit !== null) url.searchParams.set("limit", String(limit));

    const tokenResponse = await fetch(`${BETTER_AUTH_URL}/api/auth/token`, {
      headers: sessionCookie ? { cookie: `${sessionCookie.name}=${sessionCookie.value}` } : {},
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const headers = new Headers();
    headers.set("Accept", "application/json");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch admin users:", error);
    throw error;
  }
};

export const getAdminProducts = async (page = 1, limit = 15): Promise<AdminProductsPage> => {
  try {
    const cookieStore = await cookies();

    let sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie) {
      sessionCookie = cookieStore
        .getAll()
        .find((c) => c.name.includes("session") || c.name.includes("better-auth"));
    }

    const url = new URL(`${API_BASE_URL}/admin/products`);
    if (page !== undefined && page !== null) url.searchParams.set("page", String(page));
    if (limit !== undefined && limit !== null) url.searchParams.set("limit", String(limit));

    const tokenResponse = await fetch(`${BETTER_AUTH_URL}/api/auth/token`, {
      headers: sessionCookie ? { cookie: `${sessionCookie.name}=${sessionCookie.value}` } : {},
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const headers = new Headers();
    headers.set("Accept", "application/json");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch admin products:", error);
    throw error;
  }
};

export const getAdminOrders = async (page = 1, limit = 15): Promise<AdminOrdersPage> => {
  try {
    const cookieStore = await cookies();

    let sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie) {
      sessionCookie = cookieStore
        .getAll()
        .find((c) => c.name.includes("session") || c.name.includes("better-auth"));
    }

    const url = new URL(`${API_BASE_URL}/admin/orders`);
    if (page !== undefined && page !== null) url.searchParams.set("page", String(page));
    if (limit !== undefined && limit !== null) url.searchParams.set("limit", String(limit));

    const tokenResponse = await fetch(`${BETTER_AUTH_URL}/api/auth/token`, {
      headers: sessionCookie ? { cookie: `${sessionCookie.name}=${sessionCookie.value}` } : {},
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const headers = new Headers();
    headers.set("Accept", "application/json");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, { headers, cache: "no-store" });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message ?? "Request failed");
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch admin orders:", error);
    throw error;
  }
};
