import type { CategorySummary } from "./api";

export const CATEGORY_GROUP: Record<string, string> = {
  "Mobile Phones": "Electronics & Mobile",
  "Audio & Speakers": "Electronics & Mobile",
  Wearables: "Electronics & Mobile",
  "Chargers & Power": "Electronics & Mobile",
  Laptops: "Computers & PC",
  Desktops: "Computers & PC",
  Peripherals: "Computers & PC",
  "Monitors & Displays": "Computers & PC",
  "PC Accessories": "Computers & PC",
  Dresses: "Fashion & Apparel",
  "Tops & Blouses": "Fashion & Apparel",
  "Men's Shirts": "Fashion & Apparel",
  "Pants & Jeans": "Fashion & Apparel",
  "Jackets & Outerwear": "Fashion & Apparel",
  Sneakers: "Shoes",
  "Formal Shoes": "Shoes",
  Boots: "Shoes",
  "Sandals & Slippers": "Shoes",
  "Kitchen & Dining": "Home & Living",
  "Decor & Lighting": "Home & Living",
  "Bedding & Bath": "Home & Living",
  Furniture: "Home & Living",
  "Toys & Games": "Other",
  Stationery: "Other",
  "Sports & Fitness": "Other",
  Books: "Other",
  "Bags & Accessories": "Other",
  Skincare: "Beauty & Care",
  Makeup: "Beauty & Care",
  "Hair Care": "Beauty & Care",
  "Body Care": "Beauty & Care",
  "Home Fragrance": "Beauty & Care",
};

const FALLBACK_GROUP = "Other";

const GROUP_ORDER = [
  "Electronics & Mobile",
  "Computers & PC",
  "Fashion & Apparel",
  "Shoes",
  "Home & Living",
  "Beauty & Care",
  "Other",
];

export interface CategoryGroup {
  group: string;
  items: CategorySummary[];
}

export function groupCategories(
  categories: CategorySummary[],
): CategoryGroup[] {
  const buckets = new Map<string, CategorySummary[]>();
  for (const cat of categories) {
    const group = CATEGORY_GROUP[cat.name] ?? FALLBACK_GROUP;
    const list = buckets.get(group) ?? [];
    list.push(cat);
    buckets.set(group, list);
  }
  return GROUP_ORDER.filter((g) => buckets.has(g)).map((g) => ({
    group: g,
    items: buckets.get(g) ?? [],
  }));
}