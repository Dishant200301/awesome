export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  label?: string;
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

export interface ProductColorVariation {
  id: string;
  colorName: string;
  colorHex: string;
  size?: string;
  sizeName?: string;
  thumbnail: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  sku: string;
  stock: number;
  images: ProductImage[];
}

export interface SizeChartEntry {
  brandSize: string;
  inSize: string;
  usSize: string;
  euSize: string;
  ukSize: string;
  cnSize: string;
  bustCm: string;
  underbustCm: string;
  [key: string]: string;
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
  values: Record<string, SizeGuideRowValue>; // keyed by countryId_columnKey
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

export interface ProductAttributeAssignment {
  id?: string;
  productId?: string;
  attributeId: string;
  attributeName: string;
  attributeSlug: string;
  type: string;
  value: any;
  showInHighlights: boolean;
  displayOrder: number;
}

export interface FeatureHighlight {
  id?: string;
  label: string;
  title?: string;
  value: string;
  iconName?: string;
}

export interface DescriptionCard {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  sortOrder?: number;
  colorName?: string; // Optional color assignment (e.g., "Black", "Beige", "All")
}

export interface WashingInstruction {
  id: string;
  label?: string;
  title?: string;
  description?: string;
  iconName: string;
  sortOrder?: number;
}

export interface ManufacturingInfo {
  manufacturer: string;
  address: string;
  countryOfOrigin: string;
  material: string;
  mrp: string;
  netQuantity: string;
  packedBy: string;
  importedBy: string;
  careEmail?: string;
  carePhone?: string;
  customerCare: {
    email: string;
    phone: string;
    address: string;
  };
}

export interface RelatedProduct {
  id: string;
  code: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  image: string;
  hoverImage?: string;
  rating: number;
  isWishlisted?: boolean;
}

export interface SizeChartColumn {
  id: string;
  name: string;
  sortOrder: number;
}

export interface SizeChartRow {
  id: string;
  size: string;
  sortOrder: number;
  measurements: Record<string, string>;
}

export interface ProductSizeChartConfig {
  enabled: boolean;
  title: string;
  unit: string;
  columns: SizeChartColumn[];
  rows: SizeChartRow[];
}

export interface ProductDetails {
  id: string;
  type?: 'Simple' | 'Variable';
  brand: string;
  name: string;
  category?: string;
  categories?: string[];
  subcategory?: string;
  sku?: string;
  stock?: number;
  mainImage?: string;
  discountPercentage?: number;
  subtitle: string;
  shortDescription?: string;
  fullDescription?: string;
  price?: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  defaultSku: string;
  colors?: ProductColor[];
  variations: ProductColorVariation[];
  availableSizes: string[];
  sizeChart: SizeChartEntry[];
  sizeChartConfig?: ProductSizeChartConfig;
  sizeGuide?: SizeGuide;
  highlights: FeatureHighlight[];
  productAttributes?: ProductAttributeAssignment[];
  customAttributes?: any[];
  variantDetails?: any[];
  features?: any[];
  specifications?: any;
  dimensions?: any;
  weight?: any;
  material?: any;
  color?: any;
  size?: any;
  specs?: any;
  galleryImages?: string[];
  images?: any[];
  reviews?: any[];
  productType?: 'simple' | 'variant';
  colorMediaConfigs?: { colorValueId?: string; colorName: string; colorCode?: string; mainImage: string; gallery: string[] }[];
  extendedDetails: {
    description: string;
    specifications: Record<string, string>;
    careInstructions: string[];
    materialDetails: string;
  };
  descriptionCards: DescriptionCard[];
  idealForPills: string[];
  washingInstructions: WashingInstruction[];
  manufacturingInfo: ManufacturingInfo;
  relatedProducts: RelatedProduct[];
  shippingInfo?: {
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    shippingFee?: number;
    dispatchTime?: string;
  };
  taxInfo?: {
    hsnCode?: string;
    taxPercentage?: number;
    isTaxInclusive?: boolean;
  };
}

export interface CartItem {
  id: string; // unique item key: productId-colorId-size
  productId: string;
  productName: string;
  brand: string;
  colorName: string;
  colorHex: string;
  size: string;
  price: number;
  originalPrice: number;
  image: string;
  sku: string;
  quantity: number;
  stock?: number;
  maxStock?: number;
}

export interface ClientShopProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  categories?: string[];
  brand: string;
  price: number;
  originalPrice: number;
  stock: number;
  rating: number;
  salesCount: number;
  status: 'Published' | 'Draft' | 'Hidden';
  isPublished: boolean;
  type: 'Simple' | 'Variable';
  shortDescription?: string;
  fullDescription?: string;
  image?: string;
  hoverImage?: string;
  images: string[];
  tags?: string[];
  labels?: {
    featured?: boolean;
    trending?: boolean;
    newArrival?: boolean;
    bestSeller?: boolean;
    sale?: boolean;
  };
  variants?: {
    id: string;
    sku: string;
    color?: string;
    size?: string;
    price: number;
    originalPrice: number;
    stock: number;
    image?: string;
    galleryImages?: string[];
  }[];
  attributes?: { name: string; values: string[] }[];
  createdAt?: string;
}

export interface ClientContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: 'New' | 'Read' | 'Replied';
}

export type Product = ProductDetails | ClientShopProduct | Record<string, any>;


