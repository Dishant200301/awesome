export type AttributeDisplayType = 
  | 'SWATCH' 
  | 'BUTTON' 
  | 'SELECT' 
  | 'RADIO' 
  | 'CHECKBOX'
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'COLOR';

export type AttributeUsage = 'PRODUCT' | 'VARIANT' | 'BOTH';

export interface AttributeValue {
  id: string;
  attributeId?: string;
  label: string;
  value: string;
  colorCode?: string;
  status: 'active' | 'inactive';
  sortOrder: number;
}

export interface AttributeMaster {
  id: string;
  name: string;
  displayName?: string;
  slug: string;
  type: AttributeDisplayType;
  usage: AttributeUsage;
  showInHighlights: boolean;
  isRequired: boolean;
  sortOrder: number;
  status: 'active' | 'inactive';
  isActive: boolean; // Alias for status === 'active'
  values: AttributeValue[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductAttributeAssignment {
  id?: string;
  productId?: string;
  attributeId: string;
  attributeName: string;
  attributeSlug: string;
  type: AttributeDisplayType;
  sortOrder: number;
  useForVariants: boolean;
  selectedValues: string[];
  customValues?: string[];
  showInHighlights?: boolean;
}

export interface ColorMediaConfig {
  colorValueId: string;
  colorName: string;
  colorCode?: string;
  title?: string; // Custom Color-specific Title
  productInfo?: string; // Custom Color-specific Description Info
  mainImage: string;
  gallery: string[];
}

export interface ProductVariantConfig {
  id: string;
  sku: string;
  title?: string; // Custom Variant-specific Title (no common title required)
  productInfo?: string; // Custom Variant-specific Description Info
  parentProductId?: string;
  colorName?: string;
  colorHex?: string;
  sizeName?: string;
  price: number;
  originalPrice?: number;
  comparePrice?: number;
  costPrice?: number;
  discountPercentage?: number;
  stock: number;
  weight?: number;
  image?: string;
  thumbnail?: string;
  galleryImages?: string[]; // Custom Variant-specific Gallery Images
  status?: 'Active' | 'Inactive' | 'Out of Stock';
  attributeValues: Record<string, string>; // e.g. { Color: "Black", Size: "M" }
  imageOverride?: {
    mainImage: string;
    gallery: string[];
  };
}

export interface SizeChartColumn {
  id: string;
  name: string; // e.g. "Bust", "Top Waist", "Shoulder"
  sortOrder: number;
}

export interface SizeChartRow {
  id: string;
  size: string; // e.g. "XS", "S", "M", "L", "XL"
  sortOrder: number;
  measurements: Record<string, string>; // columnId -> string value, e.g. { 'col-bust': '36', 'col-waist': '33' }
}

export interface ProductSizeChartConfig {
  enabled: boolean;
  title: string; // e.g. "IN KURTAS & KURTIS" or "Size Guide"
  unit: string; // "Inches", "CM", "MM", "EU", "US", "UK", "Custom"
  columns: SizeChartColumn[];
  rows: SizeChartRow[];
}
