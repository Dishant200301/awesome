export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  subs?: any[];
  productCount: number;
  isActive: boolean;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  image?: string;
  isActive?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  isActive?: boolean;
}

export interface AttributeValue {
  id: string;
  value: string;
  meta?: string;
}

export interface Attribute {
  id: string;
  name: string;
  type?: 'Select' | 'Color' | 'Button';
  values: (string | AttributeValue)[];
  isVariant?: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'New' | 'Read' | 'Replied' | 'Archived';
  date: string;
  createdAt?: string;
  replyText?: string;
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
  tagline?: string;
  badgeText?: string;
  buttonLink?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  bgColor?: string;
  isActive?: boolean;
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
  storeLogo?: string;
  email?: string;
  supportEmail?: string;
  phone?: string;
  supportPhone?: string;
  address: string;
  currency: string;
  currencySymbol?: string;
  taxRate?: number;
  shippingFee?: number;
  flatShippingRate?: number;
  freeShippingThreshold: number;
  enableCod?: boolean;
  enableReviews?: boolean;
  autoApproveReviews?: boolean;
  maintenanceMode?: boolean;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ReviewItem {
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

