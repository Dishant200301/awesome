export interface ProductColorItem {
  id: string;
  colorName: string;
  colorHex: string;
  displayImage: string;
  mainImage: string;
  galleryImages: string[];
  sizes: string[];
}

export interface ProductVariantItem {
  id: string;
  colorName?: string;
  colorHex?: string;
  size?: string;
  sizeName?: string;
  price: number;
  originalPrice: number;
  costPrice?: number;
  discountPercentage?: number;
  sku: string;
  barcode?: string;
  stock: number;
  thumbnail?: string;
  status?: 'Active' | 'Inactive' | 'Out of Stock';
  images?: { id: string; url: string; alt?: string }[];
}

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

export interface ProductItem {
  id: string;
  name: string;
  subtitle?: string;
  brand: string;
  category: string;
  subcategory?: string;
  subCategory?: string;
  categories?: string[];
  slug: string;
  sku?: string;
  defaultSku: string;
  barcode?: string;

  // Pricing & Taxes
  regularPrice: number;
  originalPrice: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  price: number; // Final selling price
  taxRate?: number;
  taxIncluded?: boolean;
  costPrice?: number;
  discountPercentage: number;

  // Inventory
  stock: number;
  stockQuantity?: number;
  lowStockAlert?: number;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder';
  allowBackorders?: boolean;
  trackInventory?: boolean;

  // Media
  image: string;
  mainImage?: string;
  hoverImage?: string;
  images: string[];
  galleryImages?: string[];
  colorMediaConfigs?: any[];

  // Descriptions
  shortDescription?: string;
  fullDescription?: string;
  longDescription?: string;
  description?: string;

  // Details, Specs, Attributes
  specifications?: ProductSpecification[];
  features?: string[];
  dimensions?: ProductDimensions;
  weight?: ProductWeight;
  material?: string;
  color?: string;
  size?: string;
  customAttributes?: ProductCustomAttribute[];

  // Variants & Colors
  colors?: ProductColorItem[];
  variations: ProductVariantItem[];
  variants?: ProductVariantItem[];
  availableSizes?: string[];
  descriptionCards?: any[];
  idealForPills?: string[];
  washingInstructions?: any[];
  manufacturingInfo?: any;
  productAttributes?: any[];

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[] | string;

  // Status & Visibility
  rating: number;
  reviewCount: number;
  salesCount?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
  status: 'Published' | 'Draft' | 'Active' | 'Inactive' | 'Out of Stock';

  createdAt: string;
  updatedAt?: string;
}

import { syncProductToMySQL, deleteProductFromMySQL, fetchProductsFromMySQL } from "../../../database/mysqlSync.js";

class ProductStore {
  private products: ProductItem[] = [];

  constructor() {
    this.refreshFromMySQL();
  }

  public async refreshFromMySQL(): Promise<ProductItem[]> {
    try {
      const mysqlProducts = await fetchProductsFromMySQL(false);
      if (Array.isArray(mysqlProducts)) {
        this.products = mysqlProducts.map((p) => this.normalizeProduct(p));
      }
    } catch (e) {
      console.warn("[ProductStore] Error loading products from MySQL:", (e as Error).message);
    }
    return this.products;
  }

  private normalizeProduct(p: any): ProductItem {
    const regularPrice = Number(p.regularPrice || p.originalPrice || p.price || 999);
    const price = Number(p.price || (p.regularPrice ? p.regularPrice : 999));
    const originalPrice = Math.max(regularPrice, price);
    const stock = Number(p.stock !== undefined ? p.stock : (p.stockQuantity !== undefined ? p.stockQuantity : 50));
    
    let calcDiscount = 0;
    if (originalPrice > price) {
      calcDiscount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    const isPublished = p.isPublished !== undefined
      ? Boolean(p.isPublished)
      : (p.status === 'Draft' || p.status === 'Inactive' ? false : true);

    const mainImg = p.mainImage || p.image || (p.images && p.images[0]) || "/images/category/Latkan.webp";
    const allImages = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : (Array.isArray(p.galleryImages) && p.galleryImages.length > 0 ? [mainImg, ...p.galleryImages] : [mainImg]);

    const galleryImgs = Array.isArray(p.galleryImages) && p.galleryImages.length > 0
      ? p.galleryImages
      : allImages.filter((img: string) => img !== mainImg);

    let stockStatus = p.stockStatus;
    if (!stockStatus) {
      if (stock <= 0) stockStatus = 'out_of_stock';
      else if (stock <= (p.lowStockAlert || 10)) stockStatus = 'low_stock';
      else stockStatus = 'in_stock';
    }

    return {
      id: p.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: p.name || "New Product",
      subtitle: p.subtitle || "",
      brand: p.brand || "Awesome Handmade",
      category: p.category || "Latkan",
      subcategory: p.subcategory || p.subCategory || "",
      subCategory: p.subcategory || p.subCategory || "",
      categories: p.categories || [p.category || "Latkan"],
      slug: p.slug || (p.name || "new-product").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      sku: p.sku || p.defaultSku || `AWH-${Date.now()}`,
      defaultSku: p.defaultSku || p.sku || `AWH-${Date.now()}`,
      barcode: p.barcode || "",

      regularPrice,
      originalPrice,
      discountType: p.discountType || 'percentage',
      discountValue: p.discountValue !== undefined ? Number(p.discountValue) : calcDiscount,
      price,
      taxRate: p.taxRate !== undefined ? Number(p.taxRate) : 0,
      taxIncluded: p.taxIncluded !== undefined ? Boolean(p.taxIncluded) : true,
      costPrice: p.costPrice !== undefined ? Number(p.costPrice) : undefined,
      discountPercentage: p.discountPercentage !== undefined ? Number(p.discountPercentage) : calcDiscount,

      stock,
      stockQuantity: stock,
      lowStockAlert: p.lowStockAlert !== undefined ? Number(p.lowStockAlert) : 10,
      stockStatus,
      allowBackorders: Boolean(p.allowBackorders),
      trackInventory: p.trackInventory !== undefined ? Boolean(p.trackInventory) : true,

      mainImage: mainImg,
      image: mainImg,
      hoverImage: p.hoverImage || "",
      images: allImages,
      galleryImages: galleryImgs,
      colorMediaConfigs: Array.isArray(p.colorMediaConfigs) ? p.colorMediaConfigs : [],

      shortDescription: p.shortDescription || "",
      fullDescription: p.fullDescription || p.description || "",
      longDescription: p.longDescription || p.description || "",
      description: p.description || p.fullDescription || "",

      specifications: Array.isArray(p.specifications) ? p.specifications : [],
      features: Array.isArray(p.features) ? p.features : [],
      dimensions: p.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
      weight: p.weight || { value: 0, unit: 'g' },
      material: p.material || "",
      color: p.color || "",
      size: p.size || "",
      customAttributes: Array.isArray(p.customAttributes) ? p.customAttributes : [],

      colors: Array.isArray(p.colors) ? p.colors : [],
      variations: Array.isArray(p.variations) ? p.variations : (Array.isArray(p.variants) ? p.variants : []),
      variants: Array.isArray(p.variants) ? p.variants : (Array.isArray(p.variations) ? p.variations : []),
      availableSizes: Array.isArray(p.availableSizes) ? p.availableSizes : [],
      descriptionCards: Array.isArray(p.descriptionCards) ? p.descriptionCards : [],
      idealForPills: Array.isArray(p.idealForPills) ? p.idealForPills : [],
      washingInstructions: Array.isArray(p.washingInstructions) ? p.washingInstructions : [],
      manufacturingInfo: p.manufacturingInfo || {
        manufacturer: "Awesome Handmade Studio",
        address: "Surat, Gujarat",
        countryOfOrigin: "India",
        material: "Handcrafted Art & Silk"
      },
      productAttributes: Array.isArray(p.productAttributes) ? p.productAttributes : [],

      metaTitle: p.metaTitle || p.name || "",
      metaDescription: p.metaDescription || p.shortDescription || "",
      metaKeywords: p.metaKeywords || "",

      rating: p.rating !== undefined ? Number(p.rating) : 5.0,
      reviewCount: p.reviewCount !== undefined ? Number(p.reviewCount) : 1,
      salesCount: p.salesCount !== undefined ? Number(p.salesCount) : 0,
      isFeatured: p.isFeatured !== undefined ? Boolean(p.isFeatured) : true,
      isPublished,
      status: p.status || (isPublished ? 'Published' : 'Draft'),

      createdAt: p.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: p.updatedAt || new Date().toISOString()
    };
  }

  public getAll(onlyPublished = false): ProductItem[] {
    if (onlyPublished) {
      return this.products.filter(p => p.isPublished !== false && p.status !== 'Draft' && p.status !== 'Inactive');
    }
    return this.products;
  }

  public getByIdOrSlug(query: string): ProductItem | undefined {
    return this.products.find(
      (p) => p.id === query || p.slug === query || (p.sku && p.sku === query) || (p.defaultSku && p.defaultSku === query)
    );
  }

  public async add(productData: Partial<ProductItem> | any): Promise<ProductItem> {
    const normalized = this.normalizeProduct({
      ...productData,
      id: productData.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: productData.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    });

    await syncProductToMySQL(normalized);
    await this.refreshFromMySQL();
    return normalized;
  }

  public async update(id: string, updateData: Partial<ProductItem> | any): Promise<ProductItem | null> {
    const existing = this.products.find((p) => p.id === id);
    const merged = {
      ...(existing || {}),
      ...updateData,
      id,
      updatedAt: new Date().toISOString()
    };

    const normalized = this.normalizeProduct(merged);
    await syncProductToMySQL(normalized);
    await this.refreshFromMySQL();
    return normalized;
  }

  public async delete(id: string): Promise<boolean> {
    const target = String(id).trim();
    await deleteProductFromMySQL(target);
    await this.refreshFromMySQL();
    return true;
  }

  public async bulkDelete(ids: string[]): Promise<number> {
    const stringIds = ids.map((i) => String(i).trim());
    for (const sid of stringIds) {
      await deleteProductFromMySQL(sid);
    }
    await this.refreshFromMySQL();
    return stringIds.length;
  }

  public async bulkStatus(ids: string[], isPublished: boolean, status?: string): Promise<number> {
    let count = 0;
    const resolvedStatus = status || (isPublished ? "Active" : "Inactive");
    for (const id of ids) {
      const p = this.products.find((prod) => prod.id === id);
      if (p) {
        const updated = {
          ...p,
          isPublished,
          status: (resolvedStatus === 'Active' ? 'Published' : resolvedStatus) as any,
          updatedAt: new Date().toISOString()
        };
        await syncProductToMySQL(updated);
        count++;
      }
    }
    await this.refreshFromMySQL();
    return count;
  }

  public async duplicate(id: string): Promise<ProductItem | null> {
    const original = this.products.find((p) => p.id === id);
    if (!original) return null;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const cloned: ProductItem = {
      ...original,
      id: `prod-${Date.now()}-${randomSuffix}`,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${randomSuffix}`,
      sku: `${original.sku || original.defaultSku || 'AWH'}-COPY-${randomSuffix}`,
      defaultSku: `${original.defaultSku || original.sku || 'AWH'}-COPY-${randomSuffix}`,
      status: 'Draft',
      isPublished: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };

    await syncProductToMySQL(cloned);
    await this.refreshFromMySQL();
    return cloned;
  }

  public async toggleStatus(id: string, customStatus?: string): Promise<ProductItem | null> {
    const existing = this.products.find((p) => p.id === id);
    if (!existing) return null;

    let isPublished = !existing.isPublished;
    let status: any = isPublished ? 'Published' : 'Inactive';

    if (customStatus) {
      status = customStatus;
      isPublished = customStatus === 'Active' || customStatus === 'Published';
    }

    const updated: ProductItem = {
      ...existing,
      isPublished,
      status,
      updatedAt: new Date().toISOString()
    };

    await syncProductToMySQL(updated);
    await this.refreshFromMySQL();
    return updated;
  }

  public queryProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    subcategory?: string;
    brand?: string;
    stockStatus?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    dateFilter?: string;
    sort?: string;
  }) {
    let list = [...this.products];
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const search = params.search ? params.search.trim().toLowerCase() : "";

    // 1. Text Search (Name, SKU, Brand, Category, Subcategory, Barcode)
    if (search) {
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(search)) ||
          (p.brand && p.brand.toLowerCase().includes(search)) ||
          (p.category && p.category.toLowerCase().includes(search)) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(search)) ||
          (p.subCategory && p.subCategory.toLowerCase().includes(search)) ||
          (p.sku && p.sku.toLowerCase().includes(search)) ||
          (p.defaultSku && p.defaultSku.toLowerCase().includes(search)) ||
          (p.barcode && p.barcode.toLowerCase().includes(search))
      );
    }

    // 2. Category Filter
    if (params.category && params.category !== "ALL" && params.category !== "All") {
      list = list.filter((p) => p.category && p.category.toLowerCase() === params.category!.toLowerCase());
    }

    // 3. Subcategory Filter
    if (params.subcategory && params.subcategory !== "ALL" && params.subcategory !== "All") {
      list = list.filter((p) => {
        const sub = (p.subcategory || p.subCategory || "").toLowerCase();
        return sub === params.subcategory!.toLowerCase();
      });
    }

    // 4. Brand Filter
    if (params.brand && params.brand !== "ALL" && params.brand !== "All") {
      list = list.filter((p) => p.brand && p.brand.toLowerCase() === params.brand!.toLowerCase());
    }

    // 5. Stock Status Filter
    if (params.stockStatus && params.stockStatus !== "ALL" && params.stockStatus !== "All") {
      if (params.stockStatus === 'in_stock') {
        list = list.filter((p) => p.stock > (p.lowStockAlert || 10));
      } else if (params.stockStatus === 'low_stock') {
        list = list.filter((p) => p.stock > 0 && p.stock <= (p.lowStockAlert || 10));
      } else if (params.stockStatus === 'out_of_stock') {
        list = list.filter((p) => p.stock <= 0);
      }
    }

    // 6. Status Filter
    if (params.status && params.status !== "ALL" && params.status !== "All") {
      const st = params.status.toLowerCase();
      if (st === 'active' || st === 'published') {
        list = list.filter((p) => p.isPublished || p.status === 'Published' || p.status === 'Active');
      } else if (st === 'inactive') {
        list = list.filter((p) => p.status === 'Inactive' || (!p.isPublished && p.status !== 'Draft'));
      } else if (st === 'draft') {
        list = list.filter((p) => p.status === 'Draft' || !p.isPublished);
      } else if (st === 'out_of_stock' || st === 'out of stock') {
        list = list.filter((p) => p.status === 'Out of Stock' || p.stock <= 0);
      }
    }

    // 7. Price Range Filter
    if (params.minPrice !== undefined && !isNaN(Number(params.minPrice))) {
      list = list.filter((p) => p.price >= Number(params.minPrice));
    }
    if (params.maxPrice !== undefined && !isNaN(Number(params.maxPrice))) {
      list = list.filter((p) => p.price <= Number(params.maxPrice));
    }

    // 8. Date Range Filter
    if (params.dateFilter && params.dateFilter !== "ALL" && params.dateFilter !== "All") {
      const now = new Date();
      if (params.dateFilter === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        list = list.filter((p) => p.createdAt && p.createdAt.startsWith(todayStr));
      } else if (params.dateFilter === '7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        list = list.filter((p) => p.createdAt && new Date(p.createdAt) >= sevenDaysAgo);
      } else if (params.dateFilter === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        list = list.filter((p) => p.createdAt && new Date(p.createdAt) >= thirtyDaysAgo);
      }
    }

    // 9. Sorting
    if (params.sort) {
      switch (params.sort) {
        case "price_asc":
          list.sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
          list.sort((a, b) => b.price - a.price);
          break;
        case "name_asc":
          list.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name_desc":
          list.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "stock_asc":
          list.sort((a, b) => a.stock - b.stock);
          break;
        case "stock_desc":
          list.sort((a, b) => b.stock - a.stock);
          break;
        case "discount_desc":
          list.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
          break;
        case "oldest":
          list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
          break;
        case "newest":
        default:
          list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          break;
      }
    }

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return {
      items,
      data: items,
      products: items,
      total,
      page,
      limit,
      totalPages
    };
  }
}

export const productStore = new ProductStore();
