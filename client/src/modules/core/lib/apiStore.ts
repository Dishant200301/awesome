import { ProductDetails, ProductColorVariation } from "@/modules/product/types/product";
import { SAMPLE_PRODUCT, CLIENT_SHOP_PRODUCTS } from "@/modules/product/data/productData";
import { categories as CATALOG_CATEGORIES } from "@/data/catalog";
import { idbGet, idbSet } from "./idbStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api/v1" : "http://localhost:5000/api/v1");

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

const DEFAULT_CATALOG_PRODUCTS: any[] = sanitizeClientProducts(CLIENT_SHOP_PRODUCTS);

let liveProducts: any[] = [...DEFAULT_CATALOG_PRODUCTS];
let isLoaded = false;

export const subscribeToProductStore = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((fn) => fn());
};

// Fetch live products from MySQL Express backend or local IndexedDB dynamic store
export const fetchLiveProducts = async (): Promise<any[]> => {
  syncDeletedIds();

  // 1. Sync from IndexedDB (contains full admin-managed dynamic products & base64 images)
  if (typeof window !== "undefined") {
    try {
      const stored = await idbGet<any>("awesome_admin_sync");
      if (stored && Array.isArray(stored.products) && stored.products.length > 0) {
        const clean = sanitizeClientProducts(stored.products);
        liveProducts = clean.filter(
          (p: any) => !deletedProductIds.has(String(p.id)) && p.isPublished !== false && p.status !== "Draft"
        );
        isLoaded = true;
        notifyListeners();
      }
    } catch (e) {}

    try {
      const local = localStorage.getItem("awesome_admin_sync");
      if (local && !isLoaded) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed.products) && parsed.products.length > 0) {
          const clean = sanitizeClientProducts(parsed.products);
          liveProducts = clean.filter(
            (p: any) => !deletedProductIds.has(String(p.id)) && p.isPublished !== false && p.status !== "Draft"
          );
          isLoaded = true;
          notifyListeners();
        }
      }
    } catch (e) {}
  }

  // 2. Fetch from backend API if available
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (res.ok) {
      const json = await res.json();
      const list = json.data || json.items || json.products;
      if (Array.isArray(list) && list.length > 0) {
        liveProducts = sanitizeClientProducts(list).filter(
          (p: any) => !deletedProductIds.has(String(p.id)) && p.isPublished !== false && p.status !== "Draft"
        );
        isLoaded = true;
        notifyListeners();
        return liveProducts;
      }
    }
  } catch (e) {
    console.warn("Express MySQL backend offline; serving local dynamic state.");
  }

  liveProducts = sanitizeClientProducts(liveProducts).filter((p: any) => !deletedProductIds.has(String(p.id)));
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

const syncDeletedIds = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('awesome_deleted_products') || localStorage.getItem('aaramly_deleted_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) parsed.forEach((id) => deletedProductIds.add(String(id)));
      }
    } catch (e) {}

    idbGet<string[]>('awesome_deleted_products').then((ids) => {
      if (Array.isArray(ids)) {
        ids.forEach((id) => deletedProductIds.add(String(id)));
      }
    }).catch(() => {});
  }
};
syncDeletedIds();

// BroadcastChannel and Storage Listener for Real-Time Sync with Admin Panel
if (typeof window !== "undefined") {
  const handleProductMessage = (event: MessageEvent) => {
    if (event.data) {
      if (Array.isArray(event.data.deletedIds)) {
        event.data.deletedIds.forEach((id: string) => deletedProductIds.add(String(id)));
        try {
          localStorage.setItem('awesome_deleted_products', JSON.stringify(Array.from(deletedProductIds)));
        } catch (e) {}
      }
      if (Array.isArray(event.data.products)) {
        const clean = sanitizeClientProducts(event.data.products);
        liveProducts = clean.filter((p: any) => !deletedProductIds.has(String(p.id)));
        notifyListeners();
      } else if (event.data.product) {
        const updated = event.data.product;
        if (!deletedProductIds.has(String(updated.id))) {
          const idx = liveProducts.findIndex((p) => String(p.id) === String(updated.id));
          if (idx !== -1) {
            liveProducts[idx] = updated;
          } else {
            liveProducts.unshift(updated);
          }
          notifyListeners();
        }
      }
    }
  };

  try {
    const channel = new BroadcastChannel("awesome_product_sync");
    channel.onmessage = handleProductMessage;
    const legacyChannel = new BroadcastChannel("aaramly_product_sync");
    legacyChannel.onmessage = handleProductMessage;
  } catch (e) {}

  window.addEventListener("storage", (e) => {
    if ((e.key === "awesome_deleted_products" || e.key === "aaramly_deleted_products") && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) parsed.forEach((id) => deletedProductIds.add(String(id)));
        notifyListeners();
      } catch (err) {}
    }
    if ((e.key === "awesome_admin_sync" || e.key === "aaramly_admin_sync") && e.newValue) {
      try {
        syncDeletedIds();
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed.deletedIds)) {
          parsed.deletedIds.forEach((id: string) => deletedProductIds.add(String(id)));
        }
        if (Array.isArray(parsed.products)) {
          const clean = sanitizeClientProducts(parsed.products);
          liveProducts = clean.filter((p: any) => !deletedProductIds.has(String(p.id)) && p.isPublished !== false && p.status !== 'Draft');
          notifyListeners();
        }
      } catch (err) {}
    }
  });

  const handleProductSyncEvent = () => {
    try {
      syncDeletedIds();
      const stored = localStorage.getItem("awesome_admin_sync") || localStorage.getItem("aaramly_admin_sync");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.deletedIds)) {
          parsed.deletedIds.forEach((id: string) => deletedProductIds.add(String(id)));
        }
        if (Array.isArray(parsed.products)) {
          const clean = sanitizeClientProducts(parsed.products);
          liveProducts = clean.filter((p: any) => !deletedProductIds.has(String(p.id)) && p.isPublished !== false && p.status !== 'Draft');
          notifyListeners();
        }
      }
    } catch (e) {}

    // Also sync from IndexedDB
    idbGet<any>("awesome_admin_sync").then((stored) => {
      if (stored) {
        if (Array.isArray(stored.deletedIds)) {
          stored.deletedIds.forEach((id: string) => deletedProductIds.add(String(id)));
        }
        if (Array.isArray(stored.products) && stored.products.length > 0) {
          const clean = sanitizeClientProducts(stored.products);
          liveProducts = clean.filter((p: any) => !deletedProductIds.has(String(p.id)) && p.isPublished !== false && p.status !== 'Draft');
          notifyListeners();
        }
      }
    }).catch(() => {});
  };

  window.addEventListener("awesome_product_sync", handleProductSyncEvent);
  window.addEventListener("aaramly_product_sync", handleProductSyncEvent);

  // Load from IndexedDB on startup (supports full base64 images of any size)
  idbGet<any>("awesome_admin_sync").then((stored) => {
    if (stored) {
      if (Array.isArray(stored.deletedIds)) {
        stored.deletedIds.forEach((id: string) => deletedProductIds.add(String(id)));
      }
      if (Array.isArray(stored.products) && stored.products.length > 0) {
        const clean = sanitizeClientProducts(stored.products);
        liveProducts = clean.filter((p: any) => !deletedProductIds.has(String(p.id)) && p.isPublished !== false && p.status !== 'Draft');
        notifyListeners();
      }
    }
  }).catch(() => {});
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

  const fallbackMainImg = parentImages[0] || "/images/category/Latkan.webp";

  const mainImg =
    colorMedia?.mainImage ||
    colorObj?.mainImage ||
    colorObj?.displayImage ||
    (typeof v.image === "string" && v.image.trim() ? v.image.trim() : "") ||
    (typeof v.thumbnail === "string" && v.thumbnail.trim() ? v.thumbnail.trim() : "") ||
    fallbackMainImg;

  const colorGalleryUrls = (colorMedia?.gallery && Array.isArray(colorMedia.gallery))
    ? colorMedia.gallery
    : (colorObj?.galleryImages && Array.isArray(colorObj.galleryImages))
    ? colorObj.galleryImages
    : (v.galleryImages && Array.isArray(v.galleryImages))
    ? v.galleryImages
    : [];

  let galleryList: any[] = [];

  if (colorGalleryUrls.length > 0) {
    const allUrls = Array.from(new Set([mainImg, ...colorGalleryUrls].filter(Boolean)));
    galleryList = allUrls.map((url, i) => ({
      id: `img-${v.id || index}-${i}`,
      url,
      alt: `${parentProduct?.name || ''} - ${colorName} View ${i + 1}`,
    }));
  } else if (Array.isArray(v.images) && v.images.length > 0) {
    galleryList = v.images.map((img: any, i: number) =>
      typeof img === "string"
        ? { id: `img-${v.id || index}-${i}`, url: img, alt: `${colorName} ${i + 1}` }
        : { id: img.id || `img-${v.id || index}-${i}`, url: img.url || mainImg, alt: img.alt || `${colorName} ${i + 1}` }
    );
  } else if (parentImages.length > 0) {
    const combined = Array.from(new Set([mainImg, ...parentImages].filter(Boolean)));
    galleryList = combined.map((url, i) => ({
      id: `img-${v.id || index}-${i}`,
      url,
      alt: `${parentProduct?.name || ''} - ${colorName} View ${i + 1}`,
    }));
  } else {
    galleryList = [
      { id: `img-${v.id || index}-0`, url: mainImg, alt: `${colorName} Front View` }
    ];
  }

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
    stock: Number(v.stock) !== undefined ? Number(v.stock) : (Number(parentProduct?.stock) || 50),
    images: galleryList,
  };
};

// Get single product details dynamically
export const getLiveProductById = (idOrSlug?: string): ProductDetails => {
  if (!idOrSlug) {
    const first = liveProducts[0];
    if (first) return getLiveProductById(first.id);
    return SAMPLE_PRODUCT;
  }

  const query = String(idOrSlug).trim().toLowerCase();

  let found = liveProducts.find(
    (p) => String(p.id).toLowerCase() === query || String(p.slug || "").toLowerCase() === query
  );

  if (!found && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("awesome_admin_sync") || localStorage.getItem("aaramly_admin_sync");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.products) && parsed.products.length > 0) {
          liveProducts = parsed.products;
          found = liveProducts.find(
            (p) => String(p.id).toLowerCase() === query || String(p.slug || "").toLowerCase() === query
          );
        }
      }
    } catch (e) {}
  }

  if (!found) {
    if (liveProducts.length > 0) {
      found = liveProducts[0];
    } else {
      return SAMPLE_PRODUCT;
    }
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
          const gallery = col.mainImage
            ? [
                { id: "img-main", url: col.mainImage, alt: `${found.name} - ${col.colorName}` },
                ...(col.galleryImages || []).map((gUrl: string, idx: number) => ({ id: `img-gal-${idx}`, url: gUrl, alt: `${found.name} - ${col.colorName} ${idx + 1}` }))
              ]
            : [];
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
        const cMain = cm.mainImage || parentImages[0] || "/images/category/Latkan.webp";
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
    const mainImg = parentImages[0] || "/images/category/Latkan.webp";
    const gallery = parentImages.length > 0
      ? parentImages.map((url, i) => ({ id: `img-def-${i}`, url, alt: `${found.name} View ${i + 1}` }))
      : [{ id: "img-def-0", url: mainImg, alt: found.name }];

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
          image: parentImages[0] || "/images/category/Latkan.webp"
        },
        {
          id: "card-2",
          title: "Intricate Mirror & Beadwork",
          subtitle: "Precision glass mirrors framed with golden zari thread and fine embellishments",
          image: parentImages[1] || parentImages[0] || "/images/category/Latkan.webp"
        },
        {
          id: "card-3",
          title: "Festive & Bridal Elegance",
          subtitle: "Perfect statement piece for lehengas, dupattas, blouses and designer wear",
          image: parentImages[2] || parentImages[0] || "/images/category/Latkan.webp"
        },
        {
          id: "card-4",
          title: "Durable & Lightweight",
          subtitle: "Long-lasting anti-tarnish finish with secure hanging tie loops",
          image: parentImages[3] || parentImages[0] || "/images/category/Latkan.webp"
        }
      ];
    } else {
      descCards = SAMPLE_PRODUCT.descriptionCards;
    }
  }

  const productHighlights = Array.isArray(found.highlights) && found.highlights.length > 0
    ? found.highlights
    : (Array.isArray(found.keyFeatures) && found.keyFeatures.length > 0
        ? found.keyFeatures
        : SAMPLE_PRODUCT.highlights);

  return {
    ...SAMPLE_PRODUCT,
    id: found.id,
    type: (found.type as any) || (mappedVariations.length > 1 && mappedVariations[0]?.colorName !== 'Standard' ? 'Variable' : 'Simple'),
    brand: found.brand || "Awesome Handmade",
    name: found.name || SAMPLE_PRODUCT.name,
    subtitle: found.subtitle || found.shortDescription || SAMPLE_PRODUCT.subtitle,
    shortDescription: found.shortDescription || found.subtitle || "",
    fullDescription: found.fullDescription || found.description || "",
    price: Number(found.price) || SAMPLE_PRODUCT.price,
    originalPrice: Number(found.originalPrice) || SAMPLE_PRODUCT.originalPrice,
    rating: Number(found.rating) || 4.8,
    reviewCount: Number(found.reviewCount || found.salesCount) || 120,
    defaultSku: found.defaultSku || found.sku || "AWH-SKU-100",
    colors: found.colors || [],
    colorMediaConfigs: found.colorMediaConfigs || [],
    variations: mappedVariations,
    availableSizes: found.availableSizes || (found.sizes ? found.sizes : ["Free Size", "Standard Pair", "Bridal Set"]),
    descriptionCards: descCards,
    highlights: productHighlights,
    specs: found.specs || SAMPLE_PRODUCT.specs,
    galleryImages: parentImages,
    images: parentImages,
    mainImage: parentImages[0] || found.image || "/images/category/Latkan.webp",
    idealForPills: found.idealForPills || (found.category ? [found.category, "Handmade", "Surat Artisan"] : SAMPLE_PRODUCT.idealForPills),
    washingInstructions: found.washingInstructions && found.washingInstructions.length > 0 ? found.washingInstructions : SAMPLE_PRODUCT.washingInstructions,
    manufacturingInfo: {
      ...SAMPLE_PRODUCT.manufacturingInfo,
      ...(found.manufacturingInfo || {}),
      ...(found.brand ? { manufacturer: `${found.brand}` } : {})
    },
  };
};

export const getLiveProductsList = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('awesome_deleted_products') || localStorage.getItem('aaramly_deleted_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) parsed.forEach((id) => deletedProductIds.add(String(id)));
      }
    } catch (e) {}
  }

  const map = new Map<string, any>();
  if (Array.isArray(liveProducts)) {
    liveProducts.forEach((p) => {
      if (p && p.id !== undefined && p.id !== null) {
        if (!deletedProductIds.has(String(p.id))) {
          map.set(String(p.id), p);
        }
      }
    });
  }
  return Array.from(map.values()).filter((p) => !deletedProductIds.has(String(p.id)));
};

// DYNAMIC FILTER STORE
const DEFAULT_FILTER_CONFIG = {
  categories: CATALOG_CATEGORIES.map(c => ({
    name: c.name.toUpperCase(),
    key: c.name,
    count: 12,
  })),
  colors: [
    { name: 'Maroon', hex: '#520618' },
    { name: 'Royal Gold', hex: '#C89B3C' },
    { name: 'Emerald Green', hex: '#1A5235' },
    { name: 'Peacock Blue', hex: '#004F7A' },
    { name: 'Blush Pink', hex: '#E1306C' },
    { name: 'Pure White', hex: '#FFFFFF' },
  ],
  sizes: ['Free Size', 'Standard', '2-3 Y', '4-5 Y', '6-7 Y', '8-9 Y', '10-12 Y', 'XS', 'S', 'M', 'L', 'XL'],
  maxPrice: 3000,
};

let liveFilterData = { ...DEFAULT_FILTER_CONFIG };

export const fetchLiveFilters = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/filters`);
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        liveFilterData = json.data;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('awesome_dynamic_filters', JSON.stringify(json.data));
        }
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
  const liveCats = getLiveCategories().map((c) => ({
    name: c.name.toUpperCase(),
    key: c.name,
    count: c.productCount || 0,
  }));

  try {
    const saved = localStorage.getItem('awesome_dynamic_filters') || localStorage.getItem('aaramly_dynamic_filters');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        categories: liveCats.length > 0 ? liveCats : (Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : DEFAULT_FILTER_CONFIG.categories),
        colors: Array.isArray(parsed.colors) && parsed.colors.length > 0 ? parsed.colors : DEFAULT_FILTER_CONFIG.colors,
        sizes: Array.isArray(parsed.sizes) && parsed.sizes.length > 0 ? parsed.sizes : DEFAULT_FILTER_CONFIG.sizes,
        maxPrice: Number(parsed.maxPrice) || 3000,
      };
    }
  } catch (e) {}
  return {
    ...DEFAULT_FILTER_CONFIG,
    categories: liveCats.length > 0 ? liveCats : DEFAULT_FILTER_CONFIG.categories,
  };
};

const filterListeners = new Set<() => void>();

export const subscribeToFilterStore = (listener: () => void) => {
  filterListeners.add(listener);

  let broadcastChannel: BroadcastChannel | null = null;
  let legacyChannel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('awesome_filter_sync');
    broadcastChannel.onmessage = () => {
      filterListeners.forEach((fn) => fn());
    };
    legacyChannel = new BroadcastChannel('aaramly_filter_sync');
    legacyChannel.onmessage = () => {
      filterListeners.forEach((fn) => fn());
    };
  }

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'awesome_dynamic_filters' || e.key === 'aaramly_dynamic_filters') {
      filterListeners.forEach((fn) => fn());
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange);
  }

  return () => {
    filterListeners.delete(listener);
    if (broadcastChannel) broadcastChannel.close();
    if (legacyChannel) legacyChannel.close();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange);
    }
  };
};

// CATEGORIES STORE & ADMIN SYNC
const categoryListeners = new Set<() => void>();
let liveCategoryData: any[] = [];

export const subscribeToCategoriesStore = (listener: () => void) => {
  categoryListeners.add(listener);

  let broadcastChannel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('awesome_category_sync');
    broadcastChannel.onmessage = () => {
      fetchLiveCategories();
      categoryListeners.forEach((fn) => fn());
    };
  }

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'awesome_categories' || e.key === 'aocind_categories') {
      fetchLiveCategories();
      categoryListeners.forEach((fn) => fn());
    }
  };

  const handleCustomEvent = () => {
    fetchLiveCategories();
    categoryListeners.forEach((fn) => fn());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('awesome_category_sync', handleCustomEvent);
    window.addEventListener('aocind_category_sync', handleCustomEvent);
  }

  return () => {
    categoryListeners.delete(listener);
    if (broadcastChannel) broadcastChannel.close();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('awesome_category_sync', handleCustomEvent);
      window.removeEventListener('aocind_category_sync', handleCustomEvent);
    }
  };
};

export const fetchLiveCategories = async (): Promise<any[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/taxonomies/categories`);
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.categories && Array.isArray(json.data.categories)) {
        const subs = Array.isArray(json.data.subcategories) ? json.data.subcategories : [];
        liveCategoryData = json.data.categories.map((cat: any) => {
          const parentSubs = subs.filter((s: any) => 
            s.categoryId === cat.id || (s.categoryName && cat.name && s.categoryName.toLowerCase() === cat.name.toLowerCase())
          );
          return {
            ...cat,
            subs: parentSubs.length > 0 ? parentSubs.map((s: any) => ({
              name: s.name,
              slug: s.slug || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            })) : (cat.subs || [])
          };
        });
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('awesome_categories', JSON.stringify(liveCategoryData));
        }
        categoryListeners.forEach((fn) => fn());
        return getLiveCategories();
      }
    }
  } catch (e) {
    // console.warn("Express server taxonomy API offline, serving local categories.");
  }
  return getLiveCategories();
};

export const getLiveCategories = () => {
  const liveProds = getLiveProductsList();
  let baseCategories: any[] = [];

  // 1. Strictly prefer memory store from Express API
  if (Array.isArray(liveCategoryData) && liveCategoryData.length > 0) {
    const activeParents = liveCategoryData.filter((c: any) => c.type !== 'sub' && c.isActive !== false);
    baseCategories = activeParents.map((ac: any) => ({
      id: ac.id,
      name: ac.name,
      slug: ac.slug || ac.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image: ac.image || '/images/category/Latkan.webp',
      subs: ac.subs || [],
    }));
  } else if (typeof window !== 'undefined') {
    // 2. Check if Admin has custom/updated categories in storage
    try {
      const saved = localStorage.getItem('awesome_categories') || localStorage.getItem('aocind_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const adminParents = parsed.filter((c: any) => c.type !== 'sub' && c.isActive !== false);
          baseCategories = adminParents.map((ac: any) => ({
            id: ac.id,
            name: ac.name,
            slug: ac.slug || ac.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            image: ac.image || '/images/category/Latkan.webp',
            subs: ac.subs || [],
          }));
        }
      }
    } catch (e) {}
  }

  // 3. Fallback only if no admin categories loaded yet: use CATALOG_CATEGORIES
  if (baseCategories.length === 0 && liveCategoryData.length === 0) {
    baseCategories = CATALOG_CATEGORIES.map((c, i) => ({
      id: c.id || `cat-${i + 1}`,
      name: c.name,
      slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image: c.image || '/images/category/Latkan.webp',
      subs: c.subs || [],
    }));
  }

  // 4. Dynamic product count per category
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
    link: "#categories",
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
    link: "#categories",
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
    link: "#categories",
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
    link: "#categories",
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
    link: "#categories",
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
  // 1. Try IndexedDB first
  if (typeof window !== 'undefined') {
    try {
      const stored = await idbGet<LiveHeroSlide[]>('awesome_hero_slides');
      if (Array.isArray(stored) && stored.length > 0) {
        liveHeroSlides = stored.filter((s: any) => s.status !== 'Inactive');
        heroListeners.forEach((fn) => fn());
      }
    } catch (e) {}
  }

  // 2. Fetch from Express backend API
  try {
    const res = await fetch(`${API_BASE_URL}/content/hero-slides`);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        liveHeroSlides = json.data.filter((s: any) => s.status !== 'Inactive');
        if (typeof window !== 'undefined') {
          await idbSet('awesome_hero_slides', json.data);
          try {
            localStorage.setItem('awesome_hero_slides', JSON.stringify(liveHeroSlides));
          } catch (e) {}
        }
        heroListeners.forEach(fn => fn());
        return liveHeroSlides;
      }
    }
  } catch (e) {}
  return getLiveHeroSlides();
};

export const getLiveHeroSlides = (): LiveHeroSlide[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('awesome_hero_slides') || localStorage.getItem('aocind_hero_slides');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((s: any) => s.status !== 'Inactive');
        }
      }
    } catch (e) {}
  }
  return liveHeroSlides.filter((s) => s.status !== 'Inactive');
};

export const fetchLivePromoBanner = async (): Promise<LivePromoBanner> => {
  // 1. Try IndexedDB first
  if (typeof window !== 'undefined') {
    try {
      const stored = await idbGet<LivePromoBanner>('awesome_promo_banner');
      if (stored && (stored.image || stored.title)) {
        livePromoBanner = { ...DEFAULT_LIVE_PROMO_BANNER, ...stored };
        bannerListeners.forEach((fn) => fn());
      }
    } catch (e) {}
  }

  // 2. Fetch from Express backend API
  try {
    const res = await fetch(`${API_BASE_URL}/content/promo-banner`);
    if (res.ok) {
      const json = await res.json();
      if (json.data && (json.data.image || json.data.title)) {
        livePromoBanner = { ...DEFAULT_LIVE_PROMO_BANNER, ...json.data };
        if (typeof window !== 'undefined') {
          await idbSet('awesome_promo_banner', json.data);
          try {
            localStorage.setItem('awesome_promo_banner', JSON.stringify(livePromoBanner));
          } catch (e) {}
        }
        bannerListeners.forEach(fn => fn());
        return livePromoBanner;
      }
    }
  } catch (e) {}
  return getLivePromoBanner();
};

export const getLivePromoBanner = (): LivePromoBanner => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('awesome_promo_banner') || localStorage.getItem('aocind_promo_banner');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          return { ...DEFAULT_LIVE_PROMO_BANNER, ...parsed };
        }
      }
    } catch (e) {}
  }
  return livePromoBanner;
};

// Global real-time content sync listener
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'awesome_hero_slides' || e.key === 'aocind_hero_slides') {
      try {
        if (e.newValue) {
          liveHeroSlides = JSON.parse(e.newValue);
          heroListeners.forEach(fn => fn());
        }
      } catch (err) {}
    }
    if (e.key === 'awesome_promo_banner' || e.key === 'aocind_promo_banner') {
      try {
        if (e.newValue) {
          livePromoBanner = JSON.parse(e.newValue);
          bannerListeners.forEach(fn => fn());
        }
      } catch (err) {}
    }
  });

  if ('BroadcastChannel' in window) {
    try {
      const contentBc = new BroadcastChannel('awesome_content_sync');
      contentBc.onmessage = (msg) => {
        if (msg.data?.type === 'HERO_UPDATED' && Array.isArray(msg.data.slides)) {
          liveHeroSlides = msg.data.slides.filter((s: any) => s.status !== 'Inactive');
          idbSet('awesome_hero_slides', msg.data.slides);
          try { localStorage.setItem('awesome_hero_slides', JSON.stringify(liveHeroSlides)); } catch (e) {}
          heroListeners.forEach(fn => fn());
        }
        if (msg.data?.type === 'BANNER_UPDATED' && msg.data.banner) {
          livePromoBanner = { ...DEFAULT_LIVE_PROMO_BANNER, ...msg.data.banner };
          idbSet('awesome_promo_banner', msg.data.banner);
          try { localStorage.setItem('awesome_promo_banner', JSON.stringify(livePromoBanner)); } catch (e) {}
          bannerListeners.forEach(fn => fn());
        }
      };
    } catch (e) {}
  }

  // Load from IndexedDB on startup (supports full base64 images of any size)
  idbGet<LiveHeroSlide[]>('awesome_hero_slides').then((stored) => {
    if (Array.isArray(stored) && stored.length > 0) {
      liveHeroSlides = stored.filter((s: any) => s.status !== 'Inactive');
      heroListeners.forEach(fn => fn());
    }
  }).catch(() => {});

  idbGet<LivePromoBanner>('awesome_promo_banner').then((stored) => {
    if (stored && (stored.image || stored.title)) {
      livePromoBanner = { ...DEFAULT_LIVE_PROMO_BANNER, ...stored };
      bannerListeners.forEach(fn => fn());
    }
  }).catch(() => {});
}

// Trigger initial fetch
fetchLiveProducts();
fetchLiveFilters();
fetchLiveCategories();
fetchLiveHeroSlides();
fetchLivePromoBanner();

// Auto refresh categories, products, and content periodically
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    fetchLiveProducts();
    fetchLiveCategories();
    fetchLiveHeroSlides();
    fetchLivePromoBanner();
  });
  setInterval(() => {
    fetchLiveCategories();
    fetchLiveHeroSlides();
    fetchLivePromoBanner();
  }, 4000);
}



