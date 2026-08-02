// ============================================================
// Mock API — in-memory dummy data backed by localStorage.
//
// Mirrors the shape of every endpoint in ./api.ts so the app can
// run without the Express + Mongo backend. State (users, products,
// orders, wishlist, reviews, …) persists in localStorage under
// DB_KEY; reset it (or clear site data) to reseed.
//
// When the real backend is attached, disable this layer by setting
// NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_USE_MOCK=false.
// ============================================================

import type {
  AuthResponse,
  CategorySummary,
  HomeReview,
  LoginPayload,
  ProductListResponse,
  ProductPayload,
  RegisterPayload,
  ReviewItem,
} from "./api";
import type { Order, Product, User } from "./types";

const DB_KEY = "marketa_mock_db_v1";
const TOKEN_PREFIX = "mock.";
const TOKEN_KEY = "marketa_token"; // must match TOKEN_KEY in api.ts

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface MockUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "buyer" | "seller";
  photo?: string;
  password: string;
  blocked: boolean;
  createdAt: string;
}

interface MockOrderItem {
  productId: string;
  title: string;
  image?: string;
  price: number;
  quantity: number;
  seller: { _id: string; name: string };
}

interface MockOrder {
  _id: string;
  buyer: { _id: string; name: string };
  items: MockOrderItem[];
  totalAmount: number;
  total: number;
  status: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  address: { line1: string; city: string; country: string };
}

interface MockDB {
  users: MockUser[];
  products: Product[];
  reviews: Record<string, ReviewItem[]>;
  orders: MockOrder[];
  wishlist: Record<string, string[]>;
  sold: Record<string, number>;
  hidden: Record<string, boolean>;
  featured: string[];
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function uid(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

function delay(ms = 250) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function toUser(u: MockUser): User {
  return { _id: u._id, name: u.name, email: u.email, role: u.role, photo: u.photo };
}

function makeToken(userId: string) {
  return `${TOKEN_PREFIX}${userId}.${Math.random().toString(36).slice(2, 10)}`;
}

function currentTokenUserId(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!token || !token.startsWith(TOKEN_PREFIX)) return null;
  return token.split(".")[1] ?? null;
}

function currentMockUser(db: MockDB): MockUser {
  return db.users.find((u) => u._id === currentTokenUserId()) ?? db.users[0];
}

function productSellerId(p: Product): string {
  if (typeof p.seller === "object" && p.seller) return p.seller._id;
  return typeof p.seller === "string" ? p.seller : "";
}

function paginate<T>(items: T[], page: number, limit: number): { items: T[]; total: number; page: number; pages: number } {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total, page, pages };
}

function loadDB(): MockDB {
  if (typeof window === "undefined") return seedDB();
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as MockDB;
  } catch {
    // corrupted storage — fall through and reseed
  }
  const db = seedDB();
  saveDB(db);
  return db;
}

function saveDB(db: MockDB) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // storage full / unavailable — stay in-memory
  }
}

// ------------------------------------------------------------
// Seed data
// ------------------------------------------------------------

function seedDB(): MockDB {
  const users: MockUser[] = [
    { _id: "u1", name: "Ava Reyes", email: "admin@marketa.dev", role: "admin", password: "demo", blocked: false, createdAt: "2026-01-08T10:00:00.000Z" },
    { _id: "u2", name: "Noor Hassan", email: "seller@marketa.dev", role: "seller", password: "demo", blocked: false, createdAt: "2026-02-14T10:00:00.000Z" },
    { _id: "u3", name: "Liam Chen", email: "buyer@marketa.dev", role: "buyer", password: "demo", blocked: false, createdAt: "2026-03-02T10:00:00.000Z" },
    { _id: "u4", name: "Maya Patel", email: "maya@example.com", role: "buyer", password: "demo", blocked: false, createdAt: "2026-03-19T10:00:00.000Z" },
    { _id: "u5", name: "Jonas Weber", email: "jonas@example.com", role: "seller", password: "demo", blocked: false, createdAt: "2026-02-27T10:00:00.000Z" },
  ];

  const sellerNoor = { _id: "u2", name: "Noor Hassan" };
  const sellerJonas = { _id: "u5", name: "Jonas Weber" };

  const products: Product[] = [
    {
      _id: "p1", title: "Bloom Facial Oil", brand: "Botanic Rituals", category: "Skincare",
      price: 58, discountPrice: 48, stock: 24,
      images: ["https://picsum.photos/seed/marketa-p1/800/800", "https://picsum.photos/seed/marketa-p1b/800/800"],
      createdAt: "2026-05-21T10:00:00.000Z", averageRating: 4.8, reviewCount: 12,
      description: "A lightweight, rose-scented facial oil that sinks in fast. Cold-pressed rosehip, jojoba and a whisper of vitamin E — three drops is all your skin needs.",
      seller: sellerNoor,
      specifications: { Volume: "30 ml", "Skin type": "All types", Ingredients: "Rosehip, jojoba, vitamin E" },
    },
    {
      _id: "p2", title: "Earthen Pour-Over Set", brand: "Kiln & Co.", category: "Ceramics",
      price: 64, stock: 9,
      images: ["https://picsum.photos/seed/marketa-p2/800/800", "https://picsum.photos/seed/marketa-p2b/800/800"],
      createdAt: "2026-04-03T10:00:00.000Z", averageRating: 4.6, reviewCount: 7,
      description: "Hand-thrown stoneware dripper and carafe, glazed in warm speckled earth tones. Each set is one of a kind — slight variations are part of the charm.",
      seller: sellerNoor,
      specifications: { Capacity: "600 ml", Material: "Stoneware", "Dishwasher safe": "Yes" },
    },
    {
      _id: "p3", title: "Linen Table Runner", brand: "Atelier Rye", category: "Home",
      price: 38, discountPrice: 30, stock: 41,
      images: ["https://picsum.photos/seed/marketa-p3/800/800"],
      createdAt: "2026-07-27T10:00:00.000Z", averageRating: 4.5, reviewCount: 5,
      description: "Washed European flax linen with a soft, lived-in drape. Frayed edges, natural undyed hue — pairs with everything on your table.",
      seller: sellerNoor,
      specifications: { Length: "180 cm", Width: "38 cm", Material: "100% linen" },
    },
    {
      _id: "p4", title: "Rainwater Body Wash", brand: "Botanic Rituals", category: "Skincare",
      price: 24, stock: 60,
      images: ["https://picsum.photos/seed/marketa-p4/800/800"],
      createdAt: "2026-06-09T10:00:00.000Z", averageRating: 4.7, reviewCount: 9,
      description: "A gel body wash that lathers into soft cloud foam. Oat milk, cucumber water and a fresh rain scent — gentle enough for daily use.",
      seller: sellerJonas,
    },
    {
      _id: "p5", title: "Maple Cutting Board", brand: "Hearth & Handle", category: "Home",
      price: 72, stock: 12,
      images: ["https://picsum.photos/seed/marketa-p5/800/800", "https://picsum.photos/seed/marketa-p5b/800/800"],
      createdAt: "2026-04-27T10:00:00.000Z", averageRating: 4.9, reviewCount: 15,
      description: "End-grain maple board that's gentle on knives and handsome on the counter. Oiled with food-safe mineral oil, with a juice groove and finger grip.",
      seller: sellerNoor,
      specifications: { Size: "40 × 30 cm", Thickness: "4 cm", Wood: "Hard maple" },
    },
    {
      _id: "p6", title: "Scented Candle — Cedar & Smoke", brand: "Ember", category: "Fragrance",
      price: 32, discountPrice: 26, stock: 33,
      images: ["https://picsum.photos/seed/marketa-p6/800/800"],
      createdAt: "2026-07-29T10:00:00.000Z", averageRating: 4.4, reviewCount: 4,
      description: "Hand-poured coconut-soy wax candle in a reusable amber jar. Cedar, vetiver and a thread of smoke — roughly 45 hours of burn time.",
      seller: sellerJonas,
      specifications: { "Burn time": "45 h", Wax: "Coconut-soy", Scent: "Cedar, vetiver, smoke" },
    },
    {
      _id: "p7", title: "Wool Throw Blanket", brand: "Atelier Rye", category: "Home",
      price: 120, discountPrice: 95, stock: 7,
      images: ["https://picsum.photos/seed/marketa-p7/800/800", "https://picsum.photos/seed/marketa-p7b/800/800"],
      createdAt: "2026-03-30T10:00:00.000Z", averageRating: 5, reviewCount: 6,
      description: "Loosely woven lambswool throw, brushed on both sides. Warm without weight — the kind of blanket you never fold back up.",
      seller: sellerNoor,
      specifications: { Size: "130 × 180 cm", Material: "Lambswool", Care: "Dry clean" },
    },
    {
      _id: "p8", title: "Notebook Set — Three Pocket Sizes", brand: "Inkwell", category: "Stationery",
      price: 28, stock: 88,
      images: ["https://picsum.photos/seed/marketa-p8/800/800"],
      createdAt: "2026-05-05T10:00:00.000Z", averageRating: 4.6, reviewCount: 11,
      description: "Three lay-flat notebooks with 120gsm paper that takes fountain pen ink without bleed-through. Recycled kraft covers, thread-bound.",
      seller: sellerJonas,
      specifications: { Pages: "120 each", Paper: "120 gsm", Binding: "Lay-flat" },
    },
    {
      _id: "p9", title: "Ceramic Mug — Ochre", brand: "Kiln & Co.", category: "Ceramics",
      price: 26, discountPrice: 21, stock: 55,
      images: ["https://picsum.photos/seed/marketa-p9/800/800"],
      createdAt: "2026-06-18T10:00:00.000Z", averageRating: 4.3, reviewCount: 8,
      description: "Generous 350 ml mug in matte ochre glaze with a speckled rim. Wheel-thrown, fired twice, and fits most cup-holders.",
      seller: sellerNoor,
    },
    {
      _id: "p10", title: "Linen Shirt — Natural", brand: "Slow Thread", category: "Apparel",
      price: 89, stock: 18,
      images: ["https://picsum.photos/seed/marketa-p10/800/800", "https://picsum.photos/seed/marketa-p10b/800/800"],
      createdAt: "2026-04-11T10:00:00.000Z", averageRating: 4.7, reviewCount: 5,
      description: "Relaxed-fit shirt in mid-weight European linen. Naturally breathable, gets softer with every wash. Sizes XS–XL.",
      seller: sellerJonas,
      specifications: { Fit: "Relaxed", Material: "100% linen", Sizes: "XS–XL" },
    },
    {
      _id: "p11", title: "Honey & Oat Soap Bar", brand: "Botanic Rituals", category: "Skincare",
      price: 12, stock: 120,
      images: ["https://picsum.photos/seed/marketa-p11/800/800"],
      createdAt: "2026-07-30T10:00:00.000Z", averageRating: 4.2, reviewCount: 3,
      description: "Cold-process bar with raw honey, ground oats and shea butter. Gently exfoliating and quietly moisturising — plastic-free wrapped.",
      seller: sellerJonas,
    },
    {
      _id: "p12", title: "Brass Bookends", brand: "Hearth & Handle", category: "Stationery",
      price: 45, stock: 14,
      images: ["https://picsum.photos/seed/marketa-p12/800/800"],
      createdAt: "2026-05-27T10:00:00.000Z", averageRating: 4.4, reviewCount: 2,
      description: "Solid-cast brass bookends with a brushed satin finish. Substantial enough to hold a shelf of hardcovers upright.",
      seller: sellerNoor,
      specifications: { Material: "Solid brass", Height: "18 cm", Finish: "Brushed satin" },
    },
  ];

  const reviews: Record<string, ReviewItem[]> = {
    p1: [
      { _id: "r1", productId: "p1", userId: "u3", rating: 5, comment: "The quality genuinely surprised me. The packaging alone felt like a gift.", createdAt: "2026-07-10T09:00:00.000Z", user: toUser(users[2]) },
      { _id: "r2", productId: "p1", userId: "u4", rating: 4, comment: "Lovely scent, a little goes a long way. Wish the bottle were bigger!", createdAt: "2026-07-21T14:30:00.000Z", user: toUser(users[3]) },
      { _id: "r3", productId: "p1", userId: "u3", rating: 5, comment: "Repurchased twice now. My dry patches are gone.", createdAt: "2026-07-28T11:00:00.000Z", user: toUser(users[2]) },
    ],
    p5: [
      { _id: "r4", productId: "p5", userId: "u3", rating: 5, comment: "Solid, beautiful, and my knives thank me.", createdAt: "2026-06-14T10:00:00.000Z", user: toUser(users[2]) },
      { _id: "r5", productId: "p5", userId: "u4", rating: 5, comment: "Heavier than expected — in the best way. Stunning grain.", createdAt: "2026-07-02T16:45:00.000Z", user: toUser(users[3]) },
    ],
    p8: [
      { _id: "r6", productId: "p8", userId: "u3", rating: 4, comment: "Paper takes fountain pen beautifully. Would love more cover colors.", createdAt: "2026-06-22T09:15:00.000Z", user: toUser(users[2]) },
      { _id: "r7", productId: "p8", userId: "u4", rating: 5, comment: "My favourite everyday notebooks. They stack neatly on my desk.", createdAt: "2026-07-09T13:20:00.000Z", user: toUser(users[3]) },
    ],
    p7: [
      { _id: "r8", productId: "p7", userId: "u3", rating: 5, comment: "Kept the couch to myself all winter. That says everything.", createdAt: "2026-07-12T18:00:00.000Z", user: toUser(users[2]) },
    ],
    p10: [
      { _id: "r9", productId: "p10", userId: "u4", rating: 4, comment: "Great drape, slightly large in the shoulders — size down if between sizes.", createdAt: "2026-06-30T08:40:00.000Z", user: toUser(users[3]) },
    ],
  };

  const orders: MockOrder[] = [
    {
      _id: "o1", buyer: { _id: "u3", name: "Liam Chen" },
      items: [
        { productId: "p1", title: "Bloom Facial Oil", image: products[0].images?.[0], price: 48, quantity: 1, seller: sellerNoor },
        { productId: "p9", title: "Ceramic Mug — Ochre", image: products[8].images?.[0], price: 21, quantity: 1, seller: sellerNoor },
      ],
      totalAmount: 69, total: 69, status: "delivered", orderStatus: "delivered", paymentStatus: "paid",
      createdAt: "2026-05-12T10:30:00.000Z", address: { line1: "18 Birch Lane", city: "Portland", country: "United States" },
    },
    {
      _id: "o2", buyer: { _id: "u4", name: "Maya Patel" },
      items: [{ productId: "p4", title: "Rainwater Body Wash", image: products[3].images?.[0], price: 24, quantity: 2, seller: sellerJonas }],
      totalAmount: 48, total: 48, status: "delivered", orderStatus: "delivered", paymentStatus: "paid",
      createdAt: "2026-05-28T09:00:00.000Z", address: { line1: "92 Fern Street", city: "Austin", country: "United States" },
    },
    {
      _id: "o3", buyer: { _id: "u3", name: "Liam Chen" },
      items: [{ productId: "p5", title: "Maple Cutting Board", image: products[4].images?.[0], price: 72, quantity: 1, seller: sellerNoor }],
      totalAmount: 72, total: 72, status: "shipped", orderStatus: "shipped", paymentStatus: "paid",
      createdAt: "2026-06-15T15:20:00.000Z", address: { line1: "18 Birch Lane", city: "Portland", country: "United States" },
    },
    {
      _id: "o4", buyer: { _id: "u4", name: "Maya Patel" },
      items: [
        { productId: "p7", title: "Wool Throw Blanket", image: products[6].images?.[0], price: 95, quantity: 1, seller: sellerNoor },
        { productId: "p3", title: "Linen Table Runner", image: products[2].images?.[0], price: 30, quantity: 1, seller: sellerNoor },
      ],
      totalAmount: 125, total: 125, status: "processing", orderStatus: "processing", paymentStatus: "paid",
      createdAt: "2026-07-02T12:10:00.000Z", address: { line1: "7 Harbor Road", city: "Seattle", country: "United States" },
    },
    {
      _id: "o5", buyer: { _id: "u3", name: "Liam Chen" },
      items: [{ productId: "p8", title: "Notebook Set — Three Pocket Sizes", image: products[7].images?.[0], price: 28, quantity: 3, seller: sellerJonas }],
      totalAmount: 84, total: 84, status: "processing", orderStatus: "processing", paymentStatus: "paid",
      createdAt: "2026-07-18T10:45:00.000Z", address: { line1: "18 Birch Lane", city: "Portland", country: "United States" },
    },
    {
      _id: "o6", buyer: { _id: "u4", name: "Maya Patel" },
      items: [{ productId: "p2", title: "Earthen Pour-Over Set", image: products[1].images?.[0], price: 64, quantity: 1, seller: sellerNoor }],
      totalAmount: 64, total: 64, status: "pending", orderStatus: "pending", paymentStatus: "paid",
      createdAt: "2026-07-28T09:30:00.000Z", address: { line1: "301 Maple Avenue", city: "Denver", country: "United States" },
    },
    {
      _id: "o7", buyer: { _id: "u3", name: "Liam Chen" },
      items: [{ productId: "p10", title: "Linen Shirt — Natural", image: products[9].images?.[0], price: 89, quantity: 1, seller: sellerJonas }],
      totalAmount: 89, total: 89, status: "cancelled", orderStatus: "cancelled", paymentStatus: "refunded",
      createdAt: "2026-06-20T17:05:00.000Z", address: { line1: "18 Birch Lane", city: "Portland", country: "United States" },
    },
    {
      _id: "o8", buyer: { _id: "u4", name: "Maya Patel" },
      items: [{ productId: "p6", title: "Scented Candle — Cedar & Smoke", image: products[5].images?.[0], price: 26, quantity: 2, seller: sellerJonas }],
      totalAmount: 52, total: 52, status: "shipped", orderStatus: "shipped", paymentStatus: "paid",
      createdAt: "2026-07-24T11:15:00.000Z", address: { line1: "301 Maple Avenue", city: "Denver", country: "United States" },
    },
  ];

  const sold: Record<string, number> = {
    p1: 84, p2: 37, p3: 52, p4: 96, p5: 61, p6: 43,
    p7: 28, p8: 110, p9: 66, p10: 31, p11: 140, p12: 19,
  };

  return {
    users,
    products,
    reviews,
    orders,
    wishlist: { u3: ["p1", "p7"], u4: ["p5", "p8"] },
    sold,
    hidden: {},
    featured: ["p1", "p3", "p5", "p7", "p8", "p10"],
  };
}

// ------------------------------------------------------------
// Auth
// ------------------------------------------------------------

export const mockAuth = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await delay();
    const db = loadDB();
    const email = payload.email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      throw new Error("An account with this email already exists");
    }
    const user: MockUser = {
      _id: uid("u_"),
      name: payload.name.trim(),
      email: payload.email.trim(),
      role: "buyer",
      photo: payload.photo,
      password: payload.password,
      blocked: false,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    db.wishlist[user._id] = [];
    saveDB(db);
    return { token: makeToken(user._id), user: toUser(user) };
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    await delay();
    const db = loadDB();
    const user = db.users.find((u) => u.email.toLowerCase() === payload.email.trim().toLowerCase());
    if (!user || !payload.password) throw new Error("Invalid email or password");
    if (user.blocked) throw new Error("This account has been blocked");
    return { token: makeToken(user._id), user: toUser(user) };
  },

  async googleLogin(): Promise<AuthResponse> {
    await delay();
    const db = loadDB();
    const user = db.users.find((u) => u.email === "buyer@marketa.dev") ?? db.users[0];
    return { token: makeToken(user._id), user: toUser(user) };
  },

  async me(): Promise<User> {
    await delay(150);
    const db = loadDB();
    const user = db.users.find((u) => u._id === currentTokenUserId());
    if (!user) throw new Error("Session expired");
    if (user.blocked) throw new Error("This account has been blocked");
    return toUser(user);
  },

  async updateProfile(payload: Partial<RegisterPayload>): Promise<User> {
    await delay();
    const db = loadDB();
    const user = db.users.find((u) => u._id === currentTokenUserId());
    if (!user) throw new Error("Not authenticated");
    if (payload.name != null) user.name = payload.name;
    if (payload.email != null) user.email = payload.email;
    if (payload.photo != null) user.photo = payload.photo;
    saveDB(db);
    return toUser(user);
  },

  async changePassword() {
    await delay();
    return { success: true };
  },
};

// ------------------------------------------------------------
// Products
// ------------------------------------------------------------

export const mockProducts = {
  async list(q: Record<string, unknown> = {}): Promise<ProductListResponse> {
    await delay(350);
    const db = loadDB();
    const search = String(q.search ?? "").trim().toLowerCase();
    const category = typeof q.category === "string" ? q.category : undefined;
    const brand = typeof q.brand === "string" ? q.brand.trim().toLowerCase() : undefined;
    const minPrice = typeof q.minPrice === "number" ? q.minPrice : undefined;
    const maxPrice = typeof q.maxPrice === "number" ? q.maxPrice : undefined;
    const sort = String(q.sort ?? "newest");
    const page = typeof q.page === "number" ? q.page : 1;
    const limit = typeof q.limit === "number" ? q.limit : 12;

    let items = db.products.filter((p) => {
      if (db.hidden[p._id]) return false;
      const finalPrice = p.discountPrice ?? p.price;
      if (category && p.category !== category) return false;
      if (brand && !p.brand?.toLowerCase().includes(brand)) return false;
      if (minPrice != null && finalPrice < minPrice) return false;
      if (maxPrice != null && finalPrice > maxPrice) return false;
      if (search) {
        const haystack = `${p.title} ${p.brand ?? ""} ${p.category ?? ""}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    const price = (p: Product) => p.discountPrice ?? p.price;
    switch (sort) {
      case "price-asc":
        items = [...items].sort((a, b) => price(a) - price(b));
        break;
      case "price-desc":
        items = [...items].sort((a, b) => price(b) - price(a));
        break;
      case "rating":
        items = [...items].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
        break;
      default:
        items = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    return { items: items.slice(start, start + limit), total, page, pages };
  },

  async featured(): Promise<Product[]> {
    await delay();
    const db = loadDB();
    const ids = new Set(db.featured);
    return db.products
      .filter((p) => ids.has(p._id) && !db.hidden[p._id])
      .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
  },

  async bestSellers(): Promise<Product[]> {
    await delay();
    const db = loadDB();
    return db.products
      .filter((p) => !db.hidden[p._id])
      .sort((a, b) => (db.sold[b._id] ?? 0) - (db.sold[a._id] ?? 0))
      .slice(0, 8);
  },

  async categories(): Promise<CategorySummary[]> {
    await delay();
    const db = loadDB();
    const counts = new Map<string, number>();
    for (const p of db.products) {
      if (db.hidden[p._id] || !p.category) continue;
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    return [...counts.entries()].map(([name, count]) => ({ name, count }));
  },

  async get(id: string): Promise<Product> {
    await delay(300);
    const db = loadDB();
    const product = db.products.find((p) => p._id === id);
    if (!product) throw new Error("Product not found");
    return product;
  },

  async reviews(id: string): Promise<ReviewItem[]> {
    await delay();
    const db = loadDB();
    return [...(db.reviews[id] ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async addReview(id: string, payload: { rating: number; comment: string }) {
    await delay();
    const db = loadDB();
    const user = currentMockUser(db);
    const review: ReviewItem = {
      _id: uid("r_"),
      productId: id,
      userId: user._id,
      rating: Math.min(5, Math.max(1, payload.rating)),
      comment: payload.comment.trim(),
      createdAt: new Date().toISOString(),
      user: toUser(user),
    };
    db.reviews[id] = [...(db.reviews[id] ?? []), review];
    const all = db.reviews[id];
    const product = db.products.find((p) => p._id === id);
    if (product) {
      product.averageRating = all.reduce((s, r) => s + r.rating, 0) / all.length;
      product.reviewCount = all.length;
    }
    saveDB(db);
    return review;
  },
};

// ------------------------------------------------------------
// Wishlist
// ------------------------------------------------------------

export const mockWishlist = {
  async list(): Promise<Product[]> {
    await delay();
    const db = loadDB();
    const id = currentTokenUserId() ?? db.users[0]?._id;
    const ids = new Set(db.wishlist[id] ?? []);
    return db.products.filter((p) => ids.has(p._id));
  },

  async add(productId: string) {
    await delay();
    const db = loadDB();
    const id = currentTokenUserId() ?? db.users[0]?._id;
    db.wishlist[id] = db.wishlist[id] ?? [];
    if (!db.wishlist[id].includes(productId)) db.wishlist[id].push(productId);
    saveDB(db);
    return { success: true };
  },

  async remove(productId: string) {
    await delay();
    const db = loadDB();
    const id = currentTokenUserId() ?? db.users[0]?._id;
    db.wishlist[id] = (db.wishlist[id] ?? []).filter((x) => x !== productId);
    saveDB(db);
    return { success: true };
  },
};

// ------------------------------------------------------------
// Orders
// ------------------------------------------------------------

export const mockOrders = {
  async create(payload: {
    items?: { product: string; quantity: number }[];
    address?: { line1?: string; city?: string; state?: string; zip?: string; country?: string };
    contact?: string;
    notes?: string;
  }) {
    await delay(500);
    const db = loadDB();
    const user = currentMockUser(db);
    const items: MockOrderItem[] = (payload?.items ?? []).map((it) => {
      const product = db.products.find((p) => p._id === it.product);
      return {
        productId: it.product,
        title: product?.title ?? "Product",
        image: product?.images?.[0],
        price: product ? (product.discountPrice ?? product.price) : 0,
        quantity: it.quantity ?? 1,
        seller:
          typeof product?.seller === "object" && product.seller
            ? { _id: product.seller._id, name: product.seller.name }
            : { _id: "unknown", name: "Marketa" },
      };
    });
    const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const order: MockOrder = {
      _id: uid("o_"),
      buyer: { _id: user._id, name: user.name },
      items,
      totalAmount,
      total: totalAmount,
      status: "pending",
      orderStatus: "pending",
      paymentStatus: "paid",
      createdAt: new Date().toISOString(),
      address: {
        line1: payload?.address?.line1 ?? "123 Main St",
        city: payload?.address?.city ?? "Portland",
        country: payload?.address?.country ?? "United States",
      },
    };
    db.orders.unshift(order);
    saveDB(db);
    return { orderId: order._id, clientSecret: null, status: "succeeded" };
  },

  async confirm(orderId: string): Promise<Order> {
    await delay();
    const db = loadDB();
    const order = db.orders.find((o) => o._id === orderId);
    if (!order) throw new Error("Order not found");
    return order as unknown as Order;
  },

  async myOrders(page = 1, limit = 10) {
    await delay();
    const db = loadDB();
    const user = currentMockUser(db);
    const mine = db.orders
      .filter((o) => o.buyer._id === user._id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return paginate(mine, page, limit);
  },

  async cancel(orderId: string): Promise<Order> {
    await delay();
    const db = loadDB();
    const order = db.orders.find((o) => o._id === orderId);
    if (!order) throw new Error("Order not found");
    order.status = "cancelled";
    order.orderStatus = "cancelled";
    order.paymentStatus = "refunded";
    saveDB(db);
    return order as unknown as Order;
  },
};

// ------------------------------------------------------------
// Reviews
// ------------------------------------------------------------

export const mockReviews = {
  async latest(): Promise<HomeReview[]> {
    await delay();
    const db = loadDB();
    return Object.values(db.reviews)
      .flat()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
      .map((r) => ({
        _id: r._id,
        rating: r.rating,
        comment: r.comment,
        user: { _id: r.user._id, name: r.user.name },
        createdAt: r.createdAt,
      }));
  },
};

// ------------------------------------------------------------
// Seller
// ------------------------------------------------------------

export const mockSeller = {
  async overview() {
    await delay();
    const db = loadDB();
    const sellerId = currentTokenUserId() ?? db.users[0]?._id;
    const myProducts = db.products.filter((p) => productSellerId(p) === sellerId);
    const myOrders = db.orders.filter(
      (o) => o.items.some((i) => i.seller._id === sellerId) && o.status !== "cancelled",
    );
    const revenue = myOrders.reduce((s, o) => s + o.totalAmount, 0);
    const ratings = myProducts.map((p) => p.averageRating ?? 0);
    return {
      revenue,
      revenueDelta: 12.4,
      orders: myOrders.length,
      ordersDelta: 8.1,
      productsCount: myProducts.length,
      avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
    };
  },

  async analytics(range = "30d") {
    await delay();
    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    const salesSeries = Array.from({ length: days }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const revenue = Math.round(120 + Math.abs(Math.sin(i * 1.7)) * 320 + (i % 5) * 40);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue,
      };
    });

    const db = loadDB();
    const sellerId = currentTokenUserId() ?? db.users[0]?._id;
    const myProducts = db.products.filter((p) => productSellerId(p) === sellerId);
    const topProducts = [...myProducts]
      .sort((a, b) => (db.sold[b._id] ?? 0) - (db.sold[a._id] ?? 0))
      .slice(0, 5)
      .map((p) => ({ title: p.title, sold: db.sold[p._id] ?? 0 }));
    const breakdown = new Map<string, number>();
    for (const p of myProducts) {
      const cat = p.category ?? "Other";
      breakdown.set(cat, (breakdown.get(cat) ?? 0) + 1);
    }
    const categoryBreakdown = [...breakdown.entries()].map(([name, value]) => ({ name, value }));

    return { salesSeries, topProducts, categoryBreakdown };
  },

  async products(): Promise<{ items: (Product & { sold: number })[] }> {
    await delay();
    const db = loadDB();
    const sellerId = currentTokenUserId() ?? db.users[0]?._id;
    return {
      items: db.products
        .filter((p) => productSellerId(p) === sellerId)
        .map((p) => ({ ...p, sold: db.sold[p._id] ?? 0 })),
    };
  },

  async createProduct(payload: ProductPayload): Promise<Product> {
    await delay();
    const db = loadDB();
    const seller = currentMockUser(db);
    const product: Product = {
      _id: uid("p_"),
      title: payload.title,
      description: payload.description,
      price: payload.price,
      discountPrice: payload.discountPrice,
      category: payload.category,
      stock: payload.stock,
      images: payload.images,
      createdAt: new Date().toISOString(),
      averageRating: 0,
      reviewCount: 0,
      seller: { _id: seller._id, name: seller.name },
    };
    db.products.unshift(product);
    db.sold[product._id] = 0;
    saveDB(db);
    return product;
  },

  async updateProduct(id: string, payload: ProductPayload): Promise<Product> {
    await delay();
    const db = loadDB();
    const product = db.products.find((p) => p._id === id);
    if (!product) throw new Error("Product not found");
    Object.assign(product, {
      title: payload.title,
      description: payload.description,
      price: payload.price,
      discountPrice: payload.discountPrice,
      category: payload.category,
      stock: payload.stock,
      images: payload.images,
    });
    saveDB(db);
    return product;
  },

  async deleteProduct(id: string) {
    await delay();
    const db = loadDB();
    db.products = db.products.filter((p) => p._id !== id);
    delete db.sold[id];
    delete db.hidden[id];
    delete db.reviews[id];
    db.featured = db.featured.filter((x) => x !== id);
    saveDB(db);
    return { success: true };
  },

  async orders(page = 1, limit = 10) {
    await delay();
    const db = loadDB();
    const sellerId = currentTokenUserId() ?? db.users[0]?._id;
    const mine = db.orders
      .filter((o) => o.items.some((i) => i.seller._id === sellerId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const totalPages = Math.max(1, Math.ceil(mine.length / limit));
    const start = (page - 1) * limit;
    return {
      items: mine.slice(start, start + limit).map((o) => ({
        _id: o._id,
        buyer: o.buyer,
        total: o.totalAmount,
        createdAt: o.createdAt,
        status: o.status,
      })),
      totalPages,
    };
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    await delay();
    const db = loadDB();
    const order = db.orders.find((o) => o._id === orderId);
    if (!order) throw new Error("Order not found");
    order.status = status;
    order.orderStatus = status;
    saveDB(db);
    return order as unknown as Order;
  },

  async requestSellerRole() {
    await delay();
    return { applied: true };
  },
};

// ------------------------------------------------------------
// Admin
// ------------------------------------------------------------

export const mockAdmin = {
  async overview() {
    await delay();
    const db = loadDB();
    const gmv = db.orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.totalAmount, 0);
    const revenueSeries = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const revenue = Math.round(900 + Math.abs(Math.sin(i * 1.3)) * 1800 + (i % 7) * 120);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue,
      };
    });
    return {
      usersCount: db.users.length,
      sellersCount: db.users.filter((u) => u.role === "seller").length,
      productsCount: db.products.length,
      gmv,
      revenueSeries,
    };
  },

  async users(q: Record<string, unknown> = {}) {
    await delay();
    const db = loadDB();
    const page = typeof q.page === "number" ? q.page : 1;
    const limit = typeof q.limit === "number" ? q.limit : 15;
    const sorted = [...db.users].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const totalPages = Math.max(1, Math.ceil(sorted.length / limit));
    const start = (page - 1) * limit;
    return {
      items: sorted.slice(start, start + limit).map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        photo: u.photo,
        blocked: u.blocked,
        createdAt: u.createdAt,
      })),
      totalPages,
    };
  },

  async updateUserRole(id: string, role: string) {
    await delay();
    const db = loadDB();
    const user = db.users.find((u) => u._id === id);
    if (!user) throw new Error("User not found");
    user.role = role as MockUser["role"];
    saveDB(db);
    return toUser(user);
  },

  async toggleUserBlock(id: string, blocked: boolean) {
    await delay();
    const db = loadDB();
    const user = db.users.find((u) => u._id === id);
    if (!user) throw new Error("User not found");
    user.blocked = blocked;
    saveDB(db);
    return toUser(user);
  },

  async deleteUser(id: string) {
    await delay();
    const db = loadDB();
    db.users = db.users.filter((u) => u._id !== id);
    delete db.wishlist[id];
    saveDB(db);
    return { success: true };
  },

  async products(q: Record<string, unknown> = {}) {
    await delay();
    const db = loadDB();
    const page = typeof q.page === "number" ? q.page : 1;
    const limit = typeof q.limit === "number" ? q.limit : 15;
    const sorted = [...db.products].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const totalPages = Math.max(1, Math.ceil(sorted.length / limit));
    const start = (page - 1) * limit;
    return {
      items: sorted.slice(start, start + limit).map((p) => ({
        _id: p._id,
        title: p.title,
        price: p.price,
        discountPrice: p.discountPrice,
        hidden: !!db.hidden[p._id],
        images: p.images,
        seller: p.seller,
      })),
      totalPages,
    };
  },

  async toggleProductVisibility(id: string, hidden: boolean) {
    await delay();
    const db = loadDB();
    const product = db.products.find((p) => p._id === id);
    if (!product) throw new Error("Product not found");
    db.hidden[id] = hidden;
    saveDB(db);
    return product;
  },

  async deleteProduct(id: string) {
    await delay();
    const db = loadDB();
    db.products = db.products.filter((p) => p._id !== id);
    delete db.sold[id];
    delete db.hidden[id];
    delete db.reviews[id];
    db.featured = db.featured.filter((x) => x !== id);
    saveDB(db);
    return { success: true };
  },

  async orders(q: Record<string, unknown> = {}) {
    await delay();
    const db = loadDB();
    const page = typeof q.page === "number" ? q.page : 1;
    const limit = typeof q.limit === "number" ? q.limit : 15;
    const sorted = [...db.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const totalPages = Math.max(1, Math.ceil(sorted.length / limit));
    const start = (page - 1) * limit;
    return {
      items: sorted.slice(start, start + limit).map((o) => ({
        _id: o._id,
        buyer: o.buyer,
        total: o.totalAmount,
        createdAt: o.createdAt,
        status: o.status,
      })),
      totalPages,
    };
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    await delay();
    const db = loadDB();
    const order = db.orders.find((o) => o._id === id);
    if (!order) throw new Error("Order not found");
    order.status = status;
    order.orderStatus = status;
    saveDB(db);
    return order as unknown as Order;
  },
};
