import type { Order, Product, Review } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

export function getApiErrorMessage(err: unknown, fallback = "Something went wrong") {
  if (err instanceof Error) return err.message;
  return fallback;
}

export interface CategorySummary {
  name: string;
  count: number;
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

export interface CreateOrderPayload {
  items: { product: string; quantity: number }[];
  address: {
    line1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  contact: string;
  notes?: string;
}

export interface CreatedOrder {
  orderId: string;
  items: { title: string; image?: string; price: number; quantity: number }[];
}

// ============================================================
// Buyers
// ============================================================

export const addReview = async (productId: string, payload: { rating: number; comment: string }): Promise<Review> => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result.review;
  } catch (error) {
    console.error("Failed to add review:", error);
    throw error;
  }
};

export const getWishlist = async (): Promise<Product[]> => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: { authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result.items;
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    throw error;
  }
};

export const addToWishlist = async (productId: string) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ productId }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    throw error;
  }
};

export const removeFromWishlist = async (productId: string) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Failed to remove from wishlist:", error);
    throw error;
  }
};

export const createOrder = async (payload: CreateOrderPayload) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error;
  }
};

export const confirmOrder = async (orderId: string, sessionId: string): Promise<Order> => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ sessionId }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result.order;
  } catch (error) {
    console.error("Failed to confirm order:", error);
    throw error;
  }
};

export const getMyOrders = async (page = 1, limit = 10) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const url = new URL(`${API_BASE_URL}/orders/my`);
    if (page !== undefined && page !== null) url.searchParams.set("page", String(page));
    if (limit !== undefined && limit !== null) url.searchParams.set("limit", String(limit));

    const response = await fetch(url, {
      headers: { authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw error;
  }
};

export const cancelOrder = async (orderId: string) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Failed to cancel order:", error);
    throw error;
  }
};

// ============================================================
// Seller
// ============================================================

export const getSellerOverview = async () => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/seller/overview`, {
      headers: { authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch seller overview:", error);
    throw error;
  }
};

export const getSellerAnalytics = async (range = "30d") => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const url = new URL(`${API_BASE_URL}/seller/analytics`);
    if (range !== undefined && range !== null && range !== "") url.searchParams.set("range", range);

    const response = await fetch(url, {
      headers: { authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch seller analytics:", error);
    throw error;
  }
};

export const getSellerProducts = async () => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/seller/products`, {
      headers: { authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result.items;
  } catch (error) {
    console.error("Failed to fetch seller products:", error);
    throw error;
  }
};

export const createProduct = async (payload: ProductPayload) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/seller/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Failed to create product:", error);
    throw error;
  }
};

export const updateProduct = async (id: string, payload: ProductPayload) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/seller/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Failed to update product:", error);
    throw error;
  }
};

export const deleteSellerProduct = async (id: string) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/seller/products/${id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw error;
  }
};

export const getSellerOrders = async (page = 1, limit = 10) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const url = new URL(`${API_BASE_URL}/seller/orders`);
    if (page !== undefined && page !== null) url.searchParams.set("page", String(page));
    if (limit !== undefined && limit !== null) url.searchParams.set("limit", String(limit));

    const response = await fetch(url, {
      headers: { authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch seller orders:", error);
    throw error;
  }
};

export const updateSellerOrderStatus = async (orderId: string, status: string) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/seller/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ status }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw error;
  }
};

// ============================================================
// Admin
// ============================================================

export const getAdminOverview = async () => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/admin/overview`, {
      headers: { authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch admin overview:", error);
    throw error;
  }
};

export const getAdminUsers = async (query: { page: number; limit: number }) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const url = new URL(`${API_BASE_URL}/admin/users`);
    if (query.page !== undefined && query.page !== null) url.searchParams.set("page", String(query.page));
    if (query.limit !== undefined && query.limit !== null) url.searchParams.set("limit", String(query.limit));

    const response = await fetch(url, {
      headers: { authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch admin users:", error);
    throw error;
  }
};

export const updateUserRole = async (id: string, role: string) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ role }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Failed to update user role:", error);
    throw error;
  }
};

export const toggleUserBlock = async (id: string, blocked: boolean) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/admin/users/${id}/block`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ blocked }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Failed to update user:", error);
    throw error;
  }
};

export const deleteAdminUser = async (id: string) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw error;
  }
};

export const getAdminProducts = async (query: { page: number; limit: number }) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const url = new URL(`${API_BASE_URL}/admin/products`);
    if (query.page !== undefined && query.page !== null) url.searchParams.set("page", String(query.page));
    if (query.limit !== undefined && query.limit !== null) url.searchParams.set("limit", String(query.limit));

    const response = await fetch(url, {
      headers: { authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch admin products:", error);
    throw error;
  }
};

export const toggleProductVisibility = async (id: string, hidden: boolean) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/admin/products/${id}/visibility`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ hidden }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Failed to update product:", error);
    throw error;
  }
};

export const deleteAdminProduct = async (id: string) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw error;
  }
};

export const getAdminOrders = async (query: { page: number; limit: number }) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const url = new URL(`${API_BASE_URL}/admin/orders`);
    if (query.page !== undefined && query.page !== null) url.searchParams.set("page", String(query.page));
    if (query.limit !== undefined && query.limit !== null) url.searchParams.set("limit", String(query.limit));

    const response = await fetch(url, {
      headers: { authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch admin orders:", error);
    throw error;
  }
};

export const updateAdminOrderStatus = async (id: string, status: string) => {
  try {
    const tokenResponse = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json().catch(() => null);
    const token = tokenBody?.token;

    const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ status }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw error;
  }
};