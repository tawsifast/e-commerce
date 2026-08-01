export interface SellerSummary {
  _id: string;
  name: string;
  photo?: string;
}

export interface Product {
  _id: string;
  title: string;
  brand?: string;
  category?: string;
  price: number;
  discountPrice?: number | null;
  images?: string[];
  createdAt: string;
  averageRating?: number;
  reviewCount?: number;
  stock: number;
  description?: string;
  seller?: string | SellerSummary;
  specifications?: Record<string, unknown>;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "buyer" | "seller";
  photo?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Order {
  _id: string;
  user: string | User;
  items: CartItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}
