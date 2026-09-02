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
  title?: string;
  productInfo?: string;
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
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder';
}

export interface ProductShipping {
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  unit?: string;
  weightUnit?: string;
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
  colorName?: string;
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

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

export interface ProductWeight {
  value: number;
  unit: string;
}

export interface ProductCustomAttribute {
  name: string;
  values: string[];
}

export interface ProductOptionItem {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariantDetail {
  id: string;
  name: string;
  optionValue: string;
  price: number;
  salePrice?: number;
  quantity: number;
  sku: string;
  colorHex?: string;
  mainImage?: string;
  galleryImages?: string[];
  width?: string;
  height?: string;
  totalCarat?: string;
  goldCarat?: string;
  images: string[];
}

export interface ProductAddonOption {
  id: string;
  name: string;
  values: string[];
  price?: number;
}

export interface Product {
  id: string;
  name: string;
  displayName?: string;
  subtitle?: string;
  defaultKey?: string;
  slug: string;
  sku: string;
  defaultSku?: string;
  barcode?: string;

  category: string;
  subcategory?: string;
  subCategory?: string;
  categories?: string[];
  brand: string;
  collections?: string[];
  tags?: string[];

  // Pricing & Taxes
  regularPrice?: number;
  originalPrice: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountPercentage?: number;
  price: number; // Final selling price
  costPrice?: number;
  taxRate?: number;
  taxIncluded?: boolean;

  // Inventory
  stock: number;
  stockQuantity?: number;
  lowStockAlert?: number;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder';
  allowBackorders?: boolean;
  trackInventory?: boolean;

  // Status & Visibility
  rating: number;
  salesCount: number;
  reviewCount?: number;
  status: 'Published' | 'Draft' | 'Active' | 'Inactive' | 'Out of Stock' | 'Hidden';
  isPublished: boolean;
  isFeatured?: boolean;
  type: 'Simple' | 'Variable';

  // Descriptions & Media
  shortDescription?: string;
  fullDescription?: string;
  longDescription?: string;
  image?: string;
  mainImage?: string;
  hoverImage?: string;
  galleryImages?: string[];
  images: string[];

  // Specifications & Attributes
  specifications?: ProductSpecification[];
  features?: string[];
  dimensions?: ProductDimensions;
  weight?: ProductWeight;
  material?: string;
  color?: string;
  size?: string;
  customAttributes?: ProductCustomAttribute[];

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[] | string;
  seo?: ProductSEO;

  // Additional e-commerce configurations
  labels?: ProductLabels;
  inventory?: ProductInventory;
  shipping?: ProductShipping;
  variants: Variant[];
  variations?: any[];
  productOptions?: ProductOptionItem[];
  variantDetails?: ProductVariantDetail[];
  addonOptions?: ProductAddonOption[];
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
  availableSizes?: string[];

  createdAt?: string;
  updatedAt?: string;
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
  tag?: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  buttonText: string;
  link: string;
  theme?: 'gold' | 'maroon' | 'dark' | 'purple' | 'custom';
  align?: 'left' | 'center' | 'right';
  status: 'Active' | 'Inactive';
  sortOrder: number;
}

export interface HomepageBanner {
  id: string;
  title?: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  badge?: string;
  buttonText?: string;
  link: string;
  gridPosition?: 'Hero Side Upper' | 'Hero Side Lower' | 'Middle Wide' | 'Grid Left' | 'Grid Right' | 'Main Promo Banner';
  showTextOverlay?: boolean;
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

export interface AdminReviewItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  author: string;
  email: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
  status?: 'Approved' | 'Pending' | 'Rejected';
  createdAt?: string;
}

export type ReviewItem = AdminReviewItem;

