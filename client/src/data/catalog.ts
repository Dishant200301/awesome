// Awesome Handmade - Dynamic Catalog Structure & Type Definitions
// Real production data is loaded dynamically from Admin Dashboard -> Backend API -> Database

export const LOGO = "/images/common/logo.png";

// Image asset paths
export const IMG = {
  hero1: "/images/home/hero/hero-1.webp",
  hero2: "/images/home/hero/hero-2.webp",
  hero3: "/images/home/hero/hero-3.webp",
  hero4: "/images/home/hero/hero-4.webp",
  hero5: "/images/home/hero/hero-5.webp",
  banner: "/images/banner/banner.webp",
  colLatkan: "/images/category/Latkan.webp",
  colJewellery: "/images/category/Necklace.webp",
  colCholi: "/images/category/Choli.webp",
  colHair: "/images/category/Gift Hamper.webp",
  colGift: "/images/category/Gift Hamper.webp",
  colTraditional: "/images/hero_twirl_tradition.jpg",
  colEarrings: "/images/category/Earrings.webp",
  colMacrame: "/images/grace_every_thread.jpg",
  pKeychain: "/images/category/Gift Hamper.webp",
  pLatkan: "/images/category/Latkan.webp",
  pEarrings: "/images/category/Earrings.webp",
  pNecklace: "/images/category/Necklace.webp",
  pHairBow: "/images/category/Gift Hamper.webp",
  pCholi: "/images/category/Choli.webp",
  pBracelet: "/images/category/Bracelet.webp",
  pJewellerySet: "/images/category/Necklace.webp",
  pAnklet: "/images/category/Anklet.webp",
  pMacrame: "/images/grace_every_thread.jpg",
  t1: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  t2: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  t3: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  r1: "/images/category/Latkan.webp",
  r2: "/images/category/Gift Hamper.webp",
  r3: "/images/category/Earrings.webp",
  r4: "/images/category/Choli.webp",
  r5: "/images/category/Necklace.webp",
};

export interface SubCategory {
  name: string;
  slug: string;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  image: string;
  subs: SubCategory[];
  count?: number;
}

export interface ProductColor {
  name: string;
  hex: string;
  image: string;
  displayImage?: string;
  mainImage?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category: string;
  categoryName?: string;
  subCategory?: string;
  image: string;
  images?: string[];
  isNew?: boolean;
  isBest?: boolean;
  rating?: number;
  reviewsCount?: number;
  description?: string;
  fullDescription?: string;
  material?: string;
  inStock?: boolean;
  stock?: number;
  brand?: string;
  availableSizes?: string[];
  colors?: ProductColor[];
}

// Pure dynamic catalog: Zero hardcoded production data
export const categories: Category[] = [];
export const products: Product[] = [];
export const collections: string[] = [];
