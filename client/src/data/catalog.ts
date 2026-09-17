// Awesome Handmade - Dynamic Catalog Structure & Type Definitions
// Real production data is loaded dynamically from Admin Dashboard -> Backend API -> Database

export const LOGO = "/images/common/logo.png";



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
