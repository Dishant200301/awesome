export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  isActive: boolean;
  description?: string;
  imageUrl?: string;
  image?: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
}

export interface AttributeValue {
  id: string;
  value: string;
  hexCode?: string;
}

export interface Attribute {
  id: string;
  name: string; // Color, Size, Material, etc.
  displayType: 'swatch' | 'button' | 'select';
  values: AttributeValue[];
}

export interface Variant {
  id: string;
  sku: string;
  title?: string; // Custom Variant/Color Specific Title
  productInfo?: string; // Custom Variant/Color Specific Description Info
  parentProductId?: string;
  parentProductName?: string;
  color?: string;
  colorName?: string;
  colorHex?: string;
  size?: string;
  sizeName?: string;
  attributes?: Record<string, string>;
  price: number;
  originalPrice: number;
  costPrice?: number;
  discountPercentage?: number;
  stock: number;
  image?: string;
  thumbnail?: string;
  galleryImages?: string[];
  barcode?: string;
  weight?: number;
  status?: 'Active' | 'Inactive' | 'Out of Stock';
  isPublished?: boolean;
}

export interface ProductLabels {
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  sale?: boolean;
}

export interface ProductInventory {
  sku: string;
  barcode?: string;
  stock: number;
  lowStockAlert?: number;
  allowBackorders?: boolean;
  trackInventory?: boolean;
}

export interface ProductShipping {
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalUrl?: string;
}

export interface ProductColor {
  id: string;
  colorName: string;
  colorHex: string;
  displayImage: string;
  mainImage: string;
  galleryImages: string[];
  sizes?: string[];
}

export interface ProductDescriptionCard {
  id: string;
  title: string;
  description: string;
  image: string;
  sortOrder: number;
  colorName?: string; // Optional color assignment (e.g., "Black", "Beige", "All Colors")
}

export interface ProductHighlight {
  id: string;
  title: string;
  value: string;
  iconName: string;
  sortOrder?: number;
}

export interface ProductWashingInstruction {
  id: string;
  title: string;
  description: string;
  iconName: string;
  sortOrder?: number;
}

export interface ProductManufacturingInfo {
  manufacturer: string;
  address: string;
  packedBy: string;
  importedBy: string;
  countryOfOrigin: string;
  material: string;
  careEmail: string;
  carePhone: string;
  netQuantity?: string;
  mrp?: string;
}

export interface SizeGuideCountry {
  id: string;
  name: string;
  code: string;
  displayOrder: number;
}

export interface SizeGuideColumn {
  id: string;
  key: string;
  name: string;
  displayOrder: number;
}

export interface SizeGuideRowValue {
  cm: string;
  inch: string;
}

export interface SizeGuideRow {
  id: string;
  brandSize: string;
  displayOrder: number;
  values: Record<string, SizeGuideRowValue>;
}

export interface SizeGuide {
  id: string;
  title: string;
  description?: string;
  categoryIds: string[];
  subcategoryIds: string[];
  countries: SizeGuideCountry[];
  columns: SizeGuideColumn[];
  rows: SizeGuideRow[];
}

import { ProductSizeChartConfig } from './attribute.types';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  subcategory?: string;
  categories?: string[];
  brand: string;
  collections?: string[];
  tags?: string[];
  price: number;
  originalPrice: number;
  costPrice?: number;
  stock: number;
  rating: number;
  salesCount: number;
  status: 'Published' | 'Draft' | 'Hidden' | 'Out of Stock';
  isPublished: boolean;
  type: 'Simple' | 'Variable';
  shortDescription?: string;
  fullDescription?: string;
  image?: string;
  mainImage?: string;
  galleryImages?: string[];
  defaultSku?: string;
  images: string[];
  labels?: ProductLabels;
  inventory?: ProductInventory;
  barcode?: string;
  shipping?: ProductShipping;
  seo?: ProductSEO;
  variants: Variant[];
  variations?: any[];
  attributes: { name: string; values: string[] }[];
  colors?: ProductColor[];
  descriptionCards?: ProductDescriptionCard[];
  highlights?: ProductHighlight[];
  washingInstructions?: ProductWashingInstruction[];
  manufacturingInfo?: ProductManufacturingInfo;
  productAttributes?: any[];
  productType?: 'simple' | 'variant';
  colorMediaConfigs?: any[];
  idealForPills?: string[];
  sizeGuideId?: string;
  sizeChart?: ProductSizeChartConfig;
  createdAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: 'New' | 'Read' | 'Replied' | 'Archived';
  replyText?: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  variantSku: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentGateway: 'Razorpay' | 'Stripe' | 'COD';
  itemsCount: number;
  items: OrderItem[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  status: 'Active' | 'Blocked';
  joinedDate: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  link: string;
  status: 'Active' | 'Inactive';
  sortOrder: number;
}

export interface HomepageBanner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  badge?: string;
  link: string;
  gridPosition: 'Hero Side Upper' | 'Hero Side Lower' | 'Middle Wide' | 'Grid Left' | 'Grid Right';
  status: 'Active' | 'Inactive';
}

export interface ContentPageItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  status: 'Published' | 'Draft';
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  readTime: string;
  status: 'Published' | 'Draft';
  publishedDate: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  status: 'Active' | 'Inactive';
}

export interface StoreSettings {
  storeName: string;
  storeLogo: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  taxRate: number;
  shippingFee: number;
  freeShippingThreshold: number;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  metaTitle: string;
  metaDescription: string;
}
