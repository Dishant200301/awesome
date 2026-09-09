import { ProductDetails, ProductColorVariation } from "@/modules/product/types/product";

const rawApiUrl = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://api.awesomehandwork.com" : "http://localhost:5000")).trim().replace(/\/+$/, "");
export const API_BASE_URL = rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl}/api/v1`;

// Live Product Store state listeners
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const isLegacyAaramlyProduct = (p: any): boolean => {
  if (!p) return true;
  const str = `${p.name || ""} ${p.category || ""} ${p.subcategory || ""} ${p.subtitle || ""} ${p.brand || ""} ${p.sku || ""} ${p.defaultSku || ""}`.toLowerCase();
  return (
    str.includes("panty") ||
    str.includes("bralette") ||
    str.includes("tactel") ||
    str.includes("innerwear") ||
    str.includes("lingerie") ||
    str.includes("seamless bra") ||
    str.includes("nipple cover") ||
    str.includes("stayfresh") ||
    str.includes("absorbent") ||
    str.includes("period") ||
    str.includes("aaramly") ||
    str.includes("underwear") ||
    p.id === "prod-1" ||
    p.id === "prod-2" ||
    p.id === "prod-3"
  );
};

export const sanitizeClientProducts = (list: any[]): any[] => {
  if (!Array.isArray(list)) return [];
  return list.filter((p) => !isLegacyAaramlyProduct(p));
};

const loadInitialProducts = (): any[] => {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("awesome_admin_products") || localStorage.getItem("awesome_cached_products");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeClientProducts(parsed).filter(
            (p: any) => p.isPublished !== false && p.status !== "Draft" && p.status !== "Inactive"
          );
        }
      }
    }
  } catch (e) {}
  return [];
};

let liveProducts: any[] = loadInitialProducts();
let isLoaded = liveProducts.length > 0;

export const subscribeToProductStore = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((fn) => fn());
};

// Fetch live products dynamically from MySQL Express backend
export const fetchLiveProducts = async (): Promise<any[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      const list = json.data?.items || json.data || json.items || json.products;
      if (Array.isArray(list) && list.length > 0) {
        liveProducts = sanitizeClientProducts(list).filter(
          (p: any) => p.isPublished !== false && p.status !== "Draft" && p.status !== "Inactive"
        );
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("awesome_cached_products", JSON.stringify(liveProducts));
          }
        } catch (e) {}
        isLoaded = true;
        notifyListeners();
        return liveProducts;
      }
    }
  } catch (e) {
    console.warn("Express MySQL backend offline or unreachable.");
  }

  // If liveProducts still empty, check localStorage
  if (liveProducts.length === 0) {
    const fromStorage = loadInitialProducts();
    if (fromStorage.length > 0) {
      liveProducts = fromStorage;
      notifyListeners();
    }
  }

  return liveProducts;
};

// Add product from Admin Panel to live store & post to API
export const addLiveProduct = async (productData: any) => {
  const existingIdx = liveProducts.findIndex((p) => p.id === productData.id);
  if (existingIdx !== -1) {
    liveProducts[existingIdx] = productData;
  } else {
    liveProducts.unshift(productData);
  }
  notifyListeners();

  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    if (res.ok) {
      const json = await res.json();
      await fetchLiveProducts();
      return json.data;
    }
  } catch (e) {
    console.warn("Failed to POST product to API server.");
  }
};

let deletedProductIds = new Set<string>();

// Real-Time Sync with Admin Panel via BroadcastChannel
if (typeof window !== "undefined") {
  const handleProductMessage = (event?: any) => {
    const updatedProd = event?.data?.product;
    if (updatedProd && updatedProd.id) {
      const idx = liveProducts.findIndex((p) => String(p.id) === String(updatedProd.id));
      if (idx !== -1) {
        liveProducts[idx] = updatedProd;
      } else {
        liveProducts.unshift(updatedProd);
      }
      notifyListeners();
    }
    fetchLiveProducts();
  };

  try {
    const channel = new BroadcastChannel("awesome_product_sync");
    channel.onmessage = handleProductMessage;
  } catch (e) {}

  window.addEventListener("awesome_product_sync", () => {
    fetchLiveProducts();
  });

  window.addEventListener("storage", (e) => {
    if (e.key === "awesome_admin_products") {
      const fromStorage = loadInitialProducts();
      if (fromStorage.length > 0) {
        liveProducts = fromStorage;
        notifyListeners();
      }
    }
  });
}

export const updateLiveStoreDirectly = (productsList: any[]) => {
  liveProducts = productsList;
  notifyListeners();
};

// Helper function to format variants to Client ProductColorVariation format
const formatVariantImages = (v: any, index: number, parentProduct: any): any => {
  const colorName = v.colorName || v.color || `Color ${index + 1}`;

  const colorMedia = (parentProduct?.colorMediaConfigs || []).find(
    (cm: any) => cm && (cm.colorName || cm.name || "").toLowerCase() === colorName.toLowerCase()
  );

  const colorObj = (parentProduct?.colors || []).find(
    (c: any) => c && (c.colorName || c.name || c.color || "").toLowerCase() === colorName.toLowerCase()
  );

  // Gather parent product image URLs
  const parentImages: string[] = [];
  if (parentProduct?.mainImage && typeof parentProduct.mainImage === "string" && parentProduct.mainImage.trim()) {
    parentImages.push(parentProduct.mainImage.trim());
  }
  if (parentProduct?.image && typeof parentProduct.image === "string" && parentProduct.image.trim() && !parentImages.includes(parentProduct.image.trim())) {
    parentImages.push(parentProduct.image.trim());
  }
  if (Array.isArray(parentProduct?.galleryImages)) {
    parentProduct.galleryImages.forEach((img: any) => {
      const u = typeof img === "string" ? img : img?.url;
      if (u && typeof u === "string" && u.trim() && !parentImages.includes(u.trim())) parentImages.push(u.trim());
    });
  }
  if (Array.isArray(parentProduct?.images)) {
    parentProduct.images.forEach((img: any) => {
      const u = typeof img === "string" ? img : img?.url;
      if (u && typeof u === "string" && u.trim() && !parentImages.includes(u.trim())) parentImages.push(u.trim());
    });
  }

  const fallbackMainImg = parentImages[0] || (parentProduct?.mainImage || parentProduct?.image || "");

  // 1. Check if the variant itself has explicit images configured in admin
  const variantExplicitImages: string[] = [];
  if (Array.isArray(v.images) && v.images.length > 0) {
    v.images.forEach((u: any) => {
      const urlStr = typeof u === "string" ? u : u?.url;
      if (urlStr && typeof urlStr === "string" && urlStr.trim() && !variantExplicitImages.includes(urlStr.trim())) {
        variantExplicitImages.push(urlStr.trim());
      }
    });
  } else {
    const vMain = (typeof v.mainImage === "string" && v.mainImage.trim() ? v.mainImage.trim() : "") ||
      (typeof v.image === "string" && v.image.trim() ? v.image.trim() : "") ||
      (typeof v.thumbnail === "string" && v.thumbnail.trim() ? v.thumbnail.trim() : "");
    if (vMain) variantExplicitImages.push(vMain);
    if (Array.isArray(v.galleryImages)) {
      v.galleryImages.forEach((u: any) => {
        const urlStr = typeof u === "string" ? u : u?.url;
        if (urlStr && typeof urlStr === "string" && urlStr.trim() && !variantExplicitImages.includes(urlStr.trim())) {
          variantExplicitImages.push(urlStr.trim());
        }
      });
    }
  }

  // 2. Build full gallery: variant images first, followed by all parent product gallery images added in admin
  let rawUrls: string[] = [];
  if (variantExplicitImages.length > 0) {
    rawUrls = [...variantExplicitImages];
    parentImages.forEach((u) => {
      if (u && !rawUrls.includes(u)) {
        rawUrls.push(u);
      }
    });
  } else {
    // 3. Fallback to color media / color config only if variant has no explicit images
    const cmMain = colorMedia?.mainImage || colorObj?.mainImage || colorObj?.displayImage || "";
    if (cmMain) rawUrls.push(cmMain);
    const colorGalleryUrls = (colorMedia?.gallery && Array.isArray(colorMedia.gallery))
      ? colorMedia.gallery
      : (colorObj?.galleryImages && Array.isArray(colorObj.galleryImages))
      ? colorObj.galleryImages
      : [];
    colorGalleryUrls.forEach((u: any) => {
      const urlStr = typeof u === "string" ? u : u?.url;
      if (urlStr && typeof urlStr === "string" && urlStr.trim() && !rawUrls.includes(urlStr.trim())) {
        rawUrls.push(urlStr.trim());
      }
    });

    // 4. Always include parent product images so admin-uploaded gallery is fully visible
    parentImages.forEach((u) => {
      if (u && !rawUrls.includes(u)) {
        rawUrls.push(u);
      }
    });

    if (rawUrls.length === 0) {
      rawUrls = [fallbackMainImg];
    }
  }

  const mainImg = rawUrls[0] || fallbackMainImg;

  const galleryList = rawUrls.length > 0
    ? rawUrls.map((url, i) => ({
        id: `img-${v.id || index}-${i}`,
        url,
        alt: `${parentProduct?.name || ''} - ${colorName} View ${i + 1}`,
      }))
    : [{ id: `img-${v.id || index}-0`, url: fallbackMainImg, alt: `${colorName} Front View` }];

  // Derive hex code for common color names if missing
  let colorHex = colorObj?.colorHex || colorMedia?.colorCode || v.colorHex || "#000000";
  if (!colorHex || colorHex === "#000000") {
    const lower = colorName.toLowerCase();
    if (lower.includes("black")) colorHex = "#000000";
    else if (lower.includes("white")) colorHex = "#FFFFFF";
    else if (lower.includes("pink")) colorHex = "#FFB6C1";
    else if (lower.includes("beige") || lower.includes("nude")) colorHex = "#F5F5DC";
    else if (lower.includes("red") || lower.includes("maroon")) colorHex = "#520618";
    else if (lower.includes("blue")) colorHex = "#1A3B8B";
    else if (lower.includes("green")) colorHex = "#1A5235";
    else if (lower.includes("gold") || lower.includes("yellow")) colorHex = "#C89B3C";
    else if (lower.includes("purple")) colorHex = "#9333EA";
  }

  const varPrice = Number(v.price) || Number(parentProduct?.price) || 799;
  const varOrigPrice = Number(v.originalPrice) || Number(parentProduct?.originalPrice) || Math.round(varPrice * 1.6);
  const discountPct = Math.max(0, Math.round(((varOrigPrice - varPrice) / varOrigPrice) * 100));
  const defaultSize = (colorObj?.sizes && colorObj.sizes[0]) || (parentProduct?.availableSizes && parentProduct.availableSizes[0]) || "Standard Pair";

  const varStock = (v.stock !== undefined && v.stock !== null && !isNaN(Number(v.stock)))
    ? Number(v.stock)
    : ((v.quantity !== undefined && v.quantity !== null && !isNaN(Number(v.quantity)))
      ? Number(v.quantity)
      : (parentProduct?.stock !== undefined && parentProduct?.stock !== null && !isNaN(Number(parentProduct.stock)))
        ? Number(parentProduct.stock)
        : 25);

  return {
    id: v.id || `var-${index}`,
    colorName,
    colorHex,
    size: v.size || v.sizeName || defaultSize,
    sizeName: v.sizeName || v.size || defaultSize,
    thumbnail: mainImg,
    price: varPrice,
    originalPrice: varOrigPrice,
    discountPercentage: discountPct,
    sku: v.sku || parentProduct?.defaultSku || parentProduct?.sku || `AH-${colorName}-${v.size || defaultSize}`,
    stock: varStock,
    images: galleryList,
  };
};

// Get single product details dynamically
export const getLiveProductById = (idOrSlug?: string): ProductDetails | null => {
  if (!idOrSlug) {
    return null;
  }

  const query = String(idOrSlug).trim().toLowerCase();

  const found = liveProducts.find(
    (p) => String(p.id).toLowerCase() === query || String(p.slug || "").toLowerCase() === query
  );

  if (!found) {
    return null;
  }

  const parentImages: string[] = [];
  if (found.mainImage && typeof found.mainImage === "string" && found.mainImage.trim()) {
    parentImages.push(found.mainImage.trim());
  }
  if (found.image && typeof found.image === "string" && found.image.trim() && !parentImages.includes(found.image.trim())) {
    parentImages.push(found.image.trim());
  }
  if (Array.isArray(found.galleryImages)) {
    found.galleryImages.forEach((img: any) => {
      const u = typeof img === "string" ? img : img?.url;
      if (u && typeof u === "string" && u.trim() && !parentImages.includes(u.trim())) {
        parentImages.push(u.trim());
      }
    });
  }
  if (Array.isArray(found.images)) {
    found.images.forEach((img: any) => {
      const u = typeof img === "string" ? img : img?.url;
      if (u && typeof u === "string" && u.trim() && !parentImages.includes(u.trim())) {
        parentImages.push(u.trim());
      }
    });
  }

  const rawVariants = found.variations || found.variants || [];
  let mappedVariations: ProductColorVariation[] = [];

  if (Array.isArray(rawVariants) && rawVariants.length > 0) {
    mappedVariations = rawVariants.map((v: any, i: number) => formatVariantImages(v, i, found));
  }

  // Synthesize missing color variations from found.colors if present
  if (Array.isArray(found.colors) && found.colors.length > 0) {
    found.colors.forEach((col: any) => {
      const exists = mappedVariations.some(
        (v) => (v.colorName || "").toLowerCase() === (col.colorName || "").toLowerCase()
      );
      if (!exists) {
        const colSizes = (col.sizes && col.sizes.length > 0) ? col.sizes : (found.availableSizes || ["S", "M", "L"]);
        colSizes.forEach((sz: string, sIdx: number) => {
          const mainImg = col.mainImage || col.displayImage || (parentImages[0]) || "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=800";
          const rawGals: string[] = [];
          if (mainImg) rawGals.push(mainImg);
          (col.galleryImages || []).forEach((gUrl: string) => {
            if (gUrl && typeof gUrl === "string" && gUrl.trim() && !rawGals.includes(gUrl.trim())) {
              rawGals.push(gUrl.trim());
            }
          });
          const gallery = rawGals.map((gUrl: string, idx: number) => ({
            id: `img-gal-${idx}`,
            url: gUrl,
            alt: `${found.name} - ${col.colorName} ${idx + 1}`
          }));
          mappedVariations.push({
            id: `v-synth-${col.colorName}-${sz}-${sIdx}`,
            colorName: col.colorName,
            colorHex: col.colorHex || "#000000",
            size: sz,
            sizeName: sz,
            thumbnail: col.displayImage || mainImg,
            price: Number(found.price) || 799,
            originalPrice: Number(found.originalPrice) || 1299,
            discountPercentage: 38,
            sku: found.defaultSku || found.sku || `AH-${col.colorName}-${sz}`,
            stock: Number(found.stock) !== undefined ? Number(found.stock) : 50,
            images: gallery
          });
        });
      }
    });
  }

  // Synthesize missing color variations from found.colorMediaConfigs if present
  if (Array.isArray(found.colorMediaConfigs) && found.colorMediaConfigs.length > 0) {
    found.colorMediaConfigs.forEach((cm: any) => {
      const exists = mappedVariations.some(
        (v) => (v.colorName || "").toLowerCase() === (cm.colorName || "").toLowerCase()
      );
      if (!exists && cm.colorName) {
        const cMain = cm.mainImage || parentImages[0] || (found.mainImage || found.image || "");
        const cGal = (cm.gallery && cm.gallery.length > 0) ? cm.gallery : parentImages;
        const allUrls = Array.from(new Set([cMain, ...cGal])).filter(Boolean);
        mappedVariations.push({
          id: cm.colorValueId || `v-cm-${cm.colorName}`,
          colorName: cm.colorName,
          colorHex: cm.colorCode || "#000000",
          size: (found.availableSizes && found.availableSizes[0]) || "Standard Pair",
          sizeName: (found.availableSizes && found.availableSizes[0]) || "Standard Pair",
          thumbnail: cMain,
          price: Number(found.price) || 799,
          originalPrice: Number(found.originalPrice) || 1299,
          discountPercentage: 38,
          sku: found.defaultSku || found.sku || `AH-${cm.colorName}-STD`,
          stock: Number(found.stock) !== undefined ? Number(found.stock) : 50,
          images: allUrls.map((url: string, i: number) => ({ id: `img-cm-${i}`, url, alt: `${found.name} - ${cm.colorName} ${i + 1}` }))
        });
      }
    });
  }

  if (mappedVariations.length === 0) {
    const mainImg = parentImages[0] || (found.mainImage || found.image || "");
    const gallery = parentImages.length > 0
      ? parentImages.map((url, i) => ({ id: `img-def-${i}`, url, alt: `${found.name} View ${i + 1}` }))
      : (mainImg ? [{ id: "img-def-0", url: mainImg, alt: found.name }] : []);

    const priceNum = Number(found.price) || 799;
    const origPriceNum = Number(found.originalPrice) || Math.round(priceNum * 1.6);
    const discPct = Math.max(0, Math.round(((origPriceNum - priceNum) / origPriceNum) * 100));

    mappedVariations = [{
      id: "v-default",
      colorName: "Standard",
      colorHex: "#C89B3C",
      size: (found.availableSizes && found.availableSizes[0]) || "Standard Pair",
      sizeName: (found.availableSizes && found.availableSizes[0]) || "Standard Pair",
      thumbnail: mainImg,
      price: priceNum,
      originalPrice: origPriceNum,
      discountPercentage: discPct,
      sku: found.defaultSku || found.sku || "AH-SKU-100",
      stock: Number(found.stock) !== undefined ? Number(found.stock) : 50,
      images: gallery,
    }];
  }

  // Build descriptionCards if admin provided images or custom cards
  let descCards = found.descriptionCards;
  if (!descCards || descCards.length === 0) {
    if (parentImages.length > 0) {
      descCards = [
        {
          id: "card-1",
          title: found.name || "Authentic Handcrafted Artistry",
          subtitle: found.shortDescription || found.subtitle || "Expertly crafted with traditional techniques in Surat, Gujarat",
          image: parentImages[0] || ""
        },
        {
          id: "card-2",
          title: "Intricate Mirror & Beadwork",
          subtitle: "Precision glass mirrors framed with golden zari thread and fine embellishments",
          image: parentImages[1] || parentImages[0] || ""
        },
        {
          id: "card-3",
          title: "Festive & Bridal Elegance",
          subtitle: "Perfect statement piece for lehengas, dupattas, blouses and designer wear",
          image: parentImages[2] || parentImages[0] || ""
        },
        {
          id: "card-4",
          title: "Durable & Lightweight",
          subtitle: "Long-lasting anti-tarnish finish with secure hanging tie loops",
          image: parentImages[3] || parentImages[0] || ""
        }
      ];
    } else {
      descCards = [];
    }
  }

  const productHighlights = Array.isArray(found.highlights) && found.highlights.length > 0
    ? found.highlights
    : (Array.isArray(found.keyFeatures) && found.keyFeatures.length > 0
        ? found.keyFeatures
        : []);

  return {
    id: found.id,
    type: (found.type as any) || (mappedVariations.length > 1 && mappedVariations[0]?.colorName !== 'Standard' ? 'Variable' : 'Simple'),
    brand: found.brand || "Awesome Handmade",
    name: found.name || "",
    subtitle: found.subtitle || found.shortDescription || "",
    shortDescription: found.shortDescription || found.subtitle || "",
    fullDescription: found.fullDescription || found.description || "",
    price: Number(found.price) || (mappedVariations[0] ? Number(mappedVariations[0].price) : 0),
    originalPrice: Number(found.originalPrice) || (mappedVariations[0] ? Number(mappedVariations[0].originalPrice) : 0),
    discountPercentage: found.discountPercentage || (mappedVariations[0] ? mappedVariations[0].discountPercentage : 0),
    rating: Number(found.rating) || 5.0,
    reviewCount: getLiveReviews(String(found.id)).length,
    defaultSku: found.defaultSku || found.sku || (mappedVariations[0] ? mappedVariations[0].sku : "AWH-SKU-100"),
    colors: found.colors || [],
    colorMediaConfigs: found.colorMediaConfigs || [],
    variations: mappedVariations,
    availableSizes: found.availableSizes || (found.sizes ? found.sizes : []),
    descriptionCards: found.descriptionCards || descCards || [],
    highlights: productHighlights,
    features: Array.isArray(found.features) && found.features.length > 0 ? found.features : productHighlights,
    specifications: Array.isArray(found.specifications) && found.specifications.length > 0
      ? found.specifications
      : (found.specs ? Object.entries(found.specs).map(([key, value]) => ({ key, value: String(value) })) : []),
    customAttributes: found.customAttributes || found.productAttributes || [],
    dimensions: found.dimensions,
    weight: found.weight,
    material: found.material || (found.specs && found.specs.material),
    color: found.color,
    size: found.size,
    specs: found.specs || {},
    galleryImages: parentImages,
    images: parentImages,
    mainImage: parentImages[0] || found.image || found.mainImage || "",
    idealForPills: found.idealForPills || (found.category ? [found.category] : []),
    washingInstructions: found.washingInstructions || [],
    reviews: getLiveReviews(String(found.id)),
    sizeChart: found.sizeChart || [],
    extendedDetails: found.extendedDetails || {
      description: found.fullDescription || found.shortDescription || found.subtitle || '',
      specifications: found.specs || {},
      careInstructions: [],
      materialDetails: found.material || ''
    },
    manufacturingInfo: found.manufacturingInfo || {
      countryOfOrigin: 'India',
      manufacturedBy: 'Awesome Handmade Surat',
      marketdBy: 'Awesome Handmade Surat',
      customerCare: {
        email: 'support@awesomehandmade.com',
        phone: '+91 98765 43210',
        address: 'Surat, Gujarat, India'
      }
    },
    relatedProducts: found.relatedProducts || []
  };
};

/**
 * Real-time stock reduction on purchase/checkout
 * Synchronizes immediately across client & admin
 */
export const deductLiveStock = async (
  items: Array<{ productId: string; colorName?: string; size?: string; quantity: number }>
) => {
  let updated = false;

  liveProducts = liveProducts.map((p) => {
    const matchingItems = items.filter((i) => String(i.productId) === String(p.id));
    if (matchingItems.length === 0) return p;

    updated = true;
    const totalDeducted = matchingItems.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
    const oldStock = Number(p.stock) || 0;
    const newStock = Math.max(0, oldStock - totalDeducted);

    // Also deduct matching variations
    const updatedVariations = Array.isArray(p.variations)
      ? p.variations.map((v: any) => {
          const matchItem = matchingItems.find(
            (i) => !i.colorName || (v.colorName || "").toLowerCase() === i.colorName.toLowerCase()
          );
          if (matchItem) {
            const vOldStock = Number(v.stock) || 0;
            return {
              ...v,
              stock: Math.max(0, vOldStock - (Number(matchItem.quantity) || 1))
            };
          }
          return v;
        })
      : p.variations;

    // Also deduct matching variantDetails
    const updatedVariantDetails = Array.isArray(p.variantDetails)
      ? p.variantDetails.map((v: any) => {
          const matchItem = matchingItems.find(
            (i) => !i.colorName || (v.optionValue || v.name || "").toLowerCase().includes(i.colorName.toLowerCase())
          );
          if (matchItem) {
            const vOldQty = Number(v.quantity) || Number(v.stock) || 0;
            const finalQty = Math.max(0, vOldQty - (Number(matchItem.quantity) || 1));
            return {
              ...v,
              quantity: finalQty,
              stock: finalQty
            };
          }
          return v;
        })
      : p.variantDetails;

    return {
      ...p,
      stock: newStock,
      stockStatus: newStock > 0 ? 'in_stock' : 'out_of_stock',
      variations: updatedVariations,
      variantDetails: updatedVariantDetails
    };
  });

  if (updated) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event('awesome_product_sync'));
      try {
        const channel = new BroadcastChannel('awesome_product_sync');
        channel.postMessage({ type: 'SYNC', timestamp: Date.now() });
      } catch (e) {}
    }
    notifyListeners();
  }
};

// ==========================================
// REAL-TIME CUSTOMER REVIEWS MANAGEMENT
// ==========================================
export interface CustomerReviewItem {
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

const deletedReviewIds = new Set<string>();

export const INITIAL_DEMO_REVIEWS: CustomerReviewItem[] = [];

let liveReviews: CustomerReviewItem[] = [];
const reviewListeners = new Set<() => void>();

export const subscribeToReviewStore = (cb: () => void): (() => void) => {
  reviewListeners.add(cb);
  return () => {
    reviewListeners.delete(cb);
  };
};


const notifyReviewListeners = () => {
  reviewListeners.forEach((cb) => {
    try { cb(); } catch (e) {}
  });
};

export const fetchLiveReviews = async (productId?: string): Promise<CustomerReviewItem[]> => {
  try {
    const url = productId ? `${API_BASE_URL}/reviews?productId=${productId}` : `${API_BASE_URL}/reviews`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      const list = json.data || json;
      if (Array.isArray(list)) {
        if (productId) {
          const otherReviews = liveReviews.filter((r) => String(r.productId) !== String(productId));
          liveReviews = [...list, ...otherReviews];
        } else {
          liveReviews = list;
        }
        notifyReviewListeners();
        return getLiveReviews(productId);
      }
    }
  } catch (e) {
    // API server offline fallback
  }
  return getLiveReviews(productId);
};

export const getLiveReviews = (productId?: string): CustomerReviewItem[] => {
  if (productId) {
    return liveReviews.filter((r) => String(r.productId) === String(productId));
  }
  return liveReviews;
};

if (typeof window !== 'undefined') {
  const handleLiveReviewSync = () => {
    fetchLiveReviews();
  };
  try {
    const revBc = new BroadcastChannel('awesome_review_sync');
    revBc.onmessage = handleLiveReviewSync;
  } catch (e) {}
  window.addEventListener("awesome_review_sync", handleLiveReviewSync);
}

export const addCustomerReview = async (review: Omit<CustomerReviewItem, 'id' | 'date'> & { id?: string; date?: string }) => {
  const newRev: CustomerReviewItem = {
    id: review.id || `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    productId: String(review.productId),
    productName: review.productName || 'Handcrafted Product',
    productImage: review.productImage || '',
    author: (review.author || 'Customer').trim().toUpperCase(),
    email: (review.email || '').trim().toLowerCase(),
    rating: Number(review.rating) || 5,
    comment: (review.comment || '').trim(),
    date: review.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    verified: true,
    status: 'Approved',
    createdAt: new Date().toISOString()
  };

  const existing = getLiveReviews();
  liveReviews = [newRev, ...existing.filter((r) => r.id !== newRev.id)];

  // Also attach to the live product
  const prod = liveProducts.find((p) => String(p.id) === String(review.productId));
  if (prod) {
    const prodReviews = Array.isArray(prod.reviews) ? prod.reviews : [];
    prod.reviews = [newRev, ...prodReviews.filter((r: any) => r.id !== newRev.id)];
    prod.reviewCount = prod.reviews.length;
    const sumRatings = prod.reviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 5), 0);
    prod.rating = Number((sumRatings / prod.reviews.length).toFixed(1));
    notifyListeners();
  }

  notifyReviewListeners();

  // Call Server API to persist review directly in MySQL
  try {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRev),
    });
    if (res.ok) {
      const json = await res.json();
      try {
        const revBc = new BroadcastChannel('awesome_review_sync');
        revBc.postMessage({ type: 'SYNC' });
      } catch (e) {}
      if (json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend reviews API offline.');
  }

  return newRev;
};

export const deleteCustomerReview = async (reviewId: string) => {
  liveReviews = liveReviews.filter((r) => r.id !== reviewId);

  // Also remove from live product reviews
  liveProducts.forEach((prod) => {
    if (Array.isArray(prod.reviews)) {
      prod.reviews = prod.reviews.filter((r: any) => r.id !== reviewId);
      prod.reviewCount = prod.reviews.length;
      if (prod.reviews.length > 0) {
        const sumRatings = prod.reviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 5), 0);
        prod.rating = Number((sumRatings / prod.reviews.length).toFixed(1));
      }
    }
  });

  notifyListeners();
  notifyReviewListeners();

  // Call Server API
  try {
    await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
    });
    try {
      const revBc = new BroadcastChannel('awesome_review_sync');
      revBc.postMessage({ type: 'SYNC' });
    } catch (e) {}
  } catch (err) {}
};

let allRawCategories: any[] = [];
let allRawSubcategories: any[] = [];

// Initialize cached taxonomy immediately from localStorage if available
try {
  if (typeof window !== "undefined") {
    const cachedCats = localStorage.getItem("awesome_cached_categories");
    if (cachedCats) {
      const parsed = JSON.parse(cachedCats);
      if (parsed && Array.isArray(parsed.categories)) {
        allRawCategories = parsed.categories;
        allRawSubcategories = parsed.subcategories || [];
      }
    }
  }
} catch (e) {}

export const getInactiveCategoryNames = (): Set<string> => {
  const inactive = new Set<string>();
  if (Array.isArray(allRawCategories)) {
    allRawCategories.forEach((c: any) => {
      if (c.isActive === false) {
        if (c.name) inactive.add(c.name.trim().toLowerCase());
        if (c.slug) inactive.add(c.slug.trim().toLowerCase());
      }
    });
  }
  return inactive;
};

export const getInactiveSubcategoryNames = (): Set<string> => {
  const inactive = new Set<string>();
  if (Array.isArray(allRawSubcategories)) {
    allRawSubcategories.forEach((s: any) => {
      if (s.isActive === false) {
        if (s.name) inactive.add(s.name.trim().toLowerCase());
        if (s.slug) inactive.add(s.slug.trim().toLowerCase());
      }
    });
  }
  return inactive;
};

export const getLiveProductsList = () => {
  const inactiveCats = getInactiveCategoryNames();
  const inactiveSubs = getInactiveSubcategoryNames();

  const map = new Map<string, any>();
  if (Array.isArray(liveProducts)) {
    liveProducts.forEach((p) => {
      if (p && p.id !== undefined && p.id !== null) {
        const catStr = (p.category || "").trim().toLowerCase();
        if (catStr && inactiveCats.has(catStr)) {
          return;
        }
        const subStr = (p.subcategory || p.subCategory || "").trim().toLowerCase();
        if (subStr && inactiveSubs.has(subStr)) {
          return;
        }
        map.set(String(p.id), p);
      }
    });
  }
  return Array.from(map.values());
};

// DYNAMIC FILTER STORE
const DEFAULT_FILTER_CONFIG = {
  categories: [] as any[],
  subcategories: [] as any[],
  colors: [
    { name: 'Maroon', hex: '#520618' },
    { name: 'Royal Gold', hex: '#C89B3C' },
    { name: 'Emerald Green', hex: '#1A5235' },
    { name: 'Peacock Blue', hex: '#004F7A' },
    { name: 'Blush Pink', hex: '#E1306C' },
    { name: 'Pure White', hex: '#FFFFFF' },
    { name: 'Jet Black', hex: '#000000' },
  ],
  sizes: ['Free Size', 'Standard Pair', 'S', 'M', 'L', 'XL', 'Kids (2-4 Yrs)', 'Kids (5-8 Yrs)'],
  minPrice: 0,
  maxPrice: 3000,
  ratings: [5, 4, 3, 2, 1],
};

let liveFilterData: any = { ...DEFAULT_FILTER_CONFIG };

export const fetchLiveFilters = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/filters`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        liveFilterData = json.data;
        filterListeners.forEach((fn) => fn());
        return liveFilterData;
      }
    }
  } catch (e) {
    console.warn("Express server filter API offline, serving local dynamic filters.");
  }
  return getLiveFilters();
};

export const getLiveFilters = () => {
  const currentLiveProds = getLiveProductsList();

  // Helper matching function for accurate category counting
  const matchCat = (prod: any, targetCategory: string): boolean => {
    if (!targetCategory || targetCategory.toLowerCase() === "all") return true;
    const clean = (s?: string) => (s || "").toLowerCase().replace(/[-_\s]+/g, "");
    const target = clean(targetCategory);
    const targetStem = target.endsWith("s") && target.length > 3 ? target.slice(0, -1) : target;
    const cat = clean(prod.category);
    const subcat = clean(prod.subcategory || prod.subCategory);
    const name = clean(prod.name);
    const categoriesList = Array.isArray(prod.categories) ? prod.categories.map(clean) : [];

    if (cat === target || cat === targetStem || subcat === target || subcat === targetStem) return true;
    if (categoriesList.includes(target) || categoriesList.includes(targetStem)) return true;
    if (cat.includes(targetStem) || subcat.includes(targetStem) || target.includes(cat) || targetStem.includes(cat)) return true;
    if (name.includes(targetStem)) return true;
    return false;
  };

  // 1. Dynamic Categories with REAL live counts from actual products
  const liveCats = getLiveCategories()
    .map((c) => {
      const realCount = currentLiveProds.filter((p) => matchCat(p, c.name)).length;
      return {
        name: c.name,
        key: c.name,
        count: realCount,
      };
    })
    .filter((c) => c.count > 0);

  // Also include any product categories from live products not present in list, but EXCLUDE inactive ones!
  const inactiveCats = getInactiveCategoryNames();
  const catNamesSet = new Set(liveCats.map((c) => c.name.toLowerCase()));
  currentLiveProds.forEach((p) => {
    if (p.category) {
      const lower = p.category.toLowerCase().trim();
      if (!catNamesSet.has(lower) && !inactiveCats.has(lower)) {
        const cCount = currentLiveProds.filter((x) => matchCat(x, p.category)).length;
        if (cCount > 0) {
          liveCats.push({
            name: p.category,
            key: p.category,
            count: cCount,
          });
          catNamesSet.add(lower);
        }
      }
    }
  });

  // Color hex lookup
  const colorHexLookup = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes("black")) return "#000000";
    if (lower.includes("white")) return "#FFFFFF";
    if (lower.includes("pink")) return "#FFB6C1";
    if (lower.includes("beige") || lower.includes("nude")) return "#F5F5DC";
    if (lower.includes("maroon")) return "#520618";
    if (lower.includes("red")) return "#DC2626";
    if (lower.includes("blue") || lower.includes("navy")) return "#1A3B8B";
    if (lower.includes("green") || lower.includes("olive")) return "#1A5235";
    if (lower.includes("gold") || lower.includes("yellow")) return "#C89B3C";
    if (lower.includes("purple") || lower.includes("violet")) return "#9333EA";
    if (lower.includes("orange")) return "#EA580C";
    if (lower.includes("brown")) return "#78350F";
    if (lower.includes("grey") || lower.includes("gray")) return "#6B7280";
    return "#520618";
  };

  // 2. Dynamic Pure Colors extracted directly from live products (Cleaned, no "/ S" or size bleed)
  const colorMap = new Map<string, string>();
  const addCleanColor = (rawName: any, hex?: string) => {
    if (!rawName || typeof rawName !== "string") return;
    const parts = rawName.split("/").map((s) => s.trim());
    const pureColor = parts[0];
    if (pureColor && pureColor.toLowerCase() !== "standard" && pureColor.toLowerCase() !== "free size") {
      const finalHex = hex || colorHexLookup(pureColor);
      colorMap.set(pureColor, finalHex);
    }
  };

  // 3. Dynamic Pure Sizes extracted directly from live products (Cleaned, no "Color /")
  const sizesSet = new Set<string>();
  const addCleanSize = (rawSize: any) => {
    if (!rawSize || typeof rawSize !== "string") return;
    const parts = rawSize.split("/").map((s) => s.trim());
    if (parts.length > 1) {
      const pureSize = parts[1];
      if (pureSize && pureSize.toLowerCase() !== "standard") {
        sizesSet.add(pureSize);
      }
    } else {
      const pureSize = parts[0];
      if (
        pureSize &&
        pureSize.toLowerCase() !== "standard" &&
        !colorHexLookup(pureSize).startsWith("#") &&
        pureSize.length <= 15
      ) {
        sizesSet.add(pureSize);
      }
    }
  };

  currentLiveProds.forEach((p) => {
    // Colors from p.colors
    if (Array.isArray(p.colors)) {
      p.colors.forEach((col: any) => {
        const name = typeof col === "string" ? col : col.colorName || col.name || col.color;
        const hex = typeof col === "object" ? col.colorHex || col.hex : undefined;
        addCleanColor(name, hex);
      });
    }
    // Colors & Sizes from p.variations
    if (Array.isArray(p.variations)) {
      p.variations.forEach((v: any) => {
        addCleanColor(v.colorName || v.color, v.colorHex);
        if (v.size) addCleanSize(v.size);
        if (v.sizeName) addCleanSize(v.sizeName);
        if (v.colorName && v.colorName.includes("/")) addCleanSize(v.colorName);
      });
    }
    // Colors & Sizes from p.variantDetails
    if (Array.isArray(p.variantDetails)) {
      p.variantDetails.forEach((v: any) => {
        addCleanColor(v.optionValue || v.name, v.colorHex);
        if (v.optionValue && v.optionValue.includes("/")) addCleanSize(v.optionValue);
        else if (v.name && v.name.includes("/")) addCleanSize(v.name);
      });
    }
    // Colors & Sizes from p.variants
    if (Array.isArray(p.variants)) {
      p.variants.forEach((v: any) => {
        addCleanColor(v.title || v.name || v.colorName, v.colorHex);
        if (v.title && v.title.includes("/")) addCleanSize(v.title);
        else if (v.name && v.name.includes("/")) addCleanSize(v.name);
      });
    }
    // Explicit options from p.productOptions
    if (Array.isArray(p.productOptions)) {
      p.productOptions.forEach((opt: any) => {
        const optName = (opt.name || "").toLowerCase();
        if (optName.includes("color") || optName.includes("colour")) {
          (opt.values || []).forEach((v: string) => addCleanColor(v));
        }
        if (optName.includes("size")) {
          (opt.values || []).forEach((v: string) => addCleanSize(v));
        }
      });
    }
    // Explicit attributes from p.attributes
    if (Array.isArray(p.attributes)) {
      p.attributes.forEach((attr: any) => {
        const attrName = (attr.name || attr.key || "").toLowerCase();
        if (attrName.includes("color") || attrName.includes("colour")) {
          (attr.values || []).forEach((v: string) => addCleanColor(v));
        }
        if (attrName.includes("size")) {
          (attr.values || []).forEach((v: string) => addCleanSize(v));
        }
      });
    }
    // Available sizes
    if (Array.isArray(p.availableSizes)) {
      p.availableSizes.forEach((s: string) => addCleanSize(s));
    }
    if (Array.isArray(p.sizes)) {
      p.sizes.forEach((s: string) => addCleanSize(s));
    }
  });

  const dynamicColors = Array.from(colorMap.entries()).map(([name, hex]) => ({
    name,
    hex,
  }));

  const dynamicSizes = Array.from(sizesSet).filter(
    (sz) => !dynamicColors.some((c) => c.name.toLowerCase() === sz.toLowerCase())
  );

  // 4. Dynamic Max Price from live products
  const prices = currentLiveProds.map((p) => Number(p.price) || 0).filter((pr) => pr > 0);
  const dynamicMaxPrice = prices.length > 0 ? Math.max(...prices, 1000) : 3000;

  // 5. Dynamic Custom Attributes (Material, Craft, Occasion, etc.)
  const attrMap = new Map<string, Set<string>>();
  currentLiveProds.forEach((p) => {
    if (Array.isArray(p.attributes)) {
      p.attributes.forEach((attr: any) => {
        const name = (attr.name || attr.key || "").trim();
        if (name && !name.toLowerCase().includes("color") && !name.toLowerCase().includes("size")) {
          if (!attrMap.has(name)) attrMap.set(name, new Set<string>());
          (attr.values || []).forEach((v: string) => {
            if (v && v.trim()) attrMap.get(name)!.add(v.trim());
          });
        }
      });
    }
    if (Array.isArray(p.productOptions)) {
      p.productOptions.forEach((opt: any) => {
        const name = (opt.name || "").trim();
        if (name && !name.toLowerCase().includes("color") && !name.toLowerCase().includes("size")) {
          if (!attrMap.has(name)) attrMap.set(name, new Set<string>());
          (opt.values || []).forEach((v: string) => {
            if (v && v.trim()) attrMap.get(name)!.add(v.trim());
          });
        }
      });
    }
    if (Array.isArray(p.specifications)) {
      p.specifications.forEach((s: any) => {
        const name = (s.key || "").trim();
        const val = (s.value || "").trim();
        if (name && val && !name.toLowerCase().includes("color") && !name.toLowerCase().includes("size")) {
          if (!attrMap.has(name)) attrMap.set(name, new Set<string>());
          attrMap.get(name)!.add(val);
        }
      });
    }
  });

  const dynamicAttributes = Array.from(attrMap.entries()).map(([name, valSet]) => ({
    name,
    values: Array.from(valSet),
  }));

  const mergedSizes = Array.from(
    new Set([
      ...dynamicSizes,
      ...(Array.isArray(liveFilterData?.sizes) ? liveFilterData.sizes : DEFAULT_FILTER_CONFIG.sizes),
    ])
  );

  return {
    categories: liveCats.length > 0 ? liveCats : (liveFilterData?.categories || []),
    subcategories: Array.isArray(liveFilterData?.subcategories) ? liveFilterData.subcategories : [],
    colors: dynamicColors.length > 0 ? dynamicColors : (liveFilterData?.colors || DEFAULT_FILTER_CONFIG.colors),
    sizes: mergedSizes.length > 0 ? mergedSizes : DEFAULT_FILTER_CONFIG.sizes,
    attributes: dynamicAttributes,
    minPrice: liveFilterData?.minPrice !== undefined ? liveFilterData.minPrice : 0,
    maxPrice: dynamicMaxPrice,
    ratings: [5, 4, 3, 2, 1],
  };
};

const filterListeners = new Set<() => void>();

export const subscribeToFilterStore = (listener: () => void) => {
  filterListeners.add(listener);

  let broadcastChannel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel('awesome_filter_sync');
      broadcastChannel.onmessage = () => {
        fetchLiveFilters();
        filterListeners.forEach((fn) => fn());
      };
    } catch (e) {}
  }

  return () => {
    filterListeners.delete(listener);
    if (broadcastChannel) broadcastChannel.close();
  };
};

// CATEGORIES STORE & ADMIN SYNC
const categoryListeners = new Set<() => void>();
let liveCategoryData: any[] = [];
let isCategoryFetchInitiated = false;

export const subscribeToCategoriesStore = (listener: () => void) => {
  categoryListeners.add(listener);

  if (!isCategoryFetchInitiated) {
    isCategoryFetchInitiated = true;
    fetchLiveCategories();
  }

  let broadcastChannel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel('awesome_category_sync');
      broadcastChannel.onmessage = () => {
        fetchLiveCategories();
        categoryListeners.forEach((fn) => fn());
      };
    } catch (e) {}
  }

  const handleCustomEvent = () => {
    fetchLiveCategories();
    categoryListeners.forEach((fn) => fn());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('awesome_category_sync', handleCustomEvent);
  }

  return () => {
    categoryListeners.delete(listener);
    if (broadcastChannel) broadcastChannel.close();
    if (typeof window !== 'undefined') {
      window.removeEventListener('awesome_category_sync', handleCustomEvent);
    }
  };
};

export const fetchLiveCategories = async (): Promise<any[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/taxonomies/categories`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json?.data && Array.isArray(json.data.categories)) {
        allRawCategories = json.data.categories;
        allRawSubcategories = json.data.subcategories || [];

        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('awesome_cached_categories', JSON.stringify(json.data));
          }
        } catch {}

        const activeCategories = json.data.categories.filter((c: any) => c.isActive !== false);
        const subs = (Array.isArray(json.data.subcategories) ? json.data.subcategories : []).filter((s: any) => s.isActive !== false);
        liveCategoryData = activeCategories.map((cat: any) => {
          const parentSubs = subs.filter((s: any) => 
            s.categoryId === cat.id || s.parentId === cat.id || 
            (s.categoryName && cat.name && s.categoryName.toLowerCase() === cat.name.toLowerCase()) ||
            (s.parentName && cat.name && s.parentName.toLowerCase() === cat.name.toLowerCase())
          );
          return {
            ...cat,
            subs: parentSubs.map((s: any) => ({
              id: s.id,
              name: s.name,
              slug: s.slug || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            }))
          };
        });
        categoryListeners.forEach((fn) => fn());
        notifyListeners();
        return getLiveCategories();
      }
    }
  } catch (e) {
    // Express server taxonomy API offline
  }
  return getLiveCategories();
};

export const getLiveCategories = () => {
  const liveProds = getLiveProductsList();
  let baseCategories: any[] = [];

  // Strictly dynamic from Express API liveCategoryData
  if (Array.isArray(liveCategoryData) && liveCategoryData.length > 0) {
    const activeParents = liveCategoryData.filter((c: any) => c.type !== 'sub' && c.isActive !== false);
    baseCategories = activeParents.map((ac: any) => ({
      id: ac.id,
      name: ac.name,
      slug: ac.slug || ac.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image: ac.image || ac.imageUrl || '',
      subs: ac.subs || [],
    }));
  }

  // Dynamic product count per category
  const countMap = new Map<string, number>();
  liveProds.forEach((p) => {
    if (p && p.category) {
      const c = String(p.category).trim().toLowerCase();
      countMap.set(c, (countMap.get(c) || 0) + 1);
    }
    if (Array.isArray(p?.categories)) {
      p.categories.forEach((catName: string) => {
        const c = String(catName).trim().toLowerCase();
        countMap.set(c, (countMap.get(c) || 0) + 1);
      });
    }
  });

  return baseCategories.map((cat) => {
    const slugKey = (cat.slug || "").toLowerCase();
    const nameKey = (cat.name || "").toLowerCase();
    const liveCount = countMap.get(nameKey) ?? countMap.get(slugKey) ?? 0;
    return {
      ...cat,
      productCount: liveCount,
      count: liveCount > 0 ? `${liveCount} items` : "0 items",
    };
  });
};

// DYNAMIC HERO SLIDER & PROMO BANNER STORE
export interface LiveHeroSlide {
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

export interface LivePromoBanner {
  id: string;
  title?: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  badge?: string;
  buttonText?: string;
  link: string;
  gridPosition?: string;
  showTextOverlay?: boolean;
  status: 'Active' | 'Inactive';
}

const DEFAULT_LIVE_HERO_SLIDES: LiveHeroSlide[] = [
  {
    id: "slide-1",
    tag: "Grace in Every",
    title: "Thread",
    subtitle: "Timeless ethnic wear crafted with love, precision and elegance.",
    image: "/images/home/hero/hero-1.webp",
    mobileImage: "/images/home/hero/mobile-1.webp",
    buttonText: "Shop Collection",
    link: "/shop?category=Choli",
    theme: "gold",
    align: "left",
    status: "Active",
    sortOrder: 1
  },
  {
    id: "slide-2",
    tag: "Artisan Special",
    title: "Twirl Into Tradition",
    subtitle: "Heritage crafted for every celebration.",
    image: "/images/home/hero/hero-2.webp",
    mobileImage: "/images/home/hero/mobile-2.webp",
    buttonText: "Shop Collection",
    link: "/shop?category=Latkan",
    theme: "gold",
    align: "left",
    status: "Active",
    sortOrder: 2
  },
  {
    id: "slide-3",
    tag: "HANDCRAFTED JEWELLERY",
    title: "Threads of Tradition",
    subtitle: "A celebration of colour, craft and culture.",
    image: "/images/home/hero/hero-3.webp",
    mobileImage: "/images/home/hero/mobile-3.webp",
    buttonText: "Shop Collection",
    link: "/shop?category=Necklace",
    theme: "maroon",
    align: "left",
    status: "Active",
    sortOrder: 3
  },
  {
    id: "slide-4",
    tag: "COMFORT • STYLE • TRADITION",
    title: "Kids CHOLI",
    subtitle: "Soft fabric, elegant design, made with love.",
    image: "/images/home/hero/hero-4.webp",
    mobileImage: "/images/home/hero/mobile-4.webp",
    buttonText: "Shop Collection",
    link: "/shop?category=Choli&sub=Kids%20Choli",
    theme: "purple",
    align: "left",
    status: "Active",
    sortOrder: 4
  },
  {
    id: "slide-5",
    tag: "Kids Choli Collection",
    title: "TWIRL IN TRADITION",
    subtitle: "Little styles made for joyful celebrations",
    image: "/images/home/hero/hero-5.webp",
    mobileImage: "/images/home/hero/mobile-5.webp",
    buttonText: "Shop Collection",
    link: "/shop?category=Choli&sub=Kids%20Choli",
    theme: "purple",
    align: "left",
    status: "Active",
    sortOrder: 5
  }
];

const DEFAULT_LIVE_PROMO_BANNER: LivePromoBanner = {
  id: "promo-banner-main",
  title: "Handmade Necklace",
  subtitle: "Crafted with colour, culture & love.",
  image: "/images/banner/banner.webp",
  mobileImage: "/images/banner/mobile-banner.webp",
  badge: "Festive Collection",
  buttonText: "SHOP NOW",
  link: "/shop?category=Necklace",
  gridPosition: "Main Promo Banner",
  showTextOverlay: true,
  status: "Active"
};

let liveHeroSlides: LiveHeroSlide[] = [...DEFAULT_LIVE_HERO_SLIDES];
let livePromoBanner: LivePromoBanner = { ...DEFAULT_LIVE_PROMO_BANNER };

const heroListeners = new Set<() => void>();
const bannerListeners = new Set<() => void>();

export const subscribeToHeroSlides = (listener: () => void) => {
  heroListeners.add(listener);
  return () => {
    heroListeners.delete(listener);
  };
};

export const subscribeToPromoBanner = (listener: () => void) => {
  bannerListeners.add(listener);
  return () => {
    bannerListeners.delete(listener);
  };
};

export const fetchLiveHeroSlides = async (): Promise<LiveHeroSlide[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/content/hero-slides`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        liveHeroSlides = json.data.filter((s: any) => s.status !== 'Inactive');
        heroListeners.forEach(fn => fn());
        return liveHeroSlides;
      }
    }
  } catch (e) {}
  return getLiveHeroSlides();
};

export const getLiveHeroSlides = (): LiveHeroSlide[] => {
  return liveHeroSlides.filter((s) => s.status !== 'Inactive');
};

export const fetchLivePromoBanner = async (): Promise<LivePromoBanner> => {
  try {
    const res = await fetch(`${API_BASE_URL}/content/promo-banner`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.data && (json.data.image || json.data.title)) {
        livePromoBanner = { ...DEFAULT_LIVE_PROMO_BANNER, ...json.data };
        bannerListeners.forEach(fn => fn());
        return livePromoBanner;
      }
    }
  } catch (e) {}
  return getLivePromoBanner();
};

export const getLivePromoBanner = (): LivePromoBanner => {
  return livePromoBanner;
};

// Global real-time content sync listener
if (typeof window !== 'undefined') {
  if ('BroadcastChannel' in window) {
    try {
      const contentBc = new BroadcastChannel('awesome_content_sync');
      contentBc.onmessage = (msg) => {
        if (msg.data?.type === 'HERO_UPDATED') {
          if (Array.isArray(msg.data.slides)) {
            liveHeroSlides = msg.data.slides.filter((s: any) => s.status !== 'Inactive');
            heroListeners.forEach(fn => fn());
          } else {
            fetchLiveHeroSlides();
          }
        }
        if (msg.data?.type === 'BANNER_UPDATED') {
          if (msg.data.banner) {
            livePromoBanner = { ...DEFAULT_LIVE_PROMO_BANNER, ...msg.data.banner };
            bannerListeners.forEach(fn => fn());
          } else {
            fetchLivePromoBanner();
          }
        }
      };
    } catch (e) {}
  }
}

// Trigger initial fetch once
fetchLiveProducts();
fetchLiveFilters();
fetchLiveCategories();
fetchLiveHeroSlides();
fetchLivePromoBanner();
fetchLiveReviews();

// Event-driven real-time refresh on window focus
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    fetchLiveProducts();
    fetchLiveCategories();
    fetchLiveHeroSlides();
    fetchLivePromoBanner();
    fetchLiveReviews();
  });
}



