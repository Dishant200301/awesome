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
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
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
