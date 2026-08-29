import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  SlidersHorizontal,
  Grid3X3,
  Grid2X2,
  List as ListIcon,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Check,
  X,
  Search,
  Filter,
  ArrowLeft,
  Home,
  ChevronRight,
  Package,
} from "lucide-react";
import Navbar from "@/modules/core/components/Navbar";
import Footer from "@/modules/core/components/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/components/ui/select";
import ProductCard from "@/modules/home/components/ProductCard";
import { categories, collections, Category } from "@/data/catalog";
import {
  subscribeToProductStore,
  getLiveProductsList,
  fetchLiveProducts,
} from "@/modules/core/lib/apiStore";

export default function CollectionPage() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active Category State
  const activeSlug = (categorySlug || searchParams.get("category") || "all").toLowerCase();
  const selectedSub = searchParams.get("sub") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<string>("all");
  const [gridCols, setGridCols] = useState<number>(4); // 2, 3, or 4 on desktop
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Live products from store
  const [liveProducts, setLiveProducts] = useState(getLiveProductsList);

  useEffect(() => {
    fetchLiveProducts();
    const update = () => setLiveProducts([...getLiveProductsList()]);
    const unsub = subscribeToProductStore(update);
    return () => unsub();
  }, []);

  // Find category metadata
  const currentCategory: Category | undefined = useMemo(() => {
    if (activeSlug === "all") return undefined;
    return categories.find(
      (c) =>
        c.slug.toLowerCase() === activeSlug ||
        c.name.toLowerCase() === activeSlug ||
        c.name.toLowerCase().replace(/\s+/g, "-") === activeSlug
    );
  }, [activeSlug]);

  const categoryTitle = currentCategory ? currentCategory.name : activeSlug === "all" ? "All Handcrafted Collections" : activeSlug.replace(/-/g, " ").toUpperCase();
  const categoryImage = currentCategory ? currentCategory.image : "/images/hero_twirl_tradition.jpg";
  const subCategories = currentCategory?.subs || [];

  // Update document title for SEO
  useEffect(() => {
    document.title = `${categoryTitle} | Awesome Handmade Surat`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categoryTitle, activeSlug]);

  // Filtering products according to category, subcategory, search, stock, and price
  const filteredProducts = useMemo(() => {
    return liveProducts.filter((p: any) => {
      const pCat = (p.categorySlug || p.category || p.categoryName || "").toLowerCase();
      const pSub = (p.subCategory || "").toLowerCase();
      const pName = (p.name || "").toLowerCase();
      const pDesc = (p.shortDescription || p.description || p.fullDescription || "").toLowerCase();
      const pMaterial = (p.material || "").toLowerCase();

      // 1. Category Matching Logic
      if (activeSlug !== "all") {
        let matchesCategory = false;
        
        // Exact slug or name match
        if (pCat.includes(activeSlug) || activeSlug.includes(pCat)) {
          matchesCategory = true;
        }

        // Specific category keyword rules
        if (activeSlug === "latkan" && (pCat.includes("latkan") || pCat.includes("tassel") || pName.includes("latkan") || pDesc.includes("latkan"))) {
          matchesCategory = true;
        } else if (activeSlug === "necklace" && (pCat.includes("necklace") || pCat.includes("jewellery") || pName.includes("necklace") || pName.includes("choker") || pDesc.includes("necklace"))) {
          matchesCategory = true;
        } else if (activeSlug === "earrings" && (pCat.includes("earring") || pName.includes("earring") || pName.includes("jhumka") || pDesc.includes("earring"))) {
          matchesCategory = true;
        } else if (activeSlug === "choli" && (pCat.includes("choli") || pName.includes("choli") || pDesc.includes("choli") || pName.includes("lehenga"))) {
          matchesCategory = true;
        } else if (activeSlug === "gift-hamper" && (pCat.includes("gift") || pCat.includes("hamper") || pName.includes("hamper") || pName.includes("gift") || pName.includes("keychain"))) {
          matchesCategory = true;
        } else if (activeSlug === "tassel" && (pCat.includes("tassel") || pCat.includes("latkan") || pName.includes("tassel") || pDesc.includes("tassel"))) {
          matchesCategory = true;
        } else if (activeSlug === "bracelet" && (pCat.includes("bracelet") || pCat.includes("wrist") || pName.includes("bracelet") || pName.includes("wristband"))) {
          matchesCategory = true;
        } else if (activeSlug === "anklet" && (pCat.includes("anklet") || pCat.includes("payal") || pName.includes("anklet") || pName.includes("payal"))) {
          matchesCategory = true;
        } else if (activeSlug === "waist-belt" && (pCat.includes("waist") || pCat.includes("belt") || pName.includes("waist") || pName.includes("kamarbandh"))) {
          matchesCategory = true;
        } else if (activeSlug === "krishna-outfit" && (pCat.includes("krishna") || pName.includes("krishna") || pName.includes("gopal") || pName.includes("kanha"))) {
          matchesCategory = true;
        } else if (activeSlug === "watch" && (pCat.includes("watch") || pName.includes("watch"))) {
          matchesCategory = true;
        } else if (activeSlug === "macrame-hanging" && (pCat.includes("macrame") || pName.includes("macrame") || pDesc.includes("macrame") || pName.includes("hanging"))) {
          matchesCategory = true;
        } else if (activeSlug.includes("hair") && (pCat.includes("hair") || pName.includes("hair") || pName.includes("bow") || pName.includes("clip") || pName.includes("band"))) {
          matchesCategory = true;
        } else if (activeSlug.includes("ring") && (pCat.includes("ring") || pName.includes("ring"))) {
          matchesCategory = true;
        }

        if (!matchesCategory) return false;
      }

      // 2. Subcategory Matching Logic
      if (selectedSub !== "all") {
        const subSlug = selectedSub.toLowerCase();
        const matchesSub =
          pSub.includes(subSlug) ||
          pName.includes(subSlug.replace(/-/g, " ")) ||
          pDesc.includes(subSlug.replace(/-/g, " "));
        if (!matchesSub) return false;
      }

      // 3. Search Query Filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          pName.includes(q) ||
          pDesc.includes(q) ||
          pCat.includes(q) ||
          pMaterial.includes(q) ||
          String(p.sku || p.id).toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 4. In Stock Filter
      if (inStockOnly && p.inStock === false) {
        return false;
      }

      // 5. Price Range Filter
      if (priceRange === "under-499" && p.price > 499) return false;
      if (priceRange === "499-999" && (p.price < 499 || p.price > 999)) return false;
      if (priceRange === "above-999" && p.price < 1000) return false;

      return true;
    });
  }, [liveProducts, activeSlug, selectedSub, searchQuery, inStockOnly, priceRange]);

  // Sorting products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price-low") {
      return list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      return list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "newest") {
      return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }
    return list; // featured
  }, [filteredProducts, sortBy]);

  // Fallback recommendations if zero items found for newly added categories
  const fallbackRecommendations = useMemo(() => {
    if (sortedProducts.length === 0) {
      return liveProducts.slice(0, 8);
    }
    return [];
  }, [sortedProducts.length, liveProducts]);

  const handleSubCategoryClick = (subSlug: string) => {
    if (subSlug === "all") {
      searchParams.delete("sub");
    } else {
      searchParams.set("sub", subSlug);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-brand-ink flex flex-col selection:bg-brand-gold/30">
      <Navbar />

      {/* 1. Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="bg-[#FAF8F4] border-b border-[#EDE5DA] py-3 px-4 sm:px-6">
        <div className="max-w-[1500px] mx-auto flex items-center gap-2 text-xs text-brand-ink/70">
          <Link to="/" className="flex items-center gap-1 hover:text-brand-maroon transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-ink/40" />
          <Link to="/collections" className="hover:text-brand-maroon transition-colors">
            Collections
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-ink/40" />
          <span className="font-semibold text-brand-maroon uppercase tracking-wide truncate max-w-[200px] sm:max-w-none">
            {categoryTitle}
          </span>
          {selectedSub !== "all" && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-brand-ink/40" />
              <span className="font-medium text-brand-ink/80 capitalize">
                {selectedSub.replace(/-/g, " ")}
              </span>
            </>
          )}
        </div>
      </nav>

      {/* 2. Collection Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF6EF] to-[#FFFDF9] border-b border-[#EDE5DA] py-8 sm:py-12 md:py-16">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
            {/* Left Content */}
            <div className="max-w-2xl text-center md:text-left space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-maroon text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
                <span>100% Handcrafted in Surat</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-brand-maroon uppercase">
                {categoryTitle}
              </h1>
              <p className="text-sm sm:text-base text-brand-ink/80 font-light leading-relaxed max-w-xl">
                Explore our exquisite artisanal collection. Meticulously handcrafted by master artisans in Surat using authentic glass mirrors, pure resham silk threads, golden zari, and royal heritage techniques.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-brand-ink/70">
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" /> {sortedProducts.length} Artisan Designs
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck className="w-4 h-4 text-brand-gold" /> Free Shipping Above ₹999
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-brand-maroon" /> Authentic Craft Guarantee
                </span>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-[#EDE5DA] bg-white shrink-0 group">
              <img
                src={categoryImage}
                alt={categoryTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 text-white text-center text-xs font-bold uppercase tracking-wider bg-black/40 backdrop-blur-xs py-1 rounded-full border border-white/20">
                Artisan Edit
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Switcher Horizontal Ribbon */}
      <section className="bg-white border-b border-[#EDE5DA] py-4 overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-ink/60">
              Browse Other Collections
            </span>
            <Link
              to="/collections"
              className="text-xs font-bold text-brand-maroon hover:underline flex items-center gap-1"
            >
              View All ({categories.length}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-1">
            {/* All Collections button */}
            <Link
              to="/collections"
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold tracking-wide uppercase transition-all duration-200 ${
                activeSlug === "all"
                  ? "bg-brand-maroon text-white border-brand-maroon shadow-sm"
                  : "bg-[#FAF8F4] text-brand-ink/80 border-[#EDE5DA] hover:border-brand-maroon hover:text-brand-maroon"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>All ({liveProducts.length})</span>
            </Link>

            {/* 18 Categories pills */}
            {categories.map((cat) => {
              const isActive = activeSlug === cat.slug.toLowerCase();
              return (
                <Link
                  key={cat.slug}
                  to={`/collections/${cat.slug}`}
                  className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wide transition-all duration-200 uppercase ${
                    isActive
                      ? "bg-brand-maroon text-white border-brand-maroon shadow-sm"
                      : "bg-[#FAF8F4] text-brand-ink/80 border-[#EDE5DA] hover:border-brand-maroon hover:text-brand-maroon"
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-5 h-5 rounded-full object-cover border border-white/40"
                  />
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Subcategory Filter Tabs (If available) */}
      {subCategories.length > 0 && (
        <section className="bg-[#FAF8F4] border-b border-[#EDE5DA] py-3">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-brand-maroon uppercase tracking-wider shrink-0 mr-2">
                Subcategories:
              </span>
              <button
                type="button"
                onClick={() => handleSubCategoryClick("all")}
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                  selectedSub === "all"
                    ? "bg-brand-maroon text-white"
                    : "bg-white text-brand-ink/70 border border-[#EDE5DA] hover:border-brand-maroon"
                }`}
              >
                All {categoryTitle}
              </button>
              {subCategories.map((sub) => {
                const isSubActive = selectedSub === sub.slug;
                return (
                  <button
                    key={sub.slug}
                    type="button"
                    onClick={() => handleSubCategoryClick(sub.slug)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                      isSubActive
                        ? "bg-brand-maroon text-white"
                        : "bg-white text-brand-ink/70 border border-[#EDE5DA] hover:border-brand-maroon"
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. Main Catalog Content Area */}
      <section className="max-w-[1500px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Top Control Bar: Search, Filters, View Modes, Sorting */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-[#EDE5DA]">
          {/* Left: Search & Filter Trigger */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ink/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${categoryTitle}...`}
                className="w-full pl-9 pr-8 py-2 rounded-full border border-[#EDE5DA] bg-white text-xs text-brand-ink placeholder:text-brand-ink/40 focus:outline-none focus:border-brand-maroon transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-ink/40 hover:text-brand-maroon"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                isFilterDrawerOpen || inStockOnly || priceRange !== "all"
                  ? "bg-brand-maroon text-white border-brand-maroon"
                  : "bg-white text-brand-ink border-[#EDE5DA] hover:border-brand-maroon"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(inStockOnly || priceRange !== "all") && (
                <span className="w-2 h-2 rounded-full bg-brand-gold" />
              )}
            </button>
          </div>

          {/* Right: Item Count, Sort Dropdown & Layout Mode */}
          <div className="flex items-center justify-between md:justify-end gap-4">
            <span className="text-xs text-brand-ink/60 font-medium">
              Showing <strong className="text-brand-ink">{sortedProducts.length}</strong> items
            </span>

            <div className="flex items-center gap-2">
              {/* Sort selector */}
              <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
                <SelectTrigger className="h-9 w-[160px] bg-white border-[#EDE5DA] rounded-full px-3.5 text-xs font-semibold text-brand-ink focus:ring-0 focus:border-[#520618]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent align="end" className="min-w-[170px] bg-white border border-[#EDE5DA] shadow-xl rounded-xl">
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                </SelectContent>
              </Select>

              {/* Grid Column Switchers for Desktop */}
              <div className="hidden lg:flex items-center bg-[#FAF8F4] border border-[#EDE5DA] rounded-full p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setGridCols(2)}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    gridCols === 2 ? "bg-brand-maroon text-white" : "text-brand-ink/60 hover:text-brand-maroon"
                  }`}
                  aria-label="2 Columns"
                >
                  <Grid2X2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setGridCols(3)}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    gridCols === 3 ? "bg-brand-maroon text-white" : "text-brand-ink/60 hover:text-brand-maroon"
                  }`}
                  aria-label="3 Columns"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setGridCols(4)}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    gridCols === 4 ? "bg-brand-maroon text-white" : "text-brand-ink/60 hover:text-brand-maroon"
                  }`}
                  aria-label="4 Columns"
                >
                  <LayoutGridIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Filter Drawer Panel */}
        {isFilterDrawerOpen && (
          <div className="my-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#EDE5DA] shadow-sm animate-fade-slide-down">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE5DA]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-maroon flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-brand-gold" /> Filter Collection
              </h3>
              <button
                type="button"
                onClick={() => {
                  setInStockOnly(false);
                  setPriceRange("all");
                  setSearchQuery("");
                }}
                className="text-xs text-brand-maroon hover:underline font-semibold"
              >
                Reset All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {/* Price Filter */}
              <div>
                <label className="block text-xs font-bold text-brand-ink uppercase mb-2">Price Range</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "all", label: "All Prices" },
                    { id: "under-499", label: "Under ₹499" },
                    { id: "499-999", label: "₹499 - ₹999" },
                    { id: "above-999", label: "Above ₹999" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriceRange(p.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                        priceRange === p.id
                          ? "bg-brand-maroon text-white font-bold"
                          : "bg-[#FAF8F4] text-brand-ink/80 border border-[#EDE5DA] hover:border-brand-maroon"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-xs font-bold text-brand-ink uppercase mb-2">Availability</label>
                <button
                  type="button"
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    inStockOnly
                      ? "bg-brand-maroon text-white font-bold"
                      : "bg-[#FAF8F4] text-brand-ink/80 border border-[#EDE5DA] hover:border-brand-maroon"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${inStockOnly ? "bg-emerald-400" : "bg-gray-400"}`} />
                  In-Stock Items Only
                </button>
              </div>

              {/* Quick Navigation to Category */}
              <div>
                <label className="block text-xs font-bold text-brand-ink uppercase mb-2">Collection Category</label>
                <select
                  value={activeSlug}
                  onChange={(e) => navigate(e.target.value === "all" ? "/collections" : `/collections/${e.target.value}`)}
                  className="w-full bg-[#FAF8F4] border border-[#EDE5DA] rounded-xl px-3 py-2 text-xs font-medium text-brand-ink focus:outline-none focus:border-brand-maroon"
                >
                  <option value="all">All Collections ({liveProducts.length})</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 6. Product Grid */}
        {sortedProducts.length > 0 ? (
          <div
            className={`mt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 ${
              gridCols === 2
                ? "lg:grid-cols-2"
                : gridCols === 3
                ? "lg:grid-cols-3"
                : "lg:grid-cols-4"
            } gap-4 sm:gap-6`}
          >
            {sortedProducts.map((product: any) => (
              <div key={product.id} className="prod-card">
                <ProductCard p={product} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-brand-gold/15 text-brand-maroon flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-brand-maroon uppercase">
              Curating New Designs for {categoryTitle}
            </h3>
            <p className="text-xs sm:text-sm text-brand-ink/70">
              We are actively crafting more artisan pieces for this collection in Surat. Explore our popular handcrafted designs below or browse all collections.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPriceRange("all");
                  setInStockOnly(false);
                  if (selectedSub !== "all") handleSubCategoryClick("all");
                }}
                className="px-5 py-2.5 rounded-full bg-brand-maroon text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-ink transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <Link
                to="/collections"
                className="px-5 py-2.5 rounded-full bg-white border border-[#EDE5DA] text-brand-ink text-xs font-bold uppercase tracking-wider hover:border-brand-maroon transition-colors"
              >
                Browse All Collections
              </Link>
            </div>

            {/* Fallback Recommendations */}
            {fallbackRecommendations.length > 0 && (
              <div className="pt-12 text-left">
                <h4 className="font-heading text-lg font-bold text-brand-maroon uppercase tracking-wide mb-6 text-center">
                  Recommended Artisan Favorites
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {fallbackRecommendations.slice(0, 4).map((p: any) => (
                    <div key={p.id} className="prod-card">
                      <ProductCard p={p} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 7. Artisan Craft Story & Quality Promise */}
      <section className="bg-[#FAF8F4] border-t border-[#EDE5DA] py-12 sm:py-16 mt-12">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#EDE5DA] shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 fill-brand-gold" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-brand-maroon uppercase tracking-wider">
                  100% Handcrafted in Surat
                </h4>
                <p className="mt-1 text-xs text-brand-ink/70 leading-relaxed">
                  Every latkan, necklace, and accessory is meticulously hand-crafted by experienced artisans using authentic glass mirrors and fine zari threads.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#EDE5DA] shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-brand-maroon uppercase tracking-wider">
                  Insured Pan-India Delivery
                </h4>
                <p className="mt-1 text-xs text-brand-ink/70 leading-relaxed">
                  Packed in secure protective gift boxes with fast shipping directly from our Surat workshop to your doorstep across India.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#EDE5DA] shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-brand-maroon/10 text-brand-maroon flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-brand-maroon uppercase tracking-wider">
                  Easy Exchange & Support
                </h4>
                <p className="mt-1 text-xs text-brand-ink/70 leading-relaxed">
                  Dedicated customer support via WhatsApp and phone to assist you with customized bridal latkans and gift hampers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function LayoutGridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}
