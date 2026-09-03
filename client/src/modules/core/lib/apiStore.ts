import { ProductDetails, ProductColorVariation } from "@/modules/product/types/product";
import { idbGet, idbSet } from "./idbStorage";

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

const DEFAULT_CATALOG_PRODUCTS: any[] = [];

let liveProducts: any[] = [];

if (typeof window !== "undefined") {
  try {
    const local = localStorage.getItem("awesome_admin_sync") || localStorage.getItem("aaramly_admin_sync");
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed.products)) {
        liveProducts = sanitizeClientProducts(parsed.products).filter(
          (p: any) => !deletedProductIds.has(String(p.id)) && p.isPublished !== false && p.status !== "Draft"
        );
      }
    }
  } catch (e) {}
}

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
      if (stored && Array.isArray(stored.products)) {
        const clean = sanitizeClientProducts(stored.products);
        liveProducts = clean.filter(
          (p: any) => !deletedProductIds.has(String(p.id)) && p.isPublished !== false && p.status !== "Draft"
        );
        isLoaded = true;
        notifyListeners();
        return liveProducts;
      }
    } catch (e) {}

    try {
      const local = localStorage.getItem("awesome_admin_sync");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed.products)) {
          const clean = sanitizeClientProducts(parsed.products);
          liveProducts = clean.filter(
            (p: any) => !deletedProductIds.has(String(p.id)) && p.isPublished !== false && p.status !== "Draft"
          );
          isLoaded = true;
          notifyListeners();
          return liveProducts;
        }
      }
    } catch (e) {}
  }

  // 2. Fetch from backend API if available
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (res.ok) {
      const json = await res.json();
      const list = json.data?.items || json.data || json.items || json.products;
      if (Array.isArray(list)) {
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

  // 2. If variant has explicit images, use ONLY those images (do NOT bleed root images)
  let rawUrls: string[] = [];
  if (variantExplicitImages.length > 0) {
    rawUrls = variantExplicitImages;
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

    // 4. Fallback to parent product root images only if variant and color have no images
    if (rawUrls.length === 0) {
      if (Array.isArray(parentImages) && parentImages.length > 0) {
        rawUrls = [...parentImages];
      } else {
        rawUrls = [fallbackMainImg];
      }
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
    mainImage: parentImages[0] || found.image || "/images/category/Latkan.webp",
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
      idbSet('awesome_admin_sync', {
        timestamp: Date.now(),
        products: liveProducts,
        deletedIds: Array.from(deletedProductIds)
      });
      try {
        localStorage.setItem('awesome_admin_sync', JSON.stringify({
          timestamp: Date.now(),
          products: liveProducts,
          deletedIds: Array.from(deletedProductIds)
        }));
      } catch (e) {}

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
    const res = await fetch(url);
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
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('awesome_admin_reviews', JSON.stringify(liveReviews));
            await idbSet('awesome_admin_reviews', liveReviews);
          } catch (e) {}
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
  if (typeof window !== 'undefined') {
    try {
      const deleted = localStorage.getItem('awesome_deleted_reviews') || localStorage.getItem('aaramly_deleted_reviews');
      if (deleted) {
        const parsedDel = JSON.parse(deleted);
        if (Array.isArray(parsedDel)) {
          parsedDel.forEach((id: string) => deletedReviewIds.add(String(id)));
        }
      }

      const stored = localStorage.getItem('awesome_admin_reviews') || localStorage.getItem('aaramly_admin_reviews');
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          liveReviews = parsed.filter((r) => !deletedReviewIds.has(String(r.id)));
        }
      } else {
        liveReviews = [];
      }
    } catch (e) {
      liveReviews = [];
    }
  } else {
    liveReviews = [];
  }

  if (productId) {
    const prodRev = liveReviews.filter((r) => String(r.productId) === String(productId) && !deletedReviewIds.has(String(r.id)));
    return prodRev;
  }
  return liveReviews.filter((r) => !deletedReviewIds.has(String(r.id)));
};

if (typeof window !== 'undefined') {
  const handleLiveReviewSync = () => {
    getLiveReviews();
    notifyReviewListeners();
    notifyListeners();
  };
  window.addEventListener("awesome_review_sync", handleLiveReviewSync);
  window.addEventListener("aaramly_review_sync", handleLiveReviewSync);
}

export const addCustomerReview = async (review: Omit<CustomerReviewItem, 'id' | 'date'> & { id?: string; date?: string }) => {
  const newRev: CustomerReviewItem = {
    id: review.id || `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    productId: String(review.productId),
    productName: review.productName || 'Handcrafted Product',
    productImage: review.productImage || '/images/category/Latkan.webp',
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
  const updated = [newRev, ...existing.filter((r) => r.id !== newRev.id)];
  liveReviews = updated;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('awesome_admin_reviews', JSON.stringify(updated));
      await idbSet('awesome_admin_reviews', updated);
      window.dispatchEvent(new Event('awesome_review_sync'));
      window.dispatchEvent(new Event('aaramly_review_sync'));
    } catch (e) {}
  }

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

  // Call Server API to persist review in MySQL / Server Store
  try {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRev),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend reviews API offline; review preserved in local live store.');
  }

  return newRev;
};

export const deleteCustomerReview = async (reviewId: string) => {
  const existing = getLiveReviews();
  const updated = existing.filter((r) => r.id !== reviewId);
  liveReviews = updated;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('awesome_admin_reviews', JSON.stringify(updated));
      await idbSet('awesome_admin_reviews', updated);
      window.dispatchEvent(new Event('awesome_review_sync'));
      window.dispatchEvent(new Event('aaramly_review_sync'));
    } catch (e) {}
  }

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
  } catch (err) {}
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
  categories: [] as Array<{ name: string; key: string; count: number }>,
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

  // Also include any product categories from live products not present in list
  const catNamesSet = new Set(liveCats.map((c) => c.name.toLowerCase()));
  currentLiveProds.forEach((p) => {
    if (p.category && !catNamesSet.has(p.category.toLowerCase())) {
      const cCount = currentLiveProds.filter((x) => matchCat(x, p.category)).length;
      if (cCount > 0) {
        liveCats.push({
          name: p.category,
          key: p.category,
          count: cCount,
        });
        catNamesSet.add(p.category.toLowerCase());
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

  return {
    categories: liveCats,
    colors: dynamicColors.length > 0 ? dynamicColors : DEFAULT_FILTER_CONFIG.colors,
    sizes: dynamicSizes.length > 0 ? dynamicSizes : DEFAULT_FILTER_CONFIG.sizes,
    attributes: dynamicAttributes,
    maxPrice: dynamicMaxPrice,
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
      if (json?.data && Array.isArray(json.data.categories)) {
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
          const adminSubs = parsed.filter((c: any) => c.type === 'sub' && c.isActive !== false);
          baseCategories = adminParents.map((ac: any) => {
            const mySubs = adminSubs.filter((s: any) => s.parentId === ac.id || s.parentName === ac.name || s.categoryName === ac.name);
            return {
              id: ac.id,
              name: ac.name,
              slug: ac.slug || ac.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              image: ac.image || '/images/category/Latkan.webp',
              subs: mySubs.length > 0 ? mySubs.map((s: any) => ({
                name: s.name,
                slug: s.slug || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
              })) : (ac.subs || []),
            };
          });
        }
      }
    } catch (e) {}
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

// Trigger initial fetch once
fetchLiveProducts();
fetchLiveFilters();
fetchLiveCategories();
fetchLiveHeroSlides();
fetchLivePromoBanner();

// Event-driven real-time refresh on window focus
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    fetchLiveProducts();
    fetchLiveCategories();
    fetchLiveHeroSlides();
    fetchLivePromoBanner();
  });
}



