import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";
import {
  LayoutGrid,
  List as ListIcon,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Eye,
} from "lucide-react";
import Navbar from "@/modules/core/components/Navbar";
import Footer from "@/modules/core/components/Footer";
import { PaginationDots } from "@/modules/core/components/PaginationDots";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/components/ui/select";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useQuickView } from "../context/QuickViewContext";
import ProductHoverSlider from "../components/ProductHoverSlider";
import { ClientShopProduct } from "../types/product";
import {
  fetchLiveProducts,
  subscribeToProductStore,
  getLiveProductsList,
  getLiveFilters,
  subscribeToFilterStore,
  getLiveCategories,
  subscribeToCategoriesStore,
  fetchLiveFilters,
  fetchLiveCategories,
} from "@/modules/core/lib/apiStore";

// Helper to extract clean pure color name without size suffixes (e.g. "Green / S" -> "Green", "Black / XL" -> "Black")
const extractPureColor = (raw?: string): string => {
  if (!raw) return "";
  let clean = raw.trim();
  if (clean.includes("/")) {
    clean = clean.split("/")[0].trim();
  }
  clean = clean.replace(/\s*\([^)]*\)\s*/g, "").trim();
  clean = clean.replace(/\s*-\s*(Free\s*Size|[SML]|XL|XXL|2XL|3XL)\b/gi, "").trim();
  return clean;
};

// Comprehensive category matching helper
const matchProductCategory = (prod: any, targetCategory: string): boolean => {
  if (!targetCategory || targetCategory.toLowerCase() === "all") return true;
  if (!prod) return false;

  const clean = (s?: string) => (s || "").toLowerCase().replace(/[-_\s]+/g, "");
  const target = clean(targetCategory);
  if (!target) return true;
  const targetStem = target.endsWith("s") && target.length > 3 ? target.slice(0, -1) : target;

  const cat = clean(prod.category);
  const subcat = clean(prod.subcategory || prod.subCategory);
  const name = clean(prod.name);
  const categoriesList = Array.isArray(prod.categories) ? prod.categories.map(clean) : [];

  // 1. Direct or stem equality
  if (cat === target || cat === targetStem || subcat === target || subcat === targetStem) return true;
  if (categoriesList.includes(target) || categoriesList.includes(targetStem)) return true;

  // 2. Substring matching
  if (cat.includes(targetStem) || subcat.includes(targetStem) || target.includes(cat) || targetStem.includes(cat)) return true;

  // 3. Match in product categories array
  if (categoriesList.some((c: string) => c && (c.includes(targetStem) || targetStem.includes(c)))) return true;

  // 4. Domain-specific semantic mappings
  if (targetStem.includes("latkan") || targetStem.includes("tassel")) {
    return cat.includes("latkan") || cat.includes("tassel") || subcat.includes("latkan") || subcat.includes("tassel");
  }
  if (targetStem.includes("choli") || targetStem.includes("navratri")) {
    return cat.includes("choli") || subcat.includes("choli");
  }
  if (targetStem.includes("earring") || targetStem.includes("jhumka")) {
    return cat.includes("earring") || cat.includes("jhumka") || subcat.includes("earring");
  }
  if (targetStem.includes("necklace") || targetStem.includes("haar") || targetStem.includes("mala")) {
    return cat.includes("necklace") || subcat.includes("necklace");
  }
  if (targetStem.includes("gift") || targetStem.includes("hamper") || targetStem.includes("keychain")) {
    return cat.includes("gift") || cat.includes("hamper") || cat.includes("keychain") || subcat.includes("gift") || subcat.includes("hamper") || subcat.includes("keychain");
  }
  if (targetStem.includes("hair") || targetStem.includes("bow") || targetStem.includes("clip") || targetStem.includes("band")) {
    return cat.includes("hair") || subcat.includes("hair") || cat.includes("bow") || cat.includes("clip");
  }
  if (targetStem.includes("krishna") || targetStem.includes("poshak") || targetStem.includes("outfit")) {
    return cat.includes("krishna") || subcat.includes("krishna");
  }
  if (targetStem.includes("belt") || targetStem.includes("kandora") || targetStem.includes("kamarbandh")) {
    return cat.includes("belt") || cat.includes("kandora") || cat.includes("kamarbandh");
  }
  if (targetStem.includes("anklet") || targetStem.includes("payal")) {
    return cat.includes("anklet") || subcat.includes("anklet") || cat.includes("payal") || subcat.includes("payal");
  }
  if (targetStem.includes("watch")) {
    return cat.includes("watch") || subcat.includes("watch");
  }
  if (targetStem.includes("bracelet")) {
    return cat.includes("bracelet") || subcat.includes("bracelet");
  }

  // 5. Fallback check product name if cat is missing or generic
  if (!cat && (name.includes(targetStem) || targetStem.includes(name))) return true;

  return false;
};

// Color Hex mapping for display badges
const COLOR_HEX_MAP: Record<string, string> = {
  maroon: '#800000',
  red: '#DC2626',
  crimson: '#991B1B',
  gold: '#D4AF37',
  golden: '#D4AF37',
  yellow: '#EAB308',
  mustard: '#CA8A04',
  blue: '#2563EB',
  royal: '#1D4ED8',
  navy: '#1E3A8A',
  green: '#16A34A',
  emerald: '#059669',
  bottle: '#064E3B',
  pink: '#EC4899',
  rani: '#BE185D',
  magenta: '#D946EF',
  orange: '#F97316',
  peach: '#FDBA74',
  purple: '#9333EA',
  violet: '#7E22CE',
  black: '#171717',
  white: '#FAFAFA',
  cream: '#FEF3C7',
  beige: '#F5F5DC',
  silver: '#E5E7EB',
  teal: '#0D9488',
  copper: '#B45309'
};

const getColorHex = (name?: string): string => {
  if (!name) return '#232323';
  const lower = name.toLowerCase().trim();
  for (const [k, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (lower.includes(k)) return hex;
  }
  return '#232323';
};

export interface ShopDisplayItem {
  id: string;
  productId: string;
  name: string;
  baseTitle: string;
  variantColor?: string;
  variantColorHex?: string;
  variantSize?: string;
  price: number;
  originalPrice: number;
  image: string;
  images: string[];
  galleryImages?: string[];
  hoverImage?: string;
  stock: number;
  rating: number;
  salesCount?: number;
  reviewCount?: number;
  sku: string;
  slug: string;
  category: string;
  categories?: string[];
  subcategory?: string;
  labels?: any;
  attributes?: any[];
  customAttributes?: any[];
  specifications?: any[];
  productOptions?: any[];
  shortDescription?: string;
  fullDescription?: string;
  createdAt?: string;
  linkUrl: string;
  parentProduct: ClientShopProduct;
  isVariantCard: boolean;
}

const explodeProductToShopItems = (p: ClientShopProduct): ShopDisplayItem[] => {
  const prodAny = p as any;
  const pId = String(p.id);
  const baseTitle = p.name || "Handcrafted Product";
  const pSlug = p.slug || pId;
  const pCategory = p.category || "Latkan";
  const pSubcategory = p.subcategory || prodAny.subCategory || "";
  const pRating = Number(
    p.rating !== undefined && p.rating !== null
      ? p.rating
      : (prodAny.parentProduct?.rating !== undefined && prodAny.parentProduct.rating !== null ? prodAny.parentProduct.rating : 0)
  );
  const pReviewCount = Number(
    prodAny.reviewCount !== undefined && prodAny.reviewCount !== null
      ? prodAny.reviewCount
      : (p.reviewCount !== undefined && p.reviewCount !== null
          ? p.reviewCount
          : (prodAny.parentProduct?.reviewCount !== undefined && prodAny.parentProduct.reviewCount !== null ? prodAny.parentProduct.reviewCount : 0))
  );
  const pSales = Number(p.salesCount !== undefined && p.salesCount !== null ? p.salesCount : pReviewCount);

  const extractUrl = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val.trim();
    if (typeof val === "object") {
      return (val.url || val.src || val.image || val.mainImage || "").trim();
    }
    return "";
  };

  const variantDetails: any[] = Array.isArray(prodAny.variantDetails) ? prodAny.variantDetails : [];
  const variations: any[] = Array.isArray(prodAny.variations) ? prodAny.variations : [];
  const colors: any[] = Array.isArray(prodAny.colors) ? prodAny.colors : [];
  const colorMediaConfigs: any[] = Array.isArray(prodAny.colorMediaConfigs) ? prodAny.colorMediaConfigs : [];

  const isVariableProduct =
    prodAny.productType === "variant" ||
    prodAny.type === "Variable" ||
    variantDetails.length > 0 ||
    variations.length > 1 ||
    colors.length > 1 ||
    colorMediaConfigs.length > 1;

  const getDynamicVariantShortDesc = (baseShort?: string, colorName?: string) => {
    const cleanColor = (colorName || "").trim();
    const cleanShort = (baseShort || "").trim();
    if (!cleanShort) {
      return cleanColor ? `Exquisitely handcrafted in an opulent ${cleanColor} tone, blending traditional artistry with premium finishes.` : "";
    }
    if (cleanColor && !cleanShort.toLowerCase().includes(cleanColor.toLowerCase())) {
      return `Featured in an elegant ${cleanColor} palette. ${cleanShort}`;
    }
    return cleanShort;
  };

  if (isVariableProduct) {
    const variantCardsMap = new Map<string, ShopDisplayItem>();

    // 1. Process from variantDetails
    if (variantDetails.length > 0) {
      variantDetails.forEach((vd: any) => {
        if (!vd) return;
        const rawColor = vd.colorName || vd.color || vd.name || vd.optionValue || "Standard";
        const pureColor = rawColor.split("/")[0].trim() || rawColor;
        const colorKey = pureColor.toLowerCase();

        if (!variantCardsMap.has(colorKey)) {
          const vdMain = extractUrl(vd.mainImage) || extractUrl(vd.image) || (Array.isArray(vd.images) ? extractUrl(vd.images[0]) : "") || extractUrl(vd.thumbnail) || extractUrl(p.image) || "/images/category/Latkan.webp";
          const vdGallery: string[] = [vdMain];
          if (Array.isArray(vd.galleryImages)) vd.galleryImages.forEach((g: any) => { const u = extractUrl(g); if (u && !vdGallery.includes(u)) vdGallery.push(u); });
          if (Array.isArray(vd.images)) vd.images.forEach((g: any) => { const u = extractUrl(g); if (u && !vdGallery.includes(u)) vdGallery.push(u); });

          const vdPrice = Number(vd.price) || Number(p.price) || 799;
          const vdOrigPrice = Number(vd.originalPrice) || Number(p.originalPrice) || Math.round(vdPrice * 1.5);
          const vdStock = (vd.quantity !== undefined && vd.quantity !== null && !isNaN(Number(vd.quantity)))
            ? Number(vd.quantity)
            : ((vd.stock !== undefined && vd.stock !== null && !isNaN(Number(vd.stock)))
              ? Number(vd.stock)
              : (Number(p.stock) || 25));

          variantCardsMap.set(colorKey, {
            id: `${pId}-${pureColor.replace(/\s+/g, "-")}`,
            productId: pId,
            name: `${baseTitle} - ${pureColor}`,
            baseTitle,
            variantColor: pureColor,
            variantColorHex: vd.colorHex || getColorHex(pureColor),
            variantSize: vd.size || vd.sizeName || "Free Size",
            price: vdPrice,
            originalPrice: vdOrigPrice,
            image: vdMain,
            images: vdGallery,
            galleryImages: vdGallery,
            hoverImage: vdGallery[1] || vdMain,
            stock: vdStock,
            rating: pRating,
            reviewCount: pReviewCount,
            salesCount: pSales,
            sku: vd.sku || `${p.sku || "AOC"}-${pureColor}`,
            slug: pSlug,
            category: pCategory,
            categories: p.categories,
            subcategory: pSubcategory,
            labels: p.labels,
            attributes: p.attributes,
            customAttributes: prodAny.customAttributes,
            specifications: prodAny.specifications,
            productOptions: prodAny.productOptions,
            shortDescription: getDynamicVariantShortDesc(p.shortDescription, pureColor),
            fullDescription: p.fullDescription,
            createdAt: prodAny.createdAt,
            linkUrl: `/product/${pSlug}?color=${encodeURIComponent(pureColor)}`,
            parentProduct: p,
            isVariantCard: true,
          });
        }
      });
    }

    // 2. Process from variations
    if (variations.length > 0) {
      variations.forEach((v: any) => {
        if (!v) return;
        const rawColor = v.colorName || (v as any).color || "Standard";
        const pureColor = rawColor.split("/")[0].trim() || rawColor;
        const colorKey = pureColor.toLowerCase();

        if (!variantCardsMap.has(colorKey)) {
          const vMain = extractUrl(v.thumbnail) || extractUrl(v.mainImage) || extractUrl(v.image) || (Array.isArray(v.images) ? extractUrl(v.images[0]) : "") || extractUrl(p.image) || "/images/category/Latkan.webp";
          const vGallery: string[] = [vMain];
          if (Array.isArray(v.images)) v.images.forEach((g: any) => { const u = extractUrl(g); if (u && !vGallery.includes(u)) vGallery.push(u); });

          const vPrice = Number(v.price) || Number(p.price) || 799;
          const vOrigPrice = Number(v.originalPrice) || Number(p.originalPrice) || Math.round(vPrice * 1.5);
          const vStock = (v.stock !== undefined && v.stock !== null && !isNaN(Number(v.stock)))
            ? Number(v.stock)
            : ((v.quantity !== undefined && v.quantity !== null && !isNaN(Number(v.quantity)))
              ? Number(v.quantity)
              : (Number(p.stock) || 25));

          variantCardsMap.set(colorKey, {
            id: `${pId}-${pureColor.replace(/\s+/g, "-")}`,
            productId: pId,
            name: `${baseTitle} - ${pureColor}`,
            baseTitle,
            variantColor: pureColor,
            variantColorHex: v.colorHex || getColorHex(pureColor),
            variantSize: v.size || v.sizeName || "Free Size",
            price: vPrice,
            originalPrice: vOrigPrice,
            image: vMain,
            images: vGallery,
            galleryImages: vGallery,
            hoverImage: vGallery[1] || vMain,
            stock: vStock,
            rating: pRating,
            reviewCount: pReviewCount,
            salesCount: pSales,
            sku: v.sku || `${p.sku || "AOC"}-${pureColor}`,
            slug: pSlug,
            category: pCategory,
            categories: p.categories,
            subcategory: pSubcategory,
            labels: p.labels,
            attributes: p.attributes,
            customAttributes: prodAny.customAttributes,
            specifications: prodAny.specifications,
            productOptions: prodAny.productOptions,
            shortDescription: getDynamicVariantShortDesc(p.shortDescription, pureColor),
            fullDescription: p.fullDescription,
            createdAt: prodAny.createdAt,
            linkUrl: `/product/${pSlug}?color=${encodeURIComponent(pureColor)}`,
            parentProduct: p,
            isVariantCard: true,
          });
        }
      });
    }

    // 3. Process from colors
    if (colors.length > 0) {
      colors.forEach((c: any) => {
        if (!c) return;
        const rawColor = typeof c === "string" ? c : (c.colorName || c.name || c.color || "Standard");
        const pureColor = rawColor.split("/")[0].trim() || rawColor;
        const colorKey = pureColor.toLowerCase();

        if (!variantCardsMap.has(colorKey)) {
          const cMain = extractUrl(c.displayImage) || extractUrl(c.mainImage) || extractUrl(c.image) || (Array.isArray(c.galleryImages) ? extractUrl(c.galleryImages[0]) : "") || extractUrl(p.image) || "/images/category/Latkan.webp";
          const cGallery: string[] = [cMain];
          if (Array.isArray(c.galleryImages)) c.galleryImages.forEach((g: any) => { const u = extractUrl(g); if (u && !cGallery.includes(u)) cGallery.push(u); });

          variantCardsMap.set(colorKey, {
            id: `${pId}-${pureColor.replace(/\s+/g, "-")}`,
            productId: pId,
            name: `${baseTitle} - ${pureColor}`,
            baseTitle,
            variantColor: pureColor,
            variantColorHex: c.colorHex || getColorHex(pureColor),
            variantSize: (c.sizes && c.sizes[0]) || "Free Size",
            price: Number(p.price) || 799,
            originalPrice: Number(p.originalPrice) || Math.round(Number(p.price) * 1.5),
            image: cMain,
            images: cGallery,
            galleryImages: cGallery,
            hoverImage: cGallery[1] || cMain,
            stock: Number(p.stock) || 25,
            rating: pRating,
            reviewCount: pReviewCount,
            salesCount: pSales,
            sku: `${p.sku || "AOC"}-${pureColor}`,
            slug: pSlug,
            category: pCategory,
            categories: p.categories,
            subcategory: pSubcategory,
            labels: p.labels,
            attributes: p.attributes,
            customAttributes: prodAny.customAttributes,
            specifications: prodAny.specifications,
            productOptions: prodAny.productOptions,
            shortDescription: getDynamicVariantShortDesc(p.shortDescription, pureColor),
            fullDescription: p.fullDescription,
            createdAt: prodAny.createdAt,
            linkUrl: `/product/${pSlug}?color=${encodeURIComponent(pureColor)}`,
            parentProduct: p,
            isVariantCard: true,
          });
        }
      });
    }

    if (variantCardsMap.size > 0) {
      return Array.from(variantCardsMap.values());
    }
  }

  // Fallback: Simple Product (single card)
  const defaultImg = extractUrl(p.image) || extractUrl(prodAny.mainImage) || (Array.isArray(p.images) ? extractUrl(p.images[0]) : "") || "/images/category/Latkan.webp";
  const defaultGals: string[] = [defaultImg];
  if (Array.isArray(p.images)) p.images.forEach((g: any) => { const u = extractUrl(g); if (u && !defaultGals.includes(u)) defaultGals.push(u); });
  if (Array.isArray(prodAny.galleryImages)) prodAny.galleryImages.forEach((g: any) => { const u = extractUrl(g); if (u && !defaultGals.includes(u)) defaultGals.push(u); });

  return [
    {
      id: pId,
      productId: pId,
      name: baseTitle,
      baseTitle,
      variantColor: prodAny.colorName || "Standard",
      variantColorHex: "#232323",
      variantSize: "Free Size",
      price: Number(p.price) || 799,
      originalPrice: Number(p.originalPrice) || Math.round(Number(p.price) * 1.5),
      image: defaultImg,
      images: defaultGals,
      galleryImages: defaultGals,
      hoverImage: defaultGals[1] || defaultImg,
      stock: (p.stock !== undefined && p.stock !== null && !isNaN(Number(p.stock))) ? Number(p.stock) : 25,
      rating: pRating,
      reviewCount: pReviewCount,
      salesCount: pSales,
      sku: p.sku || `AOC-${pId}`,
      slug: pSlug,
      category: pCategory,
      categories: p.categories,
      subcategory: pSubcategory,
      labels: p.labels,
      attributes: p.attributes,
      customAttributes: prodAny.customAttributes,
      specifications: prodAny.specifications,
      productOptions: prodAny.productOptions,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      createdAt: prodAny.createdAt,
      linkUrl: `/product/${pSlug}`,
      parentProduct: p,
      isVariantCard: false,
    }
  ];
};

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { wishlistIds, toggleWishlist, isWishlisted } = useWishlist();
  const { openQuickView, isMobileOrTablet } = useQuickView();

  // Dynamic Categories & Filters State
  const [filterConfig, setFilterConfig] = useState(() => getLiveFilters());
  const [liveCategoriesList, setLiveCategoriesList] = useState(() => getLiveCategories());

  useEffect(() => {
    fetchLiveFilters();
    fetchLiveCategories();
    const unsubscribeFilters = subscribeToFilterStore(() => {
      const cfg = getLiveFilters();
      setFilterConfig(cfg);
      if (cfg?.maxPrice) setMaxPrice(cfg.maxPrice);
    });
    const unsubscribeCats = subscribeToCategoriesStore(() => {
      setLiveCategoriesList(getLiveCategories());
    });
    return () => {
      unsubscribeFilters();
      unsubscribeCats();
    };
  }, []);

  // Products State
  const [products, setProducts] = useState<ClientShopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Explode products into variant display items for Shop Page
  const allShopItems = useMemo(() => {
    return products.flatMap(explodeProductToShopItems);
  }, [products]);

  // Top header categories derived dynamically from Admin with live item counts
  const dynamicShopCategories = useMemo(() => {
    return liveCategoriesList
      .filter((c: any) => c && c.name && c.isActive !== false)
      .map((c) => {
        const realCount = allShopItems.filter((item) => matchProductCategory(item.parentProduct, c.name)).length;
        return {
          id: c.name,
          name: c.name,
          count: `${realCount} items`,
          img: c.image || "/images/category/Latkan.webp",
        };
      });
  }, [liveCategoriesList, allShopItems]);

  const handleProductClick = (e: React.MouseEvent, productId: string | number) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      e.preventDefault();
      openQuickView(productId);
    }
  };

  // Layout View Mode (grid vs list)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter States
  const initialCategory = categorySlug || searchParams.get("category") || null;
  const initialSubCategory = searchParams.get("sub") || null;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(initialSubCategory);
  const [minPrice, setMinPrice] = useState<number>(399);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [attrName: string]: string[] }>({});
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const PRICE_MIN = 399;
  const PRICE_MAX = 2000;

  // Sort & Pagination
  const [sort, setSort] = useState("default");
  const [showPerPage, setShowPerPage] = useState<number>(12);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Accordion Sections Toggle
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    categories: true,
    price: true,
    color: true,
    size: true,
    rating: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Top Categories Horizontal Scroll & Dynamic Dots State (Adapts to Mobile, Tablet, Laptop, Desktop)
  const catScrollRef = useRef<HTMLDivElement>(null);
  const [activeCatDot, setActiveCatDot] = useState<number>(0);
  const [totalCatDots, setTotalCatDots] = useState<number>(3);
  const isDraggingCat = useRef<boolean>(false);
  const startCatX = useRef<number>(0);
  const scrollLeftStartCat = useRef<number>(0);
  const hasMovedCat = useRef<boolean>(false);

  const updateDotCount = () => {
    if (!catScrollRef.current) return;
    const { scrollWidth, clientWidth } = catScrollRef.current;
    if (clientWidth <= 0) return;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 10) {
      setTotalCatDots(0);
      return;
    }
    const pages = Math.ceil(scrollWidth / clientWidth);
    setTotalCatDots(Math.max(2, pages));
  };

  useEffect(() => {
    updateDotCount();
    window.addEventListener("resize", updateDotCount);
    return () => window.removeEventListener("resize", updateDotCount);
  }, []);

  const handleCatScroll = () => {
    if (!catScrollRef.current || totalCatDots <= 1) return;
    const { scrollLeft, scrollWidth, clientWidth } = catScrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 5) {
      setActiveCatDot(0);
      return;
    }
    const maxDotIndex = Math.max(1, totalCatDots - 1);
    const progress = Math.max(0, Math.min(1, scrollLeft / maxScroll));
    const dot = Math.min(maxDotIndex, Math.max(0, Math.round(progress * maxDotIndex)));
    setActiveCatDot(dot);
  };

  const scrollToCatDot = (dotIdx: number) => {
    if (!catScrollRef.current || totalCatDots <= 1) return;
    const { scrollWidth, clientWidth } = catScrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const maxDotIndex = Math.max(1, totalCatDots - 1);
    const target = maxScroll * (dotIdx / maxDotIndex);
    catScrollRef.current.scrollTo({ left: target, behavior: "smooth" });
    setActiveCatDot(dotIdx);
  };

  const handleCatMouseDown = (e: React.MouseEvent) => {
    if (!catScrollRef.current) return;
    isDraggingCat.current = true;
    hasMovedCat.current = false;
    startCatX.current = e.pageX - catScrollRef.current.offsetLeft;
    scrollLeftStartCat.current = catScrollRef.current.scrollLeft;
  };

  const handleCatMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCat.current || !catScrollRef.current) return;
    const x = e.pageX - catScrollRef.current.offsetLeft;
    const walk = (x - startCatX.current);
    if (Math.abs(walk) > 4) {
      hasMovedCat.current = true;
      e.preventDefault();
      catScrollRef.current.scrollLeft = scrollLeftStartCat.current - walk;
    }
  };

  const handleCatMouseUp = () => {
    isDraggingCat.current = false;
  };

  useEffect(() => {
    const catFromUrl = categorySlug || searchParams.get("category");
    const subFromUrl = searchParams.get("sub");
    setSelectedCategory(catFromUrl || null);
    setSelectedSubCategory(subFromUrl || null);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [searchParams, categorySlug]);

  // Load Live & Published Products
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        await fetchLiveProducts();
        const stored = getLiveProductsList();
        const published = stored.filter(
          (p: any) => p.isPublished !== false && p.status !== "Draft"
        );
        setProducts(published);
      } catch {
        const stored = getLiveProductsList();
        const published = stored.filter(
          (p: any) => p.isPublished !== false && p.status !== "Draft"
        );
        setProducts(published);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();

    const unsubscribe = subscribeToProductStore(() => {
      const liveList = getLiveProductsList();
      const published = (liveList || []).filter(
        (p: any) => p.isPublished !== false && p.status !== "Draft"
      );
      setProducts(published);
      const cfg = getLiveFilters();
      setFilterConfig(cfg);
    });

    return () => unsubscribe();
  }, []);

  // Filter Checks
  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
    setCurrentPage(1);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setCurrentPage(1);
  };

  const toggleAttributeValue = (attrName: string, val: string) => {
    setSelectedAttributes((prev) => {
      const current = prev[attrName] || [];
      const updated = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val];
      return { ...prev, [attrName]: updated };
    });
    setCurrentPage(1);
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setMinPrice(399);
    setMaxPrice(2000);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedAttributes({});
    setSelectedRatings([]);
    setSearchQuery("");
    setSort("default");
    setCurrentPage(1);
    setSearchParams({});
  };

  // Filtered & Sorted Display Items (including all variant cards)
  const filteredProducts = useMemo(() => {
    let list = [...allShopItems];

    // Category Filter
    if (selectedCategory && selectedCategory.toLowerCase() !== "all") {
      if (selectedCategory === "newArrival") {
        list = list.filter((item) => item.labels?.newArrival || item.parentProduct?.labels?.newArrival);
      } else if (selectedCategory === "bestSeller") {
        list = list.filter((item) => item.labels?.bestSeller || item.parentProduct?.labels?.bestSeller);
      } else if (selectedCategory === "sale") {
        list = list.filter((item) => item.labels?.sale || item.parentProduct?.labels?.sale);
      } else {
        list = list.filter((item) => matchProductCategory(item.parentProduct, selectedCategory));
      }
    }

    // Subcategory Filter
    if (selectedSubCategory) {
      const cleanSub = (s?: string) => (s || "").toLowerCase().replace(/[-_\s]+/g, "");
      const targetSub = cleanSub(selectedSubCategory);
      list = list.filter((item: any) => {
        const pSub = cleanSub(item.subcategory || item.parentProduct?.subcategory || item.parentProduct?.subCategory);
        const pName = cleanSub(item.name);
        return pSub.includes(targetSub) || targetSub.includes(pSub) || pName.includes(targetSub);
      });
    }

    // Dual Slider Price Filter (₹399 to ₹2,000+)
    list = list.filter((item) => {
      if (maxPrice >= 2000) {
        return item.price >= minPrice;
      }
      return item.price >= minPrice && item.price <= maxPrice;
    });    // Color Filter (Strict card-level matching)
    if (selectedColors.length > 0) {
      list = list.filter((item: any) =>
        selectedColors.some((c) => {
          const cleanC = c.toLowerCase().trim();
          const itemColor = (item.variantColor || "").toLowerCase().trim();

          if (itemColor && (itemColor === cleanC || itemColor.includes(cleanC) || cleanC.includes(itemColor))) {
            return true;
          }

          if (!item.isVariantCard) {
            const p = item.parentProduct || {};
            const hasColorObj = (p.colors || []).some((col: any) => {
              const colRaw = (typeof col === "string" ? col : col.colorName || col.name || col.color || "").toLowerCase().trim();
              const colParts = colRaw.split("/").map((s: string) => s.trim());
              return colParts[0] === cleanC || colParts.includes(cleanC) || colRaw === cleanC;
            });
            const hasAttrColor = (p.attributes || p.productOptions || []).some(
              (a: any) =>
                (a.name || "").toLowerCase().includes("color") &&
                (a.values || []).some((v: string) => v.toLowerCase().trim() === cleanC)
            );
            return hasColorObj || hasAttrColor;
          }

          return false;
        })
      );
    }

    // Size Filter (Card-level matching + product level available sizes)
    if (selectedSizes.length > 0) {
      list = list.filter((item: any) =>
        selectedSizes.some((s) => {
          const cleanS = s.toLowerCase().trim();
          const itemSize = (item.variantSize || "").toLowerCase().trim();

          if (itemSize && (itemSize === cleanS || itemSize.includes(cleanS) || cleanS.includes(itemSize))) {
            return true;
          }

          const p = item.parentProduct || {};
          const hasAvailSize = (p.availableSizes || p.sizes || []).some(
            (sz: string) => {
              const cleanSz = (sz || "").toLowerCase().trim();
              return cleanSz === cleanS || cleanSz.includes(cleanS) || cleanS.includes(cleanSz);
            }
          );
          const hasVarSize = (p.variations || p.variants || []).some((v: any) => {
            const sVal = (v.size || v.sizeName || "").toLowerCase().trim();
            const parts = (v.colorName || "").toLowerCase().split("/").map((x: string) => x.trim());
            return sVal === cleanS || (parts.length > 1 && parts[1] === cleanS);
          });
          const hasAttrSize = (p.attributes || p.productOptions || []).some(
            (a: any) =>
              (a.name || "").toLowerCase().includes("size") &&
              (a.values || []).some((v: string) => v.toLowerCase().trim() === cleanS)
          );
          return hasAvailSize || hasVarSize || hasAttrSize;
        })
      );
    }

    // Custom Attributes Filter (Material, Craft Technique, Occasion, etc.)
    Object.entries(selectedAttributes).forEach(([attrName, selectedVals]) => {
      if (selectedVals.length > 0) {
        const cleanAttrName = attrName.toLowerCase();
        list = list.filter((item: any) => {
          const p = item.parentProduct || {};
          const pAttrs = p.attributes || [];
          const pCustomAttrs = p.customAttributes || [];
          const pSpecs = p.specifications || [];
          const pOpts = p.productOptions || [];

          return selectedVals.some((val) => {
            const cleanVal = val.toLowerCase();
            const inAttrs = pAttrs.some((a: any) =>
              (a.name || "").toLowerCase().includes(cleanAttrName) &&
              (a.values || []).some((v: string) => v.toLowerCase().includes(cleanVal))
            );
            const inCustom = pCustomAttrs.some((a: any) =>
              (a.name || "").toLowerCase().includes(cleanAttrName) &&
              (a.values || []).some((v: string) => v.toLowerCase().includes(cleanVal))
            );
            const inSpecs = pSpecs.some((s: any) =>
              (s.key || "").toLowerCase().includes(cleanAttrName) &&
              (s.value || "").toLowerCase().includes(cleanVal)
            );
            const inOpts = pOpts.some((o: any) =>
              (o.name || "").toLowerCase().includes(cleanAttrName) &&
              (o.values || []).some((v: string) => v.toLowerCase().includes(cleanVal))
            );
            const inDesc = (item.shortDescription || item.fullDescription || item.name || "").toLowerCase().includes(cleanVal);

            return inAttrs || inCustom || inSpecs || inOpts || inDesc;
          });
        });
      }
    });

    // Rating Filter
    if (selectedRatings.length > 0) {
      list = list.filter((item) => {
        const r = Number(item.rating !== undefined && item.rating !== null ? item.rating : 0);
        if (r <= 0) return false;
        const starLevel = r >= 4.5 ? 5 : r >= 3.5 ? 4 : r >= 2.5 ? 3 : r >= 1.5 ? 2 : 1;
        return selectedRatings.includes(starLevel);
      });
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.baseTitle.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.variantColor?.toLowerCase().includes(q) ||
          item.parentProduct?.brand?.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sort === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === "newest") {
      list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }

    return list;
  }, [
    allShopItems,
    selectedCategory,
    selectedSubCategory,
    minPrice,
    maxPrice,
    selectedColors,
    selectedSizes,
    selectedAttributes,
    selectedRatings,
    searchQuery,
    sort,
  ]);

  const totalResults = filteredProducts.length;
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * showPerPage,
    currentPage * showPerPage
  );
  const totalPages = Math.ceil(totalResults / showPerPage);

  // Live Category Real Counts
  const categoryRealCounts = useMemo(() => {
    const map: { [catKey: string]: number } = {};
    (filterConfig?.categories || []).forEach((cat: any) => {
      const catKey = cat.key || cat.id || cat.name;
      map[catKey] = allShopItems.filter((item) => matchProductCategory(item.parentProduct, catKey)).length;
    });
    return map;
  }, [filterConfig?.categories, allShopItems]);

  // Products scoped to current category for dynamic category-relevant filters
  const categoryScopedItems = useMemo(() => {
    if (!selectedCategory || selectedCategory.toLowerCase() === "all") {
      return allShopItems;
    }
    if (selectedCategory === "newArrival") {
      return allShopItems.filter((item) => item.labels?.newArrival || item.parentProduct?.labels?.newArrival);
    }
    if (selectedCategory === "bestSeller") {
      return allShopItems.filter((item) => item.labels?.bestSeller || item.parentProduct?.labels?.bestSeller);
    }
    if (selectedCategory === "sale") {
      return allShopItems.filter((item) => item.labels?.sale || item.parentProduct?.labels?.sale);
    }
    return allShopItems.filter((item) => matchProductCategory(item.parentProduct, selectedCategory));
  }, [allShopItems, selectedCategory]);

  // Live Rating Real Counts scoped to category products
  const ratingCounts = useMemo(() => {
    const getStarLevel = (r: any) => {
      const val = Number(r !== undefined && r !== null ? r : 0);
      if (val <= 0) return 0;
      return val >= 4.5 ? 5 : val >= 3.5 ? 4 : val >= 2.5 ? 3 : val >= 1.5 ? 2 : 1;
    };
    const c5 = categoryScopedItems.filter((item) => getStarLevel(item.rating || item.parentProduct?.rating) === 5).length;
    const c4 = categoryScopedItems.filter((item) => getStarLevel(item.rating || item.parentProduct?.rating) === 4).length;
    const c3 = categoryScopedItems.filter((item) => getStarLevel(item.rating || item.parentProduct?.rating) === 3).length;
    const c2 = categoryScopedItems.filter((item) => getStarLevel(item.rating || item.parentProduct?.rating) === 2).length;
    const c1 = categoryScopedItems.filter((item) => getStarLevel(item.rating || item.parentProduct?.rating) === 1).length;
    return [
      { stars: 5, count: c5 },
      { stars: 4, count: c4 },
      { stars: 3, count: c3 },
      { stars: 2, count: c2 },
      { stars: 1, count: c1 },
    ];
  }, [categoryScopedItems]);

  // Live Dynamic Colors extracted from relevant category shop products & variants with accurate counts (only pure color names)
  const availableDynamicColors = useMemo(() => {
    const colorMap = new Map<string, { name: string; hex: string }>();

    // 1. Populate from active category shop items
    categoryScopedItems.forEach((item: any) => {
      const pureColor = extractPureColor(item.variantColor || "");
      if (pureColor && !["standard", "default", "none", "free size"].includes(pureColor.toLowerCase())) {
        const key = pureColor.toLowerCase();
        if (!colorMap.has(key)) {
          colorMap.set(key, {
            name: pureColor,
            hex: item.variantColorHex || getColorHex(pureColor),
          });
        }
      }

      const p = item.parentProduct;
      if (p && Array.isArray(p.colors)) {
        p.colors.forEach((col: any) => {
          const rawColName = (typeof col === "string" ? col : col.colorName || col.name || col.color || "").trim();
          const pure = extractPureColor(rawColName);
          if (pure && !["standard", "default", "none", "free size"].includes(pure.toLowerCase())) {
            const key = pure.toLowerCase();
            if (!colorMap.has(key)) {
              colorMap.set(key, {
                name: pure,
                hex: (typeof col === "object" ? col.colorHex : null) || getColorHex(pure),
              });
            }
          }
        });
      }
    });

    // 2. Compute exact product/variant count for each distinct color in this category
    const result: Array<{ name: string; hex: string; count: number }> = [];
    colorMap.forEach((val) => {
      const cleanC = val.name.toLowerCase().trim();
      const countForColor = categoryScopedItems.filter((item: any) => {
        const itemColor = extractPureColor(item.variantColor || "").toLowerCase().trim();
        const p = item.parentProduct || {};
        if (itemColor && (itemColor === cleanC || itemColor.includes(cleanC) || cleanC.includes(itemColor))) return true;
        const hasCol = (p.colors || []).some((col: any) => {
          const colRaw = extractPureColor(typeof col === "string" ? col : col.colorName || col.name || col.color || "").toLowerCase().trim();
          return colRaw === cleanC || colRaw.includes(cleanC) || cleanC.includes(colRaw);
        });
        return hasCol;
      }).length;

      if (countForColor > 0) {
        result.push({
          name: val.name,
          hex: val.hex,
          count: countForColor,
        });
      }
    });

    return result.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [categoryScopedItems]);

  // Live Dynamic Sizes extracted STRICTLY from current category products with real counts > 0
  const availableDynamicSizes = useMemo(() => {
    const sizeMap = new Map<string, number>();

    // 1. Gather sizes strictly from products in the current category/view
    categoryScopedItems.forEach((item: any) => {
      const p = item.parentProduct || {};
      const productSizes = new Set<string>();
      if (item.variantSize) productSizes.add(item.variantSize.trim());
      (p.availableSizes || p.sizes || []).forEach((sz: string) => {
        if (sz && typeof sz === "string") productSizes.add(sz.trim());
      });
      (p.variations || p.variants || []).forEach((v: any) => {
        const s = (v.size || v.sizeName || "").trim();
        if (s) productSizes.add(s);
      });
      // Extract sizes from color strings with slashes (e.g. "Green / S")
      (p.colors || []).forEach((col: any) => {
        const raw = typeof col === "string" ? col : (col.colorName || col.name || col.color || "");
        if (raw && raw.includes("/")) {
          const parts = raw.split("/");
          if (parts.length > 1 && parts[1].trim()) {
            productSizes.add(parts[1].trim());
          }
        }
      });
      productSizes.forEach((sz) => {
        if (sz) {
          sizeMap.set(sz, (sizeMap.get(sz) || 0) + 1);
        }
      });
    });

    // Only include sizes that have count > 0 for this category's products
    const list: Array<{ name: string; count: number }> = [];
    sizeMap.forEach((count, name) => {
      if (count > 0) {
        list.push({ name, count });
      }
    });

    return list.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [categoryScopedItems]);

  // Sidebar Filter Component (matching Hervia Tea collapsible accordion design)
  const FilterSidebar = (
    <div className="space-y-6 text-zinc-900 font-sans">
      {/* 1. Category Accordion */}
      <div className="border-b border-zinc-200 pb-2">
        <button
          type="button"
          onClick={() => toggleSection("categories")}
          className="flex w-full items-center justify-between text-sm font-semibold tracking-wider text-zinc-900 mb-3 cursor-pointer"
        >
          <span>Categories</span>
          {openSections.categories ? (
            <Minus className="w-6 h-6 stroke-1 text-zinc-800" />
          ) : (
            <Plus className="w-6 h-6 stroke-1 text-zinc-800" />
          )}
        </button>
        {openSections.categories && (
          <ul className="space-y-2 text-xs font-semibold text-zinc-600 tracking-wide">
            {/* All Products Option */}
            <li>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubCategory(null);
                  setSearchParams({});
                }}
                className={`flex w-full items-center justify-between text-left hover:text-[#520618] transition-colors cursor-pointer ${
                  !selectedCategory || selectedCategory.toLowerCase() === "all"
                    ? "text-[#520618] font-extrabold"
                    : ""
                }`}
              >
                <span>All Products</span>
                <span className="text-zinc-400 font-normal text-[10px]">
                  ({allShopItems.length})
                </span>
              </button>
            </li>            {(liveCategoriesList.length > 0 ? liveCategoriesList : (filterConfig?.categories || []))
              .filter((c: any) => c && c.name && c.isActive !== false)
              .map((cat: any) => {
                const catKey = cat.name;
                const catName = cat.name;
                const isActive = (selectedCategory || "").toLowerCase() === catKey.toLowerCase();
                const realCount = allShopItems.filter((item) => matchProductCategory(item.parentProduct, catKey)).length;

                return (
                  <li key={cat.id || catKey}>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage(1);
                        if (isActive) {
                          setSelectedCategory(null);
                          setSelectedSubCategory(null);
                          setSearchParams({});
                        } else {
                          setSelectedCategory(catKey);
                          setSelectedSubCategory(null);
                          setSearchParams({ category: catKey });
                        }
                      }}
                      className={`flex w-full items-center justify-between text-left hover:text-[#520618] transition-colors cursor-pointer py-1 ${
                        isActive ? "text-[#520618] font-extrabold" : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      <span className="truncate">{catName}</span>
                      <span className={`text-[10px] shrink-0 ml-1 font-normal ${isActive ? "text-[#520618] font-bold" : "text-zinc-400"}`}>
                        ({realCount})
                      </span>
                    </button>
                  </li>
                );
              })}
          </ul>
        )}
      </div>

      {/* 2. Price Dual Slider (Matching Screenshot exactly: ₹399 to ₹2,000+) */}
      <div className="border-b border-zinc-200 pb-5">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="flex w-full items-center justify-between text-sm font-semibold tracking-wider text-[#1c1c1e] mb-2 cursor-pointer"
        >
          <span>Price</span>
          {openSections.price ? (
            <Minus className="w-6 h-6 stroke-1 text-zinc-800" />
          ) : (
            <Plus className="w-6 h-6 stroke-1 text-zinc-800" />
          )}
        </button>
        {openSections.price && (
          <div className="space-y-4 pt-1">
            {/* Price Label (e.g. ₹399 – ₹2,000+) */}
            <div className="text-sm font-bold text-zinc-900 tracking-tight">
              ₹{minPrice.toLocaleString("en-IN")} – ₹{maxPrice >= 2000 ? "2,000+" : maxPrice.toLocaleString("en-IN")}
            </div>

            {/* Dual Slider Track & Circle Thumbs */}
            <div className="relative flex items-center select-none py-3 w-full">
              {/* Background Gray Track */}
              <div className="w-full h-1.5 bg-zinc-200 rounded-full" />

              {/* Active Black Highlight Track */}
              <div
                className="absolute h-1.5 bg-neutral-900 rounded-full transition-all duration-75"
                style={{
                  left: `${((Math.max(PRICE_MIN, minPrice) - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                  width: `${((Math.min(PRICE_MAX, maxPrice) - Math.max(PRICE_MIN, minPrice)) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                }}
              />

              {/* Left Thumb (Min Slider) */}
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={20}
                value={minPrice}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), maxPrice - 40);
                  setMinPrice(val);
                }}
                className="dual-range-input"
                style={{ zIndex: minPrice > 1600 ? 25 : 15 }}
              />

              {/* Right Thumb (Max Slider) */}
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={20}
                value={maxPrice}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), minPrice + 40);
                  setMaxPrice(val);
                }}
                className="dual-range-input"
                style={{ zIndex: 20 }}
              />
            </div>

            {/* Quick Reset if modified */}
            {(minPrice > PRICE_MIN || maxPrice < PRICE_MAX) && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-400 font-medium">
                  {filteredProducts.length} items found
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice(PRICE_MIN);
                    setMaxPrice(PRICE_MAX);
                  }}
                  className="text-[11px] text-neutral-900 font-bold hover:underline cursor-pointer"
                >
                  Reset Price
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Color Filter */}
      <div className="border-b border-zinc-200 pb-2">
        <button
          type="button"
          onClick={() => toggleSection("color")}
          className="flex w-full items-center justify-between text-sm font-semibold tracking-wider text-zinc-900 mb-3 cursor-pointer"
        >
          <span>Color</span>
          {openSections.color ? (
            <Minus className="w-6 h-6 stroke-1 text-zinc-800" />
          ) : (
            <Plus className="w-6 h-6 stroke-1 text-zinc-800" />
          )}
        </button>
        {openSections.color && (
          <ul className="space-y-2 text-xs font-semibold text-zinc-600 tracking-wide">
            {availableDynamicColors.length === 0 ? (
              <li className="text-[11px] text-zinc-400 py-1">No colors available</li>
            ) : (
              availableDynamicColors.map((col) => {
                const colorName = col.name;
                const colorHex = col.hex;
                const checked = selectedColors.includes(colorName);

                return (
                  <li key={colorName} className="flex items-center justify-between cursor-pointer">
                    <label htmlFor={`color-${colorName}`} className="cursor-pointer select-none flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`color-${colorName}`}
                        checked={checked}
                        onChange={() => toggleColor(colorName)}
                        className="w-4 h-4 rounded border-zinc-300 text-[#520618] focus:ring-[#520618]/20 cursor-pointer accent-[#520618]"
                      />
                      {colorHex && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-zinc-300 shadow-2xs inline-block shrink-0"
                          style={{ backgroundColor: colorHex }}
                        />
                      )}
                      <span>{colorName}</span>
                    </label>
                    <span className="text-zinc-400 font-normal text-[10px]">({col.count})</span>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      {/* 4. Size Filter */}
      {availableDynamicSizes.length > 0 && (
        <div className="border-b border-zinc-200 pb-2">
          <button
            type="button"
            onClick={() => toggleSection("size")}
            className="flex w-full items-center justify-between text-sm font-semibold tracking-wider text-zinc-900 mb-3 cursor-pointer"
          >
            <span>Size</span>
            {openSections.size ? (
              <Minus className="w-6 h-6 stroke-1 text-zinc-800" />
            ) : (
              <Plus className="w-6 h-6 stroke-1 text-zinc-800" />
            )}
          </button>
          {openSections.size && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {availableDynamicSizes.map((s) => {
                const sizeVal = s.name;
                const checked = selectedSizes.includes(sizeVal);
                return (
                  <button
                    key={sizeVal}
                    type="button"
                    onClick={() => toggleSize(sizeVal)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${checked
                      ? "bg-[#520618] text-white border-[#520618] shadow-xs"
                      : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                      }`}
                  >
                    <span>{sizeVal}</span>
                    {s.count > 0 && (
                      <span className={`text-[10px] ${checked ? "text-white/80" : "text-zinc-400"}`}>
                        ({s.count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Dynamic Custom Attributes Filters (Material, Craft Technique, Occasion, etc.) */}
      {(filterConfig?.attributes || []).map((attr: any) => {
        const attrKey = `attr_${attr.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
        const isSectionOpen = openSections[attrKey] ?? true;
        const selectedVals = selectedAttributes[attr.name] || [];

        return (
          <div key={attr.name} className="border-b border-zinc-200 pb-2">
            <button
              type="button"
              onClick={() => toggleSection(attrKey)}
              className="flex w-full items-center justify-between text-sm font-semibold tracking-wider text-zinc-900 mb-3 cursor-pointer"
            >
              <span>{attr.name}</span>
              {isSectionOpen ? (
                <Minus className="w-6 h-6 stroke-1 text-zinc-800" />
              ) : (
                <Plus className="w-6 h-6 stroke-1 text-zinc-800" />
              )}
            </button>
            {isSectionOpen && (
              <ul className="space-y-2 text-xs font-semibold text-zinc-600 tracking-wide">
                {(attr.values || []).map((val: string) => {
                  const checked = selectedVals.includes(val);
                  return (
                    <li key={val} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        id={`${attrKey}-${val}`}
                        checked={checked}
                        onChange={() => toggleAttributeValue(attr.name, val)}
                        className="w-4 h-4 rounded border-zinc-300 text-[#520618] focus:ring-[#520618]/20 cursor-pointer accent-[#520618]"
                      />
                      <label htmlFor={`${attrKey}-${val}`} className="cursor-pointer select-none">
                        {val}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}

      {/* 6. Rating Filter */}
      {ratingCounts.some((r) => r.count > 0) && (
        <div>
          <button
            type="button"
            onClick={() => toggleSection("rating")}
            className="flex w-full items-center justify-between text-sm font-semibold tracking-wider text-zinc-900 mb-3 cursor-pointer"
          >
            <span>Rating</span>
            {openSections.rating ? (
              <Minus className="w-6 h-6 stroke-1 text-zinc-800" />
            ) : (
              <Plus className="w-6 h-6 stroke-1 text-zinc-800" />
            )}
          </button>
          {openSections.rating && (
            <ul className="space-y-2.5 text-xs text-zinc-600">
              {ratingCounts
                .filter(({ count }) => count > 0)
                .map(({ stars, count }) => {
                  const checked = selectedRatings.includes(stars);
                  return (
                    <li key={stars} className="flex items-center justify-between cursor-pointer">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRating(stars)}
                          className="w-4 h-4 rounded border-zinc-300 text-[#520618] focus:ring-[#520618]/20 cursor-pointer accent-[#520618]"
                        />
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 fill-current ${
                                i >= stars ? "text-zinc-300 fill-zinc-200" : ""
                              }`}
                            />
                          ))}
                        </div>
                      </label>
                      <span className="text-zinc-400 text-[10px]">({count})</span>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      )}

      {/* Reset Button */}
      {(selectedCategory ||
        selectedColors.length > 0 ||
        selectedSizes.length > 0 ||
        Object.values(selectedAttributes).some((arr) => arr.length > 0) ||
        selectedRatings.length > 0 ||
        maxPrice < 3000) && (
          <button
            type="button"
            onClick={resetFilters}
            className="w-full py-2.5 bg-zinc-100 hover:bg-[#520618] hover:text-white text-zinc-900 font-bold text-xs font-semibold tracking-wider transition-colors rounded-xl cursor-pointer"
          >
            RESET ALL FILTERS
          </button>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-black selection:text-white flex flex-col">
      <Navbar />

      {/* TOP SHOP BY CATEGORY CIRCLES SECTION */}
      <section className="bg-white pt-8 pb-6 border-b border-zinc-100">
        <div className="w-full max-w-[1400px] mx-auto px-0 sm:px-6 lg:px-8">
          <p className="text-[11px] font-extrabold font-semibold tracking-[0.2em] text-brand-maroon mb-4 text-center">
            AWESOME HANDMADE CATEGORIES
          </p>

          {/* SINGLE HORIZONTAL LINE: 8 (Desktop xl) / 6 (Laptop lg) / 5 (Tablet sm/md) / 3 (Mobile) */}
          <div className="relative w-full">
            <div
              ref={catScrollRef}
              onScroll={handleCatScroll}
              onMouseDown={handleCatMouseDown}
              onMouseMove={handleCatMouseMove}
              onMouseUp={handleCatMouseUp}
              onMouseLeave={handleCatMouseUp}
              className={`flex flex-row items-stretch overflow-x-auto scroll-smooth scrollbar-none select-none cursor-grab active:cursor-grabbing w-full px-2 ${
                dynamicShopCategories.length < 5 ? "justify-center" : ""
              }`}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {dynamicShopCategories.map((cat) => {
                const active = cat.id === "all"
                  ? (!selectedCategory || selectedCategory.toLowerCase() === "all")
                  : (selectedCategory?.toLowerCase() === cat.id.toLowerCase());

                return (
                  <div
                    key={cat.id}
                    className="shrink-0 w-[calc(100%/3)] sm:w-[calc(100%/5)] lg:w-[calc(100%/6)] xl:w-[calc(100%/8)] px-1.5 sm:px-2 md:px-3 text-center"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (hasMovedCat.current) return;
                        if (cat.id === "all") {
                          setSelectedCategory(null);
                          setSearchParams({});
                        } else {
                          setSelectedCategory(active ? null : cat.id);
                        }
                      }}
                      className="group flex flex-col items-center justify-between w-full h-full py-2 cursor-pointer transition-colors duration-300"
                    >
                      {/* Story-style Square Card Image */}
                      <div
                        className={`w-[76px] h-[76px] min-[400px]:w-[84px] min-[400px]:h-[84px] sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 aspect-square rounded-2xl overflow-hidden transition-all duration-300 p-0.5 shadow-sm ${active
                          ? "border-2 border-[#520618] shadow-md"
                          : "border-2 border-transparent group-hover:border-zinc-300"
                          }`}
                      >
                        <img
                          src={cat.img}
                          alt={cat.name}
                          className="w-full h-full object-cover object-center rounded-[14px] pointer-events-none"
                          draggable={false}
                        />
                      </div>

                    </button>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION DOTS (Adapts dynamically to Mobile, Tablet, Laptop, Desktop) */}
            {totalCatDots > 1 && (
              <PaginationDots
                total={totalCatDots}
                current={activeCatDot}
                onChange={scrollToCatDot}
                className="pt-4"
              />
            )}
          </div>
        </div>
      </section>

      {/* TOP VIEW & CONTROL BAR (Single Line Grid like Hervia Tea) */}
      <section className="w-full border-b border-zinc-200/80 bg-white">
        <div className="mx-auto max-w-[1400px]">
          {/* DESKTOP & TABLET VIEW (>= sm) */}
          <div className="hidden sm:flex sm:items-center sm:justify-between px-4 sm:px-6 lg:px-8 py-3 text-xs text-zinc-900 gap-4">
            {/* Left - VIEW Toggles & Mobile/Tablet Filter Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="flex lg:hidden items-center gap-1.5 font-bold text-xs tracking-wider text-zinc-900 hover:text-[#520618] transition-colors cursor-pointer py-1.5 px-3 rounded-lg border border-zinc-200 bg-zinc-50/80 hover:bg-zinc-100"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-900 shrink-0 stroke-[1.8]" />
                <span>FILTER</span>
              </button>

              <div className="hidden lg:flex items-center gap-3">
                <span className="font-bold text-xs tracking-widest text-zinc-900">
                  VIEW
                </span>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid View"
                  className={`p-1 transition-colors cursor-pointer ${viewMode === "grid" ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-900"
                    }`}
                >
                  <LayoutGrid className="w-4.5 h-4.5 stroke-[1.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-label="List View"
                  className={`p-1 transition-colors cursor-pointer ${viewMode === "list" ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-900"
                    }`}
                >
                  <ListIcon className="w-4.5 h-4.5 stroke-[1.5]" />
                </button>
              </div>
            </div>

            {/* Center - Results Count */}
            <div className="text-xs font-semibold text-zinc-500 whitespace-nowrap hidden md:block">
              Showing 1–{displayedProducts.length} of {totalResults} results
            </div>

            {/* Right - SORT BY & SHOW */}
            <div className="flex items-center gap-4 shrink-0">
              {/* SORT BY */}
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-zinc-400 font-semibold text-xs tracking-wider shrink-0">
                  SORT BY
                </span>
                <Select value={sort} onValueChange={(val) => setSort(val)}>
                  <SelectTrigger className="h-8 min-w-[130px] border border-zinc-200/90 bg-zinc-50/80 hover:bg-zinc-100 font-bold text-xs text-zinc-900 px-3 py-0 rounded-lg focus:ring-0">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent align="end" className="min-w-[170px] bg-white border border-zinc-200 shadow-xl rounded-xl">
                    <SelectItem value="default">DEFAULT</SelectItem>
                    <SelectItem value="price-asc">PRICE: LOW TO HIGH</SelectItem>
                    <SelectItem value="price-desc">PRICE: HIGH TO LOW</SelectItem>
                    <SelectItem value="rating">RATING</SelectItem>
                    <SelectItem value="newest">NEWEST</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SHOW PER PAGE */}
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-zinc-400 font-semibold text-xs tracking-wider shrink-0">
                  SHOW
                </span>
                <Select value={String(showPerPage)} onValueChange={(val) => setShowPerPage(Number(val))}>
                  <SelectTrigger className="h-8 min-w-[70px] border border-zinc-200/90 bg-zinc-50/80 hover:bg-zinc-100 font-bold text-xs text-zinc-900 px-2.5 py-0 rounded-lg focus:ring-0">
                    <SelectValue placeholder="12" />
                  </SelectTrigger>
                  <SelectContent align="end" className="min-w-[90px] bg-white border border-zinc-200 shadow-xl rounded-xl">
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="36">36</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* MOBILE VIEW (< sm) */}
          <div className="grid sm:hidden grid-cols-3 items-center divide-x divide-zinc-200/80 text-zinc-900 w-full py-1.5">
            {/* 1. Filter Button */}
            <div className="flex items-center justify-center px-1">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="flex items-center justify-center gap-1.5 font-bold text-[11px] tracking-wider text-zinc-900 hover:text-[#520618] transition-colors py-1.5 px-2 rounded-lg hover:bg-zinc-50 w-full cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.8] shrink-0 text-zinc-700" />
                <span>FILTER</span>
              </button>
            </div>

            {/* 2. Sort Dropdown */}
            <div className="flex items-center justify-center px-1">
              <Select value={sort} onValueChange={(val) => setSort(val)}>
                <SelectTrigger className="h-8 w-full border-0 shadow-none bg-transparent hover:bg-zinc-50 font-bold text-[11px] text-zinc-900 px-1 py-0 focus:ring-0 gap-1 justify-center rounded-lg">
                  <span className="text-zinc-400 font-semibold text-[10px] uppercase">SORT:</span>
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent align="center" className="min-w-[160px] bg-white border border-zinc-200 shadow-xl rounded-xl">
                  <SelectItem value="default">DEFAULT</SelectItem>
                  <SelectItem value="price-asc">PRICE: LOW TO HIGH</SelectItem>
                  <SelectItem value="price-desc">PRICE: HIGH TO LOW</SelectItem>
                  <SelectItem value="rating">RATING</SelectItem>
                  <SelectItem value="newest">NEWEST</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. Show Per Page Dropdown */}
            <div className="flex items-center justify-center px-1">
              <Select value={String(showPerPage)} onValueChange={(val) => setShowPerPage(Number(val))}>
                <SelectTrigger className="h-8 w-full border-0 shadow-none bg-transparent hover:bg-zinc-50 font-bold text-[11px] text-zinc-900 px-1 py-0 focus:ring-0 gap-1 justify-center rounded-lg">
                  <span className="text-zinc-400 font-semibold text-[10px] uppercase">SHOW:</span>
                  <SelectValue placeholder="12" />
                </SelectTrigger>
                <SelectContent align="end" className="min-w-[90px] bg-white border border-zinc-200 shadow-xl rounded-xl">
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="36">36</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN PRODUCTS & FILTERS CONTENT SECTION */}
      <main className="max-w-[1500px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">
          {/* Desktop Left Sidebar Filter */}
          <aside className="hidden lg:block sticky top-24 pr-2">{FilterSidebar}</aside>

          {/* Product Grid / List Display */}
          <section>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-zinc-200/80 p-2.5 space-y-3 animate-pulse">
                    <div className="aspect-[3/3.5] bg-zinc-100 rounded-xl" />
                    <div className="h-4 bg-zinc-100 rounded w-3/4" />
                    <div className="h-3 bg-zinc-100 rounded w-1/2" />
                    <div className="h-9 bg-zinc-100 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="text-center py-16 bg-zinc-50 border border-zinc-200 rounded-2xl p-8 space-y-4">
                <h3 className="text-lg font-bold text-zinc-900">No products found</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Try adjusting your chosen filters or price range to discover Awesome Handmade products.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-zinc-900 text-white font-bold text-xs font-semibold tracking-wider hover:bg-[#520618] transition-colors rounded-xl cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* GRID VIEW MODE matching Hervia layout */
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {displayedProducts.map((p) => {
                  const mainImg =
                    p.image ||
                    p.images?.[0] ||
                    "https://m.media-amazon.com/images/I/71LtEuQjqXL._SL1500_.jpg";
                  const wishlisted = isWishlisted(String(p.productId));
                  const discount = p.originalPrice
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    : 0;

                  return (
                    <div
                      key={p.id}
                      className="group bg-white rounded-2xl border border-zinc-200/80 p-2 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    >
                      {(() => {
                        const cartItem = cartItems.find(
                          (item) =>
                            String(item.productId) === String(p.productId) &&
                            (item.colorName || "").toLowerCase() === (p.variantColor || "standard").toLowerCase()
                        );
                        const itemQuantity = cartItem ? cartItem.quantity : 0;

                        return (
                          <>
                            <div>
                              {/* Image Frame & Badges with Smooth Right-to-Left Auto Slider on Hover */}
                              <Link
                                to={p.linkUrl}
                                onClick={(e) => handleProductClick(e, p.productId)}
                                className="block cursor-pointer"
                              >
                                <ProductHoverSlider
                                  product={p}
                                  alt={p.name}
                                  className="relative aspect-square bg-zinc-100 rounded-xl overflow-hidden block"
                                >
                                  {/* Badges */}
                                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                                    {discount > 0 && (
                                      <span className="bg-[#520618] text-white text-[9px] font-extrabold font-semibold px-2 py-0.5 rounded-full shadow-xs">
                                        -{discount}%
                                      </span>
                                    )}
                                    {(p.labels?.bestSeller || p.parentProduct?.labels?.bestSeller) && (
                                      <span className="bg-amber-500 text-white text-[9px] font-extrabold font-semibold px-2 py-0.5 rounded-full shadow-xs">
                                        BEST SELLER
                                      </span>
                                    )}
                                  </div>

                                  {/* Wishlist Heart Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleWishlist(String(p.productId));
                                    }}
                                    className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md shadow-xs transition-colors z-10 cursor-pointer ${wishlisted
                                      ? "bg-rose-500 text-white"
                                      : "bg-white/80 text-zinc-700 hover:bg-white"
                                      }`}
                                    aria-label="Wishlist"
                                  >
                                    <Heart
                                      className={`w-3.5 h-3.5 ${wishlisted ? "fill-white" : ""
                                        }`}
                                    />
                                  </button>
                                </ProductHoverSlider>
                              </Link>

                              {/* Card Content Body */}
                              <div className="p-2 pt-3 space-y-1.5">
                                <span className="text-[12px] font-semibold tracking-wider text-[#798A7A] block">
                                  {p.category}
                                </span>

                                <Link to={p.linkUrl} onClick={(e) => handleProductClick(e, p.productId)}>
                                  <h3 className="font-semibold text-zinc-900 text-sm line-clamp-1 group-hover:text-[#520618] transition-colors">
                                    {p.name || p.baseTitle}
                                  </h3>
                                </Link>

                                {p.isVariantCard && p.variantColor && (
                                  <div className="flex items-center gap-1.5 pt-0.5">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0 inline-block shadow-2xs"
                                      style={{ backgroundColor: p.variantColorHex || getColorHex(p.variantColor) }}
                                    />
                                    <span className="text-[11px] font-semibold text-zinc-600">
                                      {p.variantColor}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                  <div className="flex items-center text-amber-400 gap-0.5">
                                    {[...Array(5)].map((_, i) => {
                                      const ratingVal = Number(p.rating || 0);
                                      const isFilled = i < Math.floor(ratingVal);
                                      return (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 ${
                                            isFilled
                                              ? "fill-amber-400 text-amber-400"
                                              : "text-zinc-200 fill-zinc-200"
                                          }`}
                                        />
                                      );
                                    })}
                                  </div>
                                  <span className="font-semibold text-zinc-800 text-[11px]">
                                    {Number(p.rating || 0) > 0 ? Number(p.rating).toFixed(1) : "0.0"}
                                  </span>
                                  <span className="text-zinc-400 font-normal text-[10px]">
                                    ({Number(p.reviewCount || 0)})
                                  </span>
                                </div>

                                <div className="flex items-baseline gap-2 pt-0.5">
                                  <span className="text-base font-semibold text-zinc-900">
                                    ₹{p.price}
                                  </span>
                                  {p.originalPrice && p.originalPrice > p.price && (
                                    <span className="text-xs text-zinc-400 line-through font-semibold">
                                      ₹{p.originalPrice}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Add to Bag Button / Green Quantity Stepper */}
                            <div className="p-2 pt-0">
                              {itemQuantity > 0 ? (
                                <div className="w-full h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-between px-3 shadow-xs">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (cartItem) updateQuantity(cartItem.id, cartItem.quantity - 1);
                                    }}
                                    className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-colors font-black text-sm cursor-pointer active:scale-90"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-6 h-6 stroke-1" />
                                  </button>
                                  <span className="text-xs font-semibold px-2">{itemQuantity}</span>
                                  <button
                                    type="button"
                                    disabled={p.stock !== undefined && p.stock !== null && itemQuantity >= Number(p.stock)}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const maxS = p.stock !== undefined && p.stock !== null ? Number(p.stock) : 25;
                                      if (cartItem && itemQuantity < maxS) {
                                        updateQuantity(cartItem.id, Math.min(maxS, cartItem.quantity + 1));
                                      }
                                    }}
                                    className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors font-black text-sm ${
                                      p.stock !== undefined && itemQuantity >= Number(p.stock)
                                        ? "text-zinc-500 opacity-40 cursor-not-allowed"
                                        : "text-white hover:bg-white/20 cursor-pointer active:scale-90"
                                    }`}
                                    aria-label="Increase quantity"
                                    title={p.stock !== undefined && itemQuantity >= Number(p.stock) ? `Max ${p.stock} in stock` : "Increase quantity"}
                                  >
                                    <Plus className="w-6 h-6 stroke-1" />
                                  </button>
                                </div>
                              ) : (p.stock !== undefined && p.stock <= 0) ? (
                                <button
                                  disabled
                                  className="w-full h-10 bg-zinc-200 text-zinc-500 text-xs font-semibold rounded-xl cursor-not-allowed select-none"
                                >
                                  Out of Stock
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    addToCart({
                                      productId: String(p.productId),
                                      productName: p.name,
                                      brand: p.parentProduct?.brand || "Awesome Handmade",
                                      colorName: p.variantColor || "Standard",
                                      colorHex: p.variantColorHex || getColorHex(p.variantColor),
                                      size: p.variantSize || "Free Size",
                                      price: p.price,
                                      originalPrice: p.originalPrice || p.price,
                                      image: mainImg,
                                      sku: p.sku || "AOC-SKU",
                                      quantity: 1,
                                      stock: p.stock !== undefined ? Number(p.stock) : 25,
                                    })
                                  }
                                  className="w-full h-10 bg-zinc-900 hover:bg-[#520618] text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                >
                                  <ShoppingBag className="w-4 h-4" />
                                  <span>Add To Bag</span>
                                </button>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW MODE matching Grid styling & responsive alignment */
              <div className="space-y-4">
                {displayedProducts.map((p) => {
                  const mainImg =
                    p.image ||
                    p.images?.[0] ||
                    "https://m.media-amazon.com/images/I/71LtEuQjqXL._SL1500_.jpg";
                  const wishlisted = isWishlisted(String(p.productId));
                  const cartItem = cartItems.find(
                    (item) =>
                      String(item.productId) === String(p.productId) &&
                      (item.colorName || "").toLowerCase() === (p.variantColor || "standard").toLowerCase()
                  );
                  const itemQuantity = cartItem ? cartItem.quantity : 0;
                  const discount = p.originalPrice
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    : 0;

                  return (
                    <div
                      key={p.id}
                      className="group bg-white border border-zinc-200/80 rounded-2xl p-2 flex flex-row items-start sm:items-center gap-3.5 sm:gap-5 hover:shadow-md transition-all"
                    >
                      {/* Product Image Frame with Top-Right Heart Icon */}
                      <Link
                        to={p.linkUrl}
                        onClick={(e) => handleProductClick(e, p.productId)}
                        className="w-28 sm:w-40 md:w-44 aspect-[3/3.5] sm:aspect-square bg-zinc-100 rounded-xl overflow-hidden shrink-0 relative block cursor-pointer"
                      >
                        <img
                          src={mainImg}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                          {discount > 0 && (
                            <span className="bg-[#520618] text-white text-[8px] sm:text-[9px] font-extrabold font-semibold px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
                              -{discount}%
                            </span>
                          )}
                        </div>

                        {/* Top Right Heart Wishlist Button inside Image */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(String(p.productId));
                          }}
                          className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full backdrop-blur-md shadow-xs transition-colors z-10 cursor-pointer ${wishlisted
                            ? "bg-rose-500 text-white"
                            : "bg-white/80 text-zinc-700 hover:bg-white"
                            }`}
                          aria-label="Wishlist"
                        >
                          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${wishlisted ? "fill-current" : ""}`} />
                        </button>
                      </Link>

                      {/* Content Details */}
                      <div className="flex-1 text-left space-y-1 sm:space-y-1.5 py-0.5 min-w-0">
                        <span className="text-[11px] sm:text-[12px] font-semibold tracking-wider text-[#798A7A] block">
                          {p.category}
                        </span>

                        <Link to={p.linkUrl} onClick={(e) => handleProductClick(e, p.productId)}>
                          <h3 className="font-semibold text-zinc-900 text-xs sm:text-base line-clamp-1 group-hover:text-[#520618] transition-colors">
                            {p.name || p.baseTitle}
                          </h3>
                        </Link>

                        {p.isVariantCard && p.variantColor && (
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0 inline-block shadow-2xs"
                              style={{ backgroundColor: p.variantColorHex || getColorHex(p.variantColor) }}
                            />
                            <span className="text-[11px] font-semibold text-zinc-600">
                              {p.variantColor}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium">
                          <div className="flex items-center text-amber-400 gap-0.5">
                            {[...Array(5)].map((_, i) => {
                              const ratingVal = Number(p.rating || 0);
                              const isFilled = i < Math.floor(ratingVal);
                              return (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    isFilled
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-zinc-200 fill-zinc-200"
                                  }`}
                                />
                              );
                            })}
                          </div>
                          <span className="font-semibold text-zinc-800 text-[11px]">
                            {Number(p.rating || 0) > 0 ? Number(p.rating).toFixed(1) : "0.0"}
                          </span>
                          <span className="text-zinc-400 font-normal text-[10px]">
                            ({Number(p.reviewCount || 0)})
                          </span>
                        </div>

                        <p className="text-[11px] sm:text-xs text-zinc-500 line-clamp-1 sm:line-clamp-2 leading-relaxed font-medium">
                          {p.shortDescription || p.fullDescription || p.category || ""}
                        </p>

                        <div className="flex items-baseline gap-2 pt-0.5">
                          <span className="text-sm sm:text-base font-semibold text-zinc-900">
                            ₹{p.price}
                          </span>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="text-[10px] sm:text-xs text-zinc-400 line-through font-semibold">
                              ₹{p.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Action Area: Matching Width & Height Add to Cart / Stepper */}
                        <div className="pt-1.5 flex items-center gap-2">
                          {itemQuantity > 0 ? (
                            <div
                              className="w-[128px] h-[36px] bg-black text-white text-xs font-medium px-2.5 rounded-xl shadow-xs flex items-center justify-between shrink-0"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (cartItem) updateQuantity(cartItem.id, cartItem.quantity - 1);
                                }}
                                className="w-5 h-5 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-colors font-black cursor-pointer active:scale-90"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                              <span className="text-xs font-semibold px-1">{itemQuantity}</span>
                              <button
                                type="button"
                                disabled={p.stock !== undefined && p.stock !== null && itemQuantity >= Number(p.stock)}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const maxS = p.stock !== undefined && p.stock !== null ? Number(p.stock) : 25;
                                  if (cartItem && itemQuantity < maxS) {
                                    updateQuantity(cartItem.id, Math.min(maxS, cartItem.quantity + 1));
                                  }
                                }}
                                className={`w-5 h-5 flex items-center justify-center rounded-lg transition-colors font-black ${
                                  p.stock !== undefined && itemQuantity >= Number(p.stock)
                                    ? "text-zinc-500 opacity-40 cursor-not-allowed"
                                    : "text-white hover:bg-white/20 cursor-pointer active:scale-90"
                                }`}
                                aria-label="Increase quantity"
                                title={p.stock !== undefined && itemQuantity >= Number(p.stock) ? `Max ${p.stock} in stock` : "Increase quantity"}
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </div>
                          ) : (p.stock !== undefined && p.stock <= 0) ? (
                            <button
                              disabled
                              className="w-[128px] h-[36px] bg-zinc-200 text-zinc-500 text-xs font-semibold rounded-xl cursor-not-allowed select-none shrink-0"
                            >
                              Out of Stock
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart({
                                  productId: String(p.productId),
                                  productName: p.name,
                                  brand: p.parentProduct?.brand || "Awesome Handmade",
                                  colorName: p.variantColor || "Standard",
                                  colorHex: p.variantColorHex || getColorHex(p.variantColor),
                                  size: p.variantSize || "Free Size",
                                  price: p.price,
                                  originalPrice: p.originalPrice || p.price,
                                  image: mainImg,
                                  sku: p.sku || "AOC-SKU",
                                  quantity: 1,
                                  stock: p.stock !== undefined ? Number(p.stock) : 25,
                                });
                              }}
                              className="w-[128px] h-[36px] bg-zinc-900 hover:bg-[#520618] text-white text-[12px] font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              <span>Add to Cart</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PAGINATION BUTTONS (matching 1 2 3 > screenshot) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-md text-xs font-bold transition-all cursor-pointer ${isActive
                        ? "bg-zinc-900 text-white"
                        : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {currentPage < totalPages && (
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="w-9 h-9 rounded-md bg-white border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-100 transition-all cursor-pointer flex items-center justify-center"
                    aria-label="Next Page"
                  >
                    ›
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MOBILE DRAWER FILTERS (Opens from Left side) */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-start">
          {/* Clickable Backdrop to close */}
          <div
            className="absolute inset-0"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative bg-white w-full max-w-xs h-full p-6 space-y-6 overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="font-bold text-zinc-900 text-sm font-semibold tracking-wider">
                Filter Catalog
              </h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="text-zinc-900 rounded-full hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-6 h-6 stroke-1" />
              </button>
            </div>

            {FilterSidebar}

            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="w-full bg-zinc-900 text-white font-semibold py-3 rounded-xl text-sm tracking-wider shadow-md cursor-pointer hover:bg-[#520618] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
