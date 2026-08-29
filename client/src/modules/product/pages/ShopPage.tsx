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
import { CLIENT_SHOP_PRODUCTS } from "../data/productData";
import { ClientShopProduct } from "../types/product";
import {
  fetchLiveProducts,
  subscribeToProductStore,
  getLiveProductsList,
  getLiveFilters,
  subscribeToFilterStore,
} from "@/modules/core/lib/apiStore";

// Shop Categories for Header Bar
const shopCategories = [
  { id: "all", name: "All Products", count: "All items", img: "/images/category/Latkan.webp" },
  { id: "Latkan", name: "Latkans", count: "12 items", img: "/images/category/Latkan.webp" },
  { id: "Earrings", name: "Earrings", count: "10 items", img: "/images/category/Earrings.webp" },
  { id: "Necklace", name: "Necklaces", count: "8 items", img: "/images/category/Necklace.webp" },
  { id: "Choli", name: "Cholis", count: "6 items", img: "/images/category/Choli.webp" },
  { id: "Gift Hamper", name: "Gift Hampers", count: "5 items", img: "/images/category/Gift Hamper.webp" },
  { id: "Waist Belt", name: "Waist Belts", count: "4 items", img: "/images/category/Waist Belt.webp" },
  { id: "Krishna Outfit", name: "Krishna Outfits", count: "4 items", img: "/images/category/Krishna outfit.webp" },
  { id: "Tassel", name: "Tassels", count: "6 items", img: "/images/category/Tassel.webp" },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { wishlistIds, toggleWishlist, isWishlisted } = useWishlist();
  const { openQuickView, isMobileOrTablet } = useQuickView();

  // Dynamic Filters State
  const [filterConfig, setFilterConfig] = useState(() => getLiveFilters());

  useEffect(() => {
    const unsubscribeFilters = subscribeToFilterStore(() => {
      setFilterConfig(getLiveFilters() || { categories: [], colors: [], sizes: [], maxPrice: 3000 });
    });
    return () => unsubscribeFilters();
  }, []);

  const handleProductClick = (e: React.MouseEvent, productId: string | number) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      e.preventDefault();
      openQuickView(productId);
    }
  };

  // Products State
  const [products, setProducts] = useState<ClientShopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout View Mode (grid vs list)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter States
  const initialCategory = categorySlug || searchParams.get("category") || null;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sort & Pagination
  const [sort, setSort] = useState("default");
  const [showPerPage, setShowPerPage] = useState<number>(12);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Accordion Sections Toggle
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    color: true,
    size: true,
    rating: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
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
    setSelectedCategory(catFromUrl || null);
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
    });

    return () => unsubscribe();
  }, []);

  // Filter Checks
  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setMaxPrice(3000);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedRatings([]);
    setSearchQuery("");
    setSort("default");
    setCurrentPage(1);
    setSearchParams({});
  };

  // Comprehensive category & subcategory matching helper
  const matchProductCategory = (prod: any, targetCategory: string): boolean => {
    if (!targetCategory || targetCategory.toLowerCase() === "all") return true;

    const clean = (s?: string) => (s || "").toLowerCase().replace(/[-_\s]+/g, "");
    const target = clean(targetCategory);
    const targetStem = target.endsWith("s") && target.length > 3 ? target.slice(0, -1) : target;

    const cat = clean(prod.category);
    const subcat = clean(prod.subcategory);
    const name = clean(prod.name);
    const desc = clean(prod.shortDescription || prod.subtitle || "");
    const categoriesList = Array.isArray(prod.categories) ? prod.categories.map(clean) : [];

    // 1. Direct or stem equality
    if (cat === target || cat === targetStem || subcat === target || subcat === targetStem) return true;
    if (categoriesList.includes(target) || categoriesList.includes(targetStem)) return true;

    // 2. Substring matching
    if (cat.includes(targetStem) || subcat.includes(targetStem) || target.includes(cat) || targetStem.includes(cat)) return true;
    if (name.includes(targetStem) || desc.includes(targetStem)) return true;

    // 3. Domain-specific semantic mappings
    if (targetStem.includes("latkan") || targetStem.includes("tassel")) {
      return cat.includes("latkan") || cat.includes("tassel") || subcat.includes("latkan") || subcat.includes("tassel") || name.includes("latkan") || name.includes("tassel");
    }
    if (targetStem.includes("choli") || targetStem.includes("navratri")) {
      return cat.includes("choli") || subcat.includes("choli") || name.includes("choli");
    }
    if (targetStem.includes("earring") || targetStem.includes("jhumka")) {
      return cat.includes("earring") || cat.includes("jhumka") || subcat.includes("earring") || name.includes("earring") || name.includes("jhumka");
    }
    if (targetStem.includes("necklace") || targetStem.includes("haar") || targetStem.includes("mala")) {
      return cat.includes("necklace") || subcat.includes("necklace") || name.includes("necklace");
    }
    if (targetStem.includes("gift") || targetStem.includes("hamper") || targetStem.includes("keychain")) {
      return cat.includes("gift") || cat.includes("hamper") || cat.includes("keychain") || subcat.includes("gift") || subcat.includes("hamper") || subcat.includes("keychain") || name.includes("gift") || name.includes("hamper") || name.includes("keychain");
    }
    if (targetStem.includes("hair") || targetStem.includes("bow") || targetStem.includes("clip") || targetStem.includes("band")) {
      return cat.includes("hair") || subcat.includes("hair") || cat.includes("bow") || cat.includes("clip") || name.includes("hair") || name.includes("bow") || name.includes("clip");
    }
    if (targetStem.includes("krishna") || targetStem.includes("poshak") || targetStem.includes("outfit")) {
      return cat.includes("krishna") || subcat.includes("krishna") || name.includes("krishna") || name.includes("poshak");
    }
    if (targetStem.includes("belt") || targetStem.includes("kandora") || targetStem.includes("kamarbandh")) {
      return cat.includes("belt") || subcat.includes("belt") || name.includes("belt") || name.includes("kamarbandh") || name.includes("kandora");
    }
    if (targetStem.includes("watch")) {
      return cat.includes("watch") || subcat.includes("watch") || name.includes("watch");
    }
    if (targetStem.includes("bracelet") || targetStem.includes("anklet") || targetStem.includes("payal")) {
      return cat.includes("bracelet") || cat.includes("anklet") || cat.includes("payal") || subcat.includes("bracelet") || subcat.includes("anklet") || name.includes("bracelet") || name.includes("anklet");
    }
    if (targetStem.includes("jewel") || targetStem.includes("ornament")) {
      return cat.includes("necklace") || cat.includes("earring") || cat.includes("bracelet") || cat.includes("anklet") || cat.includes("ring") || name.includes("jewel");
    }

    return false;
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category Filter (if category selected, show only related; if no category or all, show all products)
    if (selectedCategory && selectedCategory.toLowerCase() !== "all") {
      if (selectedCategory === "newArrival") {
        list = list.filter((p) => p.labels?.newArrival);
      } else if (selectedCategory === "bestSeller") {
        list = list.filter((p) => p.labels?.bestSeller);
      } else if (selectedCategory === "sale") {
        list = list.filter((p) => p.labels?.sale);
      } else {
        list = list.filter((p) => matchProductCategory(p, selectedCategory));
      }
    }

    // Max Price
    list = list.filter((p) => p.price <= maxPrice);

    // Color
    if (selectedColors.length > 0) {
      list = list.filter((p) =>
        selectedColors.some(
          (c) =>
            p.attributes?.some(
              (a) =>
                a.name.toLowerCase() === "color" &&
                a.values.some((v: string) =>
                  v.toLowerCase().includes(c.toLowerCase())
                )
            ) ||
            p.variants?.some((v) =>
              v.color?.toLowerCase().includes(c.toLowerCase())
            )
        )
      );
    }

    // Size
    if (selectedSizes.length > 0) {
      list = list.filter((p) =>
        selectedSizes.some(
          (s) =>
            p.attributes?.some(
              (a) => a.name.toLowerCase() === "size" && a.values.includes(s)
            ) || p.variants?.some((v) => v.size === s)
        )
      );
    }

    // Rating
    if (selectedRatings.length > 0) {
      list = list.filter((p) =>
        selectedRatings.includes(Math.floor(p.rating || 4.8))
      );
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
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
    products,
    selectedCategory,
    maxPrice,
    selectedColors,
    selectedSizes,
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
            {(filterConfig?.categories || []).map((cat: any) => {
              const catKey = cat.key || cat.id || cat.name;
              const rawName = cat.name || catKey;
              // Format uppercase strings to natural Title Case (e.g. BRALETTES -> Bralettes)
              const catName = rawName === rawName.toUpperCase()
                ? rawName.toLowerCase().split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                : rawName;
              const isActive = selectedCategory === catKey;
              return (
                <li key={catKey}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(isActive ? null : catKey);
                      if (!isActive) setSearchParams({ category: catKey });
                      else setSearchParams({});
                    }}
                    className={`flex w-full items-center justify-between text-left hover:text-[#520618] transition-colors cursor-pointer ${isActive ? "text-[#520618] font-extrabold" : ""
                      }`}
                  >
                    <span>{catName}</span>
                    {cat.count !== undefined && (
                      <span className="text-zinc-400 font-normal text-[10px]">
                        ({cat.count})
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 2. Filter By Price */}
      <div className="border-b border-zinc-200 pb-2">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="flex w-full items-center justify-between text-sm font-semibold tracking-wider text-[#1c1c1e] mb-3 cursor-pointer"
        >
          <span>Filter By Price</span>
          {openSections.price ? (
            <Minus className="w-6 h-6 stroke-1 text-zinc-800" />
          ) : (
            <Plus className="w-6 h-6 stroke-1 text-zinc-800" />
          )}
        </button>
        {openSections.price && (
          <div className="space-y-3">
            <input
              type="range"
              min="200"
              max={filterConfig?.maxPrice || 3000}
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#520618]"
            />
            <div className="flex items-center justify-between text-xs font-medium text-zinc-700">
              <span>
                Price: <strong className="text-zinc-900">₹200 — ₹{maxPrice}</strong>
              </span>
            </div>
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
          <ul className="space-y-2 text-xs font-semibold text-zinc-600 font-semibold tracking-wide">
            {(filterConfig?.colors || []).map((c: any) => {
              const colorName = typeof c === "string" ? c : c.name;
              const colorHex = typeof c === "object" ? c.hex : null;
              const checked = selectedColors.includes(colorName);
              return (
                <li key={colorName} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    id={`color-${colorName}`}
                    checked={checked}
                    onChange={() => toggleColor(colorName)}
                    className="w-4 h-4 rounded border-zinc-300 text-[#520618] focus:ring-[#520618]/20 cursor-pointer accent-[#520618]"
                  />
                  <label htmlFor={`color-${colorName}`} className="cursor-pointer select-none flex items-center gap-2">
                    {colorHex && (
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-zinc-300 shadow-2xs inline-block"
                        style={{ backgroundColor: colorHex }}
                      />
                    )}
                    <span>{colorName}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 4. Size Filter */}
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
            {(filterConfig?.sizes || []).map((s: any) => {
              const sizeVal = typeof s === "string" ? s : s.name || s.id;
              const checked = selectedSizes.includes(sizeVal);
              return (
                <button
                  key={sizeVal}
                  type="button"
                  onClick={() => toggleSize(sizeVal)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${checked
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                    : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                    }`}
                >
                  {sizeVal}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Rating Filter */}
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
            {[
              { stars: 5, count: 8 },
              { stars: 4, count: 14 },
              { stars: 3, count: 2 },
            ].map(({ stars, count }) => {
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
                          className={`w-3.5 h-3.5 fill-current ${i >= stars ? "text-zinc-300 fill-zinc-200" : ""
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

      {/* Reset Button */}
      {(selectedCategory ||
        selectedColors.length > 0 ||
        selectedSizes.length > 0 ||
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
              className="flex flex-row items-stretch overflow-x-auto scroll-smooth scrollbar-none select-none cursor-grab active:cursor-grabbing w-full px-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {shopCategories.map((cat) => {
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

                      {/* Title & Count */}
                      {/* <div className="mt-2.5 text-center w-full">
                        <h3
                          className={`text-xs sm:text-sm font-bold transition-colors leading-tight truncate ${active
                            ? "text-[#520618]"
                            : "text-zinc-900 group-hover:text-[#520618]"
                            }`}
                        >
                          {cat.name}
                        </h3>

                      </div> */}
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
      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-1">
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
                    p.images?.[0] ||
                    p.image ||
                    "https://m.media-amazon.com/images/I/71LtEuQjqXL._SL1500_.jpg";
                  const wishlisted = isWishlisted(String(p.id));
                  const discount = p.originalPrice
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    : 0;

                  return (
                    <div
                      key={p.id}
                      className="group bg-white rounded-2xl border border-zinc-200/80 p-2 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    >
                      {(() => {
                        const cartItem = cartItems.find((item) => String(item.productId) === String(p.id));
                        const itemQuantity = cartItem ? cartItem.quantity : 0;

                        return (
                          <>
                            <div>
                              {/* Image Frame & Badges with Smooth Right-to-Left Auto Slider on Hover */}
                              <Link
                                to={`/product/${p.id}`}
                                onClick={(e) => handleProductClick(e, p.id)}
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
                                    {p.labels?.bestSeller && (
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
                                      toggleWishlist(String(p.id));
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

                                <Link to={`/product/${p.id}`} onClick={(e) => handleProductClick(e, p.id)}>
                                  <h3 className="font-semibold text-zinc-900 text-sm line-clamp-1 group-hover:text-[#520618] transition-colors">
                                    {p.name}
                                  </h3>
                                </Link>

                                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                  <span className="text-zinc-800">{p.rating || 4.8}</span>
                                  <span className="text-zinc-400 font-normal text-[10px]">
                                    ({p.salesCount || 323})
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
                                <div
                                  className="w-full h-10 bg-black text-white text-sm font-medium px-3 rounded-xl shadow-md flex items-center justify-between"
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
                                    className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-colors font-black text-sm cursor-pointer active:scale-90"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-6 h-6 stroke-1" />
                                  </button>
                                  <span className="text-xs font-semibold px-2">{itemQuantity}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (cartItem) updateQuantity(cartItem.id, cartItem.quantity + 1);
                                    }}
                                    className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-colors font-black text-sm cursor-pointer active:scale-90"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-6 h-6 stroke-1" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    addToCart({
                                      productId: String(p.id),
                                      productName: p.name,
                                      brand: p.brand || "AOCIND",
                                      colorName: "Maroon",
                                      colorHex: "#800000",
                                      size: "Free Size",
                                      price: p.price,
                                      originalPrice: p.originalPrice || p.price,
                                      image: mainImg,
                                      sku: p.sku || "AOC-SKU",
                                      quantity: 1,
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
                    p.images?.[0] ||
                    p.image ||
                    "https://m.media-amazon.com/images/I/71LtEuQjqXL._SL1500_.jpg";
                  const wishlisted = isWishlisted(String(p.id));
                  const cartItem = cartItems.find((item) => String(item.productId) === String(p.id));
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
                        to={`/product/${p.id}`}
                        onClick={(e) => handleProductClick(e, p.id)}
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
                            toggleWishlist(String(p.id));
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

                        <Link to={`/product/${p.id}`} onClick={(e) => handleProductClick(e, p.id)}>
                          <h3 className="font-semibold text-zinc-900 text-xs sm:text-base line-clamp-1 group-hover:text-[#520618] transition-colors">
                            {p.name}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-1 text-amber-500 text-[11px] sm:text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-zinc-800">{p.rating || 4.8}</span>
                          <span className="text-zinc-400 font-normal text-[10px]">
                            ({p.salesCount || 323})
                          </span>
                        </div>

                        <p className="text-[11px] sm:text-xs text-zinc-500 line-clamp-1 sm:line-clamp-2 leading-relaxed font-medium">
                          {p.shortDescription || p.fullDescription || "Seamless wire-free contour bra for 360-degree all-day comfort."}
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
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (cartItem) updateQuantity(cartItem.id, cartItem.quantity + 1);
                                }}
                                className="w-5 h-5 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-colors font-black cursor-pointer active:scale-90"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                addToCart({
                                  productId: String(p.id),
                                  productName: p.name,
                                  brand: p.brand || "AOCIND",
                                  colorName: "Maroon",
                                  colorHex: "#800000",
                                  size: "Free Size",
                                  price: p.price,
                                  originalPrice: p.originalPrice || p.price,
                                  image: mainImg,
                                  sku: p.sku || "AOC-SKU",
                                  quantity: 1,
                                })
                              }
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
