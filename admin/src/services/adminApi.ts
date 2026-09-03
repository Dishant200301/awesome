import {
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_SUBCATEGORIES,
  MOCK_BRANDS,
  MOCK_ATTRIBUTES,
  MOCK_CONTACT_MESSAGES,
  getGlobalVariantsList,
  getAdminProducts,
  deleteAdminProduct
} from "../data/mockAdminData";
import { Product, Category, Subcategory, Brand, Attribute, ContactMessage, SizeGuide, HeroSlide, HomepageBanner, AdminReviewItem } from "../types/admin";

import { getAdminApiBase, getAdminAuthHeaders } from "../utils/authHeaders";

const API_BASE = getAdminApiBase();

export class AdminApiService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: getAdminAuthHeaders(options?.headers as Record<string, string>),
        ...options,
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.data !== undefined ? data.data : data;
    } catch {
      return null;
    }
  }

  // Content: Hero Slides & Promo Banner
  public static async getHeroSlides(): Promise<HeroSlide[] | null> {
    return this.request<HeroSlide[]>("/content/hero-slides");
  }

  public static async syncHeroSlides(slides: HeroSlide[]): Promise<any> {
    return this.request<any>("/content/hero-slides/sync", {
      method: "POST",
      body: JSON.stringify({ slides })
    });
  }

  public static async getPromoBanner(): Promise<HomepageBanner | null> {
    return this.request<HomepageBanner>("/content/promo-banner");
  }

  public static async updatePromoBanner(banner: HomepageBanner): Promise<any> {
    return this.request<any>("/content/promo-banner", {
      method: "POST",
      body: JSON.stringify(banner)
    });
  }

  // Dashboard Stats
  public static async getDashboardStats() {
    // 1. Calculate live categories from localStorage
    let categoryCount = 0;
    try {
      const rawCat = localStorage.getItem('awesome_categories') || localStorage.getItem('aocind_categories');
      if (rawCat) {
        const parsed = JSON.parse(rawCat);
        if (Array.isArray(parsed)) {
          categoryCount = parsed.filter((c: any) => c.type !== 'sub' && !c.parentId).length;
        }
      }
    } catch (e) {}

    // Calculate live attributes from localStorage
    let attributeCount = 6;
    try {
      const rawAttr = localStorage.getItem('awesome_admin_attribute_master_v3') || localStorage.getItem('awesome_attributes');
      if (rawAttr) {
        const parsed = JSON.parse(rawAttr);
        if (Array.isArray(parsed)) {
          attributeCount = parsed.length;
        }
      }
    } catch (e) {}

    // Calculate live variants from products
    const liveVariants = getGlobalVariantsList();
    const products = getAdminProducts();
    const published = products.filter((p) => p.isPublished !== false && p.status !== 'Draft' && p.status !== 'Inactive').length;
    const draft = products.length - published;
    const lowStock = products.filter((p) => (p.stock || 0) <= 20);

    // 2. Try remote API first
    const remote = await this.request<any>("/analytics/dashboard");
    if (remote) {
      // Ensure category count, attribute count and variants count accurately match live admin state
      return {
        ...remote,
        totalProducts: products.length || (remote.totalProducts ?? 0),
        publishedProducts: published,
        draftProducts: draft,
        totalVariants: liveVariants.length > 0 ? liveVariants.length : (remote.totalVariants ?? 0),
        totalCategories: categoryCount !== undefined && localStorage.getItem('awesome_categories') ? categoryCount : (remote.totalCategories ?? 0),
        totalAttributes: attributeCount,
        lowStockCount: lowStock.length
      };
    }

    // 3. Fallback sync with live local state
    return {
      totalProducts: products.length,
      publishedProducts: published,
      draftProducts: draft,
      totalVariants: liveVariants.length,
      totalCategories: categoryCount,
      totalAttributes: attributeCount,
      lowStockCount: lowStock.length,
      totalMessages: MOCK_CONTACT_MESSAGES.length,
      unreadMessagesCount: MOCK_CONTACT_MESSAGES.filter((m) => m.status === 'New').length,
      recentProducts: products.slice(0, 5),
      recentMessages: MOCK_CONTACT_MESSAGES.slice(0, 5),
      lowStockProducts: lowStock
    };
  }

  // Product CRUD
  public static async getProducts(params?: {
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
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.category) query.append("category", params.category);
    if (params?.subcategory) query.append("subcategory", params.subcategory);
    if (params?.brand) query.append("brand", params.brand);
    if (params?.stockStatus) query.append("stockStatus", params.stockStatus);
    if (params?.status) query.append("status", params.status);
    if (params?.minPrice !== undefined) query.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice !== undefined) query.append("maxPrice", params.maxPrice.toString());
    if (params?.dateFilter) query.append("dateFilter", params.dateFilter);
    if (params?.sort) query.append("sort", params.sort);

    const remote = await this.request<any>(`/products?${query.toString()}`);
    if (remote && remote.items) return remote;

    // Fallback in-memory querying
    let list = [...MOCK_PRODUCTS];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((p) => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.brand && p.brand.toLowerCase().includes(q)) || 
        (p.category && p.category.toLowerCase().includes(q)) || 
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.defaultSku && p.defaultSku.toLowerCase().includes(q))
      );
    }
    if (params?.category && params.category !== 'All' && params.category !== 'ALL') {
      list = list.filter((p) => p.category && p.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.subcategory && params.subcategory !== 'All' && params.subcategory !== 'ALL') {
      list = list.filter((p) => {
        const sub = (p.subcategory || p.subCategory || "").toLowerCase();
        return sub === params.subcategory!.toLowerCase();
      });
    }
    if (params?.brand && params.brand !== 'All' && params.brand !== 'ALL') {
      list = list.filter((p) => p.brand && p.brand.toLowerCase() === params.brand!.toLowerCase());
    }
    if (params?.status && params.status !== 'All' && params.status !== 'ALL') {
      const st = params.status.toLowerCase();
      if (st === 'published' || st === 'active') list = list.filter((p) => p.isPublished || p.status === 'Published' || p.status === 'Active');
      else if (st === 'draft') list = list.filter((p) => !p.isPublished || p.status === 'Draft');
      else if (st === 'inactive') list = list.filter((p) => p.status === 'Inactive');
      else if (st === 'out_of_stock' || st === 'out of stock') list = list.filter((p) => p.status === 'Out of Stock' || p.stock <= 0);
    }
    if (params?.stockStatus && params.stockStatus !== 'All' && params.stockStatus !== 'ALL') {
      if (params.stockStatus === 'in_stock') list = list.filter(p => p.stock > (p.lowStockAlert || 10));
      else if (params.stockStatus === 'low_stock') list = list.filter(p => p.stock > 0 && p.stock <= (p.lowStockAlert || 10));
      else if (params.stockStatus === 'out_of_stock') list = list.filter(p => p.stock <= 0);
    }
    if (params?.minPrice !== undefined && !isNaN(params.minPrice)) {
      list = list.filter(p => p.price >= params.minPrice!);
    }
    if (params?.maxPrice !== undefined && !isNaN(params.maxPrice)) {
      list = list.filter(p => p.price <= params.maxPrice!);
    }

    if (params?.sort) {
      if (params.sort === 'price_asc') list.sort((a, b) => a.price - b.price);
      else if (params.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
      else if (params.sort === 'name_asc') list.sort((a, b) => a.name.localeCompare(b.name));
      else if (params.sort === 'name_desc') list.sort((a, b) => b.name.localeCompare(a.name));
      else if (params.sort === 'stock_asc') list.sort((a, b) => a.stock - b.stock);
      else if (params.sort === 'stock_desc') list.sort((a, b) => b.stock - a.stock);
      else if (params.sort === 'discount_desc') list.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
      else if (params.sort === 'oldest') list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      else list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const items = list.slice((page - 1) * limit, page * limit);

    return { items, total, page, limit, totalPages };
  }

  public static async getProductById(id: string): Promise<Product | null> {
    const remote = await this.request<Product>(`/products/${id}`);
    if (remote) return remote;
    const all = getAdminProducts();
    const found = all.find((p) => String(p.id) === String(id) || p.slug === id);
    if (found) return found;
    return MOCK_PRODUCTS.find((p) => String(p.id) === String(id) || p.slug === id) || null;
  }

  public static async createProduct(productData: Partial<Product>): Promise<Product> {
    const remote = await this.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(productData)
    });
    if (remote) {
      const idx = MOCK_PRODUCTS.findIndex((p) => String(p.id) === String(remote.id));
      if (idx !== -1) {
        MOCK_PRODUCTS[idx] = remote;
      } else {
        MOCK_PRODUCTS.unshift(remote);
      }
      return remote;
    }

    const newProd: Product = {
      id: productData.id || `prod-${Date.now()}`,
      name: productData.name || "New Product",
      slug: productData.slug || (productData.name ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'new-product'),
      sku: productData.sku || `AWH-${Date.now()}`,
      category: productData.category || "Latkan",
      subcategory: productData.subcategory || "Mirror Latkan",
      categories: productData.categories || [productData.category || "Latkan"],
      brand: productData.brand || "Awesome Handmade",
      collections: productData.collections || [],
      tags: productData.tags || [],
      price: productData.price || 799,
      originalPrice: productData.originalPrice || 1299,
      costPrice: productData.costPrice || 350,
      stock: productData.stock || 100,
      rating: 5.0,
      salesCount: 0,
      status: productData.status || (productData.isPublished !== false ? 'Published' : 'Draft'),
      isPublished: productData.isPublished !== undefined ? productData.isPublished : true,
      type: (productData.variations && productData.variations.length > 0) ? 'Variable' : 'Simple',
      shortDescription: productData.shortDescription || "",
      fullDescription: productData.fullDescription || "",
      images: productData.images || ['/images/category/Latkan.webp'],
      labels: { featured: true, bestSeller: false, newArrival: true, sale: false },
      inventory: { sku: productData.sku || `AWH-${Date.now()}`, barcode: '890123456789', stock: productData.stock || 100, lowStockAlert: 20, allowBackorders: false, trackInventory: true },
      shipping: productData.shipping || { weight: 0.15, length: 20, width: 15, height: 4 },
      seo: productData.seo || { metaTitle: productData.name || '', metaDescription: '', keywords: '', canonicalUrl: '' },
      attributes: productData.attributes || [],
      variants: productData.variants || productData.variations || [],
      variations: productData.variations || [],
      descriptionCards: productData.descriptionCards || [],
      highlights: productData.highlights || [],
      washingInstructions: productData.washingInstructions || [],
      manufacturingInfo: productData.manufacturingInfo || undefined,
      idealForPills: productData.idealForPills || [],
      createdAt: productData.createdAt || new Date().toISOString().split('T')[0]
    };

    MOCK_PRODUCTS.unshift(newProd);
    return newProd;
  }

  public static async updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
    const remote = await this.request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData)
    });
    if (remote) {
      const idx = MOCK_PRODUCTS.findIndex((p) => String(p.id) === String(id));
      if (idx !== -1) {
        MOCK_PRODUCTS[idx] = remote;
      } else {
        MOCK_PRODUCTS.unshift(remote);
      }
      return remote;
    }

    const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], ...productData };
    return MOCK_PRODUCTS[idx];
  }

  public static async deleteProduct(id: string): Promise<boolean> {
    try {
      await deleteAdminProduct(id);
      await this.request<any>(`/products/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Delete product network error:", e);
    }
    return true;
  }

  public static async duplicateProduct(id: string): Promise<Product | null> {
    const remote = await this.request<Product>(`/products/${id}/duplicate`, {
      method: "POST"
    });
    if (remote) return remote;

    const original = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!original) return null;
    const cloned: Product = {
      ...original,
      id: `prod-${Date.now()}`,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy`,
      sku: `${original.sku}-COPY`,
      status: 'Draft',
      isPublished: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    MOCK_PRODUCTS.unshift(cloned);
    return cloned;
  }

  public static async updateProductStatus(id: string, status?: string, isPublished?: boolean): Promise<Product | null> {
    const remote = await this.request<Product>(`/products/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, isPublished })
    });
    if (remote) return remote;

    const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const resolvedIsPublished = isPublished !== undefined ? isPublished : status === 'Active' || status === 'Published';
    MOCK_PRODUCTS[idx] = {
      ...MOCK_PRODUCTS[idx],
      isPublished: resolvedIsPublished,
      status: (status || (resolvedIsPublished ? 'Published' : 'Inactive')) as any
    };
    return MOCK_PRODUCTS[idx];
  }

  public static async bulkDeleteProducts(ids: string[]): Promise<boolean> {
    for (const id of ids) {
      await deleteAdminProduct(id);
    }
    try {
      await this.request<any>("/products/bulk-delete", {
        method: "POST",
        body: JSON.stringify({ ids })
      });
    } catch (e) {
      console.warn("Bulk delete network error:", e);
    }
    return true;
  }

  public static async bulkUpdateStatus(ids: string[], isPublished: boolean, status?: string): Promise<boolean> {
    const remote = await this.request<any>("/products/bulk-status", {
      method: "POST",
      body: JSON.stringify({ ids, isPublished, status })
    });
    if (remote) return true;

    MOCK_PRODUCTS.forEach((p) => {
      if (ids.includes(p.id)) {
        p.isPublished = isPublished;
        p.status = (status || (isPublished ? 'Published' : 'Inactive')) as any;
      }
    });
    return true;
  }

  // AI Vision Product Analysis & Content Generator
  public static async generateProductFromImages(
    images: string[],
    hint?: string,
    apiKey?: string
  ): Promise<any> {
    const rawImages = (images || []).filter(Boolean);
    if (rawImages.length === 0) return null;

    try {
      const res = await this.request<any>("/products/ai-generate", {
        method: "POST",
        body: JSON.stringify({ images: rawImages, hint, apiKey })
      });
      return res;
    } catch (e) {
      console.error("AI generation API call failed:", e);
      return null;
    }
  }

  // Helper: Visual Color Analyzer from Image Data using Canvas
  public static async analyzeImageColorPalette(imageSrc: string): Promise<{
    colorName: string;
    colorHex: string;
    secondaryColorName: string;
    secondaryColorHex: string;
    isWarm: boolean;
  }> {
    return new Promise((resolve) => {
      try {
        if (typeof window === 'undefined' || !imageSrc) {
          resolve({ colorName: "Royal Gold", colorHex: "#D4AF37", secondaryColorName: "Antique Gold", secondaryColorHex: "#C59B27", isWarm: true });
          return;
        }

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve({ colorName: "Royal Gold", colorHex: "#D4AF37", secondaryColorName: "Antique Gold", secondaryColorHex: "#C59B27", isWarm: true });
              return;
            }
            ctx.drawImage(img, 0, 0, 64, 64);
            const data = ctx.getImageData(0, 0, 64, 64).data;
            let r = 0, g = 0, b = 0, count = 0;
            const pixelColors: { r: number; g: number; b: number }[] = [];

            for (let i = 0; i < data.length; i += 16) {
              const pr = data[i], pg = data[i+1], pb = data[i+2], pa = data[i+3];
              // Ignore pure white, pure black, and transparent pixels to find the real craft color
              if (pa > 180 && !(pr > 240 && pg > 240 && pb > 240) && !(pr < 20 && pg < 20 && pb < 20)) {
                r += pr;
                g += pg;
                b += pb;
                count++;
                pixelColors.push({ r: pr, g: pg, b: pb });
              }
            }

            if (count > 0) {
              r = Math.round(r / count);
              g = Math.round(g / count);
              b = Math.round(b / count);
            } else {
              r = 212; g = 175; b = 55; // Default Royal Gold
            }

            const primaryHex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

            const namedColors = [
              { name: "Royal Gold", hex: "#D4AF37", r: 212, g: 175, b: 55 },
              { name: "Artisan Maroon", hex: "#800000", r: 128, g: 0, b: 0 },
              { name: "Ruby Crimson", hex: "#9B111E", r: 155, g: 17, b: 30 },
              { name: "Deep Scarlet Red", hex: "#C41E3A", r: 196, g: 30, b: 58 },
              { name: "Royal Peacock Blue", hex: "#1A3B8B", r: 26, g: 59, b: 139 },
              { name: "Midnight Navy", hex: "#001F3F", r: 0, g: 31, b: 63 },
              { name: "Emerald Forest Green", hex: "#1B4D3E", r: 27, g: 77, b: 62 },
              { name: "Mehendi Olive Green", hex: "#617838", r: 97, g: 120, b: 56 },
              { name: "Blush Rose Pink", hex: "#E8A598", r: 232, g: 165, b: 152 },
              { name: "Rani Magenta Pink", hex: "#C71585", r: 199, g: 21, b: 133 },
              { name: "Tangerine Orange", hex: "#E65100", r: 230, g: 81, b: 0 },
              { name: "Mustard Haldi Ochre", hex: "#C59B27", r: 197, g: 155, b: 39 },
              { name: "Plum Royal Purple", hex: "#4A154B", r: 74, g: 21, b: 75 },
              { name: "Midnight Charcoal", hex: "#222222", r: 34, g: 34, b: 34 },
              { name: "Antique Silver", hex: "#A8A8A8", r: 168, g: 168, b: 168 },
              { name: "Pure Ivory Silk", hex: "#FDFBF7", r: 253, g: 251, b: 247 }
            ];

            let closest = namedColors[0];
            let minDist = Infinity;
            for (const nc of namedColors) {
              const dist = Math.sqrt(Math.pow(r - nc.r, 2) + Math.pow(g - nc.g, 2) + Math.pow(b - nc.b, 2));
              if (dist < minDist) {
                minDist = dist;
                closest = nc;
              }
            }

            resolve({
              colorName: closest.name,
              colorHex: primaryHex,
              secondaryColorName: closest.name.includes("Gold") ? "Artisan Maroon" : "Royal Gold",
              secondaryColorHex: closest.name.includes("Gold") ? "#800000" : "#D4AF37",
              isWarm: r > b
            });
          } catch {
            resolve({ colorName: "Royal Gold", colorHex: "#D4AF37", secondaryColorName: "Antique Gold", secondaryColorHex: "#C59B27", isWarm: true });
          }
        };
        img.onerror = () => {
          resolve({ colorName: "Royal Gold", colorHex: "#D4AF37", secondaryColorName: "Antique Gold", secondaryColorHex: "#C59B27", isWarm: true });
        };
        img.src = imageSrc;
      } catch {
        resolve({ colorName: "Royal Gold", colorHex: "#D4AF37", secondaryColorName: "Antique Gold", secondaryColorHex: "#C59B27", isWarm: true });
      }
    });
  }

  // AI Product Content Generator (Accepts 1 or Multiple Images)
  public static async generateProductDetailsFromImage(imageBase64: string | string[], hint?: string, customApiKey?: string) {
    const images = Array.isArray(imageBase64) ? imageBase64.filter(Boolean) : (imageBase64 ? [imageBase64] : []);
    return this.generateProductDetailsFromImages(images, hint, customApiKey);
  }

  public static async generateProductDetailsFromImages(images: string[], hint?: string, customApiKey?: string) {
    const key = customApiKey || (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '');
    const cleanImages = (images || []).filter(Boolean);

    // 1. Direct Client-side Gemini Multi-Modal Vision API Call
    if (key && cleanImages.length > 0) {
      try {
        const imageParts = cleanImages.map((img) => {
          let base64Data = img;
          let mimeType = "image/jpeg";
          if (img.includes("data:")) {
            const match = img.match(/^data:(image\/\w+);base64,(.+)$/);
            if (match) {
              mimeType = match[1];
              base64Data = match[2];
            }
          }
          return {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          };
        });

        const promptText = `You are an expert luxury e-commerce catalog specialist for "Awesome Handmade", an Indian handcrafted fashion & accessories brand specializing in authentic handmade Tassels, Mirror Latkans, Cholis, Gift Hampers, Hair Accessories, and Jewellery.

Analyze all ${cleanImages.length} PROVIDED PRODUCT IMAGE(S) with high visual precision.
Generate a complete, highly specific, and authentic product listing. The generated information MUST strictly reflect the exact product visible in the images (its specific visual color, shape, materials, embroidery, mirror work, beads, tassels, patterns) and MUST NOT be generic or boilerplate.

Available Categories & Subcategories in Store:
- Tassel (Subs: Long Tassels, Saree Tassels, Dupatta Tassels)
- Latkan (Subs: Mirror Latkan, Blouse Latkan, Fabric Latkan, Golden Latkan, Crochet Latkan, Mirror Wall Decor)
- Choli (Subs: Kids Choli, Adult Choli)
- Gift Hamper (Subs: Keychain, Gift Hamper)
- Hair Accessories (Subs: Hair Bow, Hair Clip, Hair Band)
- Necklace (Subs: Mirror Necklace, Choker, Jewellery Sets)
- Watch (Subs: Kids Watch, Traditional Watch)
- Earrings (Subs: Mirror Earrings, Hoop Earrings)
- Bracelet, Anklet, Waist Belt, Macrame

${hint ? `User Hint / Specific Instruction: ${hint}` : ""}

Multi-Image & Variant Identification Rules:
1. If the uploaded images show multiple distinct colors or options of the product, set "productType": "Variable".
2. If the uploaded images show a single product / single color (e.g. from multiple angles), set "productType": "Simple".
3. Extract the EXACT dominant color name and hex code (e.g. #8B0000 for Maroon, #1A3B8B for Royal Blue, #D4AF37 for Gold) directly from the visual pixel color in the image.
4. If multiple variants are detected, generate the "variants" array where each variant contains its specific title, colorName, colorHex, SKU, price, originalPrice (MRP), discountPercentage, stock, and imageIndex (0 to ${cleanImages.length - 1}).

Formatting Requirements for "fullDescription":
Must be rich text with HTML tags (<h2>, <p>, <ul>, <li>, <strong>, <em>) containing:
1. <h2>Artisan Heritage & Inspiration</h2>: 2-3 engaging sentences describing the handmade craft, origin (e.g. Surat/Kutch/Rajasthan), and visual allure shown in the photo.
2. <h2>Craftsmanship & Materials</h2>: Detailed breakdown of the exact materials visible in the image (silk resham thread, real glass mirror, metallic zari, beads, latkan hooks, fabric lining).
3. <h2>Styling & Pairing Suggestions</h2>: Specific recommendations for pairing with Sarees, Blouse doris, Dupatta corners, Lehengas, or festive wear.
4. <h2>Product Specifications & Care</h2>: Key dimensions, piece count, finish, and care notes.

Return ONLY a single raw valid JSON object with this exact schema (no markdown triple backticks, no comments):
{
  "name": "Specific Full Product Name with color and craft details",
  "slug": "unique-kebab-case-slug",
  "shortDescription": "2 concise punchy sentences highlighting craftsmanship and beauty.",
  "fullDescription": "<p>Rich HTML formatted description using headings, paragraphs, and lists...</p>",
  "productType": "Simple",
  "category": "Exact Best Match Category Name",
  "subcategory": "Exact Best Match Subcategory Name",
  "brand": "Awesome Handmade",
  "collections": ["Festive Heritage", "Navratri Special"],
  "tags": ["handmade", "mirror-work", "festive-wear", "artisan-craft", "specific-color-tag"],
  "price": 499,
  "originalPrice": 899,
  "costPrice": 180,
  "sku": "AH-TAS-BLU-001",
  "barcode": "890202600101",
  "stock": 50,
  "colors": [
    {
      "id": "col-1",
      "colorName": "Exact Dominant Color Name from photo",
      "colorHex": "#HexCodeOfDominantColor",
      "imageIndex": 0,
      "sizes": ["Pack of 2", "Standard"]
    }
  ],
  "variants": [
    {
      "id": "var-1",
      "title": "Specific Variant Title",
      "colorName": "Color Name",
      "colorHex": "#HexCode",
      "sku": "AH-TAS-CLR-001",
      "price": 499,
      "originalPrice": 899,
      "discountPercentage": 44,
      "stock": 50,
      "imageIndex": 0,
      "productInfo": "Craft details specific to this variant..."
    }
  ],
  "descriptionCards": [
    {
      "id": "card-1",
      "title": "Authentic Craft Feature",
      "description": "Specific detail about the craftsmanship visible in image.",
      "image": "",
      "sortOrder": 1
    },
    {
      "id": "card-2",
      "title": "Premium Material Detail",
      "description": "Specific detail about the resham/mirror/metal beads in image.",
      "image": "",
      "sortOrder": 2
    }
  ],
  "highlights": [
    { "id": "hl-1", "icon": "Sparkles", "title": "100% Handcrafted by Artisans", "description": "Hand-stitched & assembled" },
    { "id": "hl-2", "icon": "Star", "title": "Real Mirror Accents", "description": "High-reflection authentic glass mirrors" },
    { "id": "hl-3", "icon": "Check", "title": "Versatile Ethnic Styling", "description": "Ideal for Sarees, Dupattas, Blouses & Lehengas" }
  ],
  "washingInstructions": [
    { "id": "w-1", "instruction": "Spot clean gently with a dry, clean microfiber cloth" },
    { "id": "w-2", "instruction": "Store flat in a dry cloth pouch or moisture-free box" },
    { "id": "w-3", "instruction": "Keep away from perfumes, direct liquid sprays, and humidity" }
  ],
  "manufacturingInfo": {
    "countryOfOrigin": "India",
    "manufacturer": "Awesome Handmade Artistry",
    "address": "Surat, Gujarat, India",
    "packedBy": "Awesome Handmade",
    "importedBy": "",
    "material": "Specific materials deduced from image (e.g. Resham Silk Thread, Glass Mirror, Brass Beads)",
    "careEmail": "care@awesomehandmade.com",
    "carePhone": "+91 98765 43210"
  },
  "idealForPills": ["Saree Pallu Finishing", "Blouse & Lehenga Latkans", "Festive Celebrations", "Bridal Gifting"],
  "metaTitle": "SEO Optimized Product Title | Awesome Handmade",
  "metaDescription": "Concise high-converting meta description under 155 characters.",
  "keywords": "comma, separated, high, intent, keywords"
}`;

        const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];
        for (const modelName of models) {
          try {
            const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: promptText },
                      ...imageParts
                    ]
                  }
                ]
              })
            });

            if (apiRes.ok) {
              const apiJson = await apiRes.json();
              const rawText = apiJson.candidates?.[0]?.content?.parts?.[0]?.text;
              if (rawText) {
                const cleanedJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
                const parsed = JSON.parse(cleanedJson);
                if (parsed && parsed.name) {
                  return parsed;
                }
              }
            }
          } catch (modelErr) {
            console.warn(`Direct Gemini call with ${modelName} failed:`, modelErr);
          }
        }
      } catch (err) {
        console.warn("Direct Gemini Vision API failed, trying backend server route:", err);
      }
    }

    // 2. Try Backend Server API
    try {
      const res = await fetch(`${API_BASE}/products/ai-generate`, {
        method: "POST",
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ images: cleanImages, image: cleanImages[0], hint, apiKey: key })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.data) return data.data;
      }
    } catch {
      console.warn("Backend server not reachable on port 5000, using intelligent visual color analysis fallback.");
    }

    // 3. Dynamic Visual Pixel & Color Analysis Fallback (NEVER returns static text)
    const firstImg = cleanImages[0] || '';
    const colorAnalysis = await this.analyzeImageColorPalette(firstImg);
    const colorName = colorAnalysis.colorName;
    const colorHex = colorAnalysis.colorHex;
    const timestamp = Date.now().toString().slice(-4);
    const hintText = (hint || "").toLowerCase();

    // Check hint for category or determine based on color tone
    const isCholi = hintText.includes("choli") || hintText.includes("blouse") || hintText.includes("lehenga");
    const isHair = hintText.includes("hair") || hintText.includes("bow") || hintText.includes("clip") || hintText.includes("band");
    const isGift = hintText.includes("gift") || hintText.includes("hamper") || hintText.includes("keychain");
    const isNecklace = hintText.includes("necklace") || hintText.includes("jewellery") || hintText.includes("choker");

    let category = "Latkan";
    let subcategory = "Mirror Latkan";
    let productName = `Handcrafted ${colorName} Mirror-Work Artisan Latkan (Pack of 2)`;
    let price = 449;
    let originalPrice = 799;

    if (isCholi) {
      category = "Choli";
      subcategory = "Kids Choli";
      productName = `Handcrafted ${colorName} Embroidered Festive Choli with Mirror Borders`;
      price = 999;
      originalPrice = 1699;
    } else if (isHair) {
      category = "Hair Accessories";
      subcategory = "Hair Bow";
      productName = `Artisan Handcrafted ${colorName} Velvet & Silk Hair Bow Clip`;
      price = 249;
      originalPrice = 499;
    } else if (isGift) {
      category = "Gift Hamper";
      subcategory = "Gift Hamper";
      productName = `Bespoke Festive ${colorName} Curated Handmade Celebration Gift Box`;
      price = 1299;
      originalPrice = 2199;
    } else if (isNecklace) {
      category = "Necklace";
      subcategory = "Mirror Necklace";
      productName = `Handcrafted ${colorName} Reflective Mirror & Resham Threadwork Necklace`;
      price = 699;
      originalPrice = 1199;
    }

    const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + `-${timestamp}`;
    const skuCode = `AH-${category.substring(0, 3).toUpperCase()}-${colorName.substring(0, 3).toUpperCase()}-${timestamp}`;
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

    return {
      name: productName,
      slug: slug,
      shortDescription: `Exquisitely handcrafted in rich ${colorName.toLowerCase()} tones with authentic artisanal details, mirror work, and premium finishing.`,
      fullDescription: `<h2>Artisan Heritage &amp; Craft Story</h2>
<p>Each piece is meticulously handcrafted by skilled master artisans in Surat, Gujarat. Featuring lustrous silk resham thread in vibrant <strong>${colorName}</strong> paired with authentic reflective glass mirrors and delicate hand-embellished accents that capture the joyous spirit of Indian festivities.</p>
<h2>Craftsmanship &amp; Materials</h2>
<ul>
  <li><strong>Color &amp; Fabric:</strong> Authentic ${colorName} rich texture with precision stitchwork.</li>
  <li><strong>Mirror Accents:</strong> Real reflective glass mirrors with reinforced protective borders.</li>
  <li><strong>Finishing:</strong> High-grade metallic zari wrapping and polished brass accent beads.</li>
</ul>
<h2>Styling &amp; Pairing Suggestions</h2>
<p>Perfect for styling with designer sarees, bridal lehenga doris, festival dupattas, or traditional festive attire. Adds a distinctive touch of artisanal elegance to your wardrobe.</p>`,
      productType: cleanImages.length > 1 ? "Variable" : "Simple",
      category: category,
      subcategory: subcategory,
      brand: "Awesome Handmade",
      collections: ["Festive Heritage", "Navratri Special", "Artisan Essentials"],
      tags: ["handmade", category.toLowerCase(), colorName.toLowerCase(), "mirror-work", "festive-wear", "awesome-handmade"],
      price: price,
      originalPrice: originalPrice,
      costPrice: Math.round(price * 0.4),
      sku: skuCode,
      barcode: `8902026${timestamp}`,
      stock: 50,
      colors: [
        {
          id: "col-1",
          colorName: colorName,
          colorHex: colorHex,
          imageIndex: 0,
          sizes: ["Pack of 2", "Standard Pair"]
        }
      ],
      variants: cleanImages.map((img, idx) => ({
        id: `var-${idx + 1}`,
        title: `${productName} - Option ${idx + 1}`,
        colorName: idx === 0 ? colorName : `${colorName} Accent`,
        colorHex: idx === 0 ? colorHex : colorAnalysis.secondaryColorHex,
        sku: `${skuCode}-${idx + 1}`,
        price: price,
        originalPrice: originalPrice,
        discountPercentage: discount,
        stock: 50,
        imageIndex: idx,
        productInfo: `Specific handmade craftsmanship for Option ${idx + 1} in ${colorName}.`
      })),
      descriptionCards: [
        {
          id: "card-1",
          title: "Authentic Gujarati Mirror Craft",
          description: `Hand-stitched in vibrant ${colorName} with precision glass mirror highlights.`,
          image: "",
          sortOrder: 1
        },
        {
          id: "card-2",
          title: "Durable Heritage Resham Thread",
          description: "Made with high-tensile colorfast resham threads that retain their luster for years.",
          image: "",
          sortOrder: 2
        }
      ],
      highlights: [
        { id: "hl-1", icon: "Sparkles", title: "100% Handcrafted", description: `Handcrafted in ${colorName} tones` },
        { id: "hl-2", icon: "Star", title: "Real Mirror Highlights", description: "Authentic reflective glass mirrors" },
        { id: "hl-3", icon: "Shield", title: "Premium Quality Finish", description: "Long-lasting colorfast materials" }
      ],
      washingInstructions: [
        { id: "w-1", instruction: "Spot clean gently with a dry microfiber cloth" },
        { id: "w-2", instruction: "Keep away from direct moisture, perfumes, and humidity" },
        { id: "w-3", instruction: "Store in a dry cloth pouch or moisture-free box" }
      ],
      manufacturingInfo: {
        countryOfOrigin: "India",
        manufacturer: "Awesome Handmade Artistry",
        address: "Surat, Gujarat, India",
        packedBy: "Awesome Handmade",
        importedBy: "",
        material: `Resham Silk Thread in ${colorName}, Real Glass Mirror, Brass Accent Beads`,
        careEmail: "care@awesomehandmade.com",
        carePhone: "+91 98765 43210"
      },
      idealForPills: ["Saree Pallu & Dupatta Borders", "Blouse & Lehenga Latkans", "Navratri & Festive Events", "Wedding Gifting"],
      metaTitle: `${productName} | Awesome Handmade`,
      metaDescription: `Shop ${productName}. Authentic handcrafted ${category.toLowerCase()} in ${colorName} with mirror work. Free shipping available.`,
      keywords: `${category.toLowerCase()}, handmade ${category.toLowerCase()}, ${colorName.toLowerCase()} latkan, awesome handmade`
    };
  }

  // Taxonomies CRUD
  public static async getCategories(): Promise<{ categories: Category[]; subcategories: Subcategory[] }> {
    const remote = await this.request<any>("/taxonomies/categories");
    if (remote?.categories) return remote;
    if (remote?.data?.categories) return remote.data;
    return { categories: [], subcategories: [] };
  }

  public static async createCategory(data: Partial<Category>): Promise<Category> {
    const remote = await this.request<any>("/taxonomies/categories", {
      method: "POST",
      body: JSON.stringify(data)
    });
    if (remote?.data) return remote.data;
    if (remote) return remote;

    return {
      id: data.id || `cat-${Date.now()}`,
      name: data.name || "New Category",
      slug: data.slug || (data.name ? data.name.toLowerCase().replace(/\s+/g, '-') : 'new-category'),
      productCount: 0,
      isActive: true
    };
  }

  public static async deleteCategory(id: string): Promise<boolean> {
    const res = await this.request<any>(`/taxonomies/categories/${id}`, {
      method: "DELETE"
    });
    return !!res;
  }

  public static async getBrands(): Promise<Brand[]> {
    const remote = await this.request<any>("/taxonomies/brands");
    if (Array.isArray(remote)) return remote;
    if (Array.isArray(remote?.data)) return remote.data;
    return [];
  }

  public static async getAttributes(): Promise<Attribute[]> {
    const remote = await this.request<any>("/taxonomies/attributes");
    if (Array.isArray(remote)) return remote;
    if (Array.isArray(remote?.data)) return remote.data;
    return [];
  }

  // Contact Messages CRUD
  public static async getContactMessages(params?: { status?: string; search?: string }): Promise<ContactMessage[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status.toUpperCase() !== 'ALL') query.append("status", params.status);
    if (params?.search) query.append("search", params.search);

    const remote = await this.request<ContactMessage[]>(`/contacts?${query.toString()}`);
    let list: ContactMessage[] = Array.isArray(remote) ? remote : [...MOCK_CONTACT_MESSAGES];

    if (params?.status && params.status.toUpperCase() !== 'ALL') {
      list = list.filter((m) => m.status.toLowerCase() === params.status!.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.message.toLowerCase().includes(q));
    }
    return list;
  }

  public static async updateContactMessageStatus(id: string, status: "New" | "Read" | "Replied" | "Archived", replyText?: string): Promise<ContactMessage | null> {
    const remote = await this.request<ContactMessage>(`/contacts/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, replyText })
    });
    if (remote) return remote;

    const msg = MOCK_CONTACT_MESSAGES.find((m) => m.id === id);
    if (msg) {
      msg.status = status;
      if (replyText) msg.replyText = replyText;
    }
    return msg || null;
  }

  public static async deleteContactMessage(id: string): Promise<boolean> {
    await this.request<any>(`/contacts/${id}`, { method: "DELETE" });
    const idx = MOCK_CONTACT_MESSAGES.findIndex((m) => m.id === id);
    if (idx !== -1) {
      MOCK_CONTACT_MESSAGES.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Size Guides CRUD
  public static async getSizeGuides(): Promise<SizeGuide[]> {
    const remote = await this.request<SizeGuide[]>("/size-guides");
    if (remote) return remote;
    return [];
  }

  public static async createSizeGuide(guide: SizeGuide): Promise<SizeGuide | null> {
    const remote = await this.request<SizeGuide>("/size-guides", {
      method: "POST",
      body: JSON.stringify(guide)
    });
    if (remote) return remote;
    return guide;
  }

  // Customer Reviews & Feedback CRUD
  public static async getReviews(params?: { productId?: string; status?: string; search?: string }): Promise<AdminReviewItem[]> {
    const query = new URLSearchParams();
    if (params?.productId) query.append("productId", params.productId);
    if (params?.status && params.status !== "ALL") query.append("status", params.status);
    if (params?.search) query.append("search", params.search);

    const qs = query.toString();
    const remote = await this.request<AdminReviewItem[]>(`/reviews${qs ? `?${qs}` : ""}`);
    if (Array.isArray(remote)) return remote;
    return [];
  }

  public static async createReview(data: Partial<AdminReviewItem>): Promise<AdminReviewItem | null> {
    return this.request<AdminReviewItem>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public static async updateReviewStatus(id: string, status: "Approved" | "Pending" | "Rejected"): Promise<AdminReviewItem | null> {
    return this.request<AdminReviewItem>(`/reviews/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  public static async deleteReview(id: string): Promise<boolean> {
    const res = await this.request<any>(`/reviews/${id}`, {
      method: "DELETE",
    });
    return res !== null;
  }
}

