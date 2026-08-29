import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Ruler,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  ShoppingBag,
  Eye,
} from "lucide-react";
import { useQuickView } from "../context/QuickViewContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { getLiveProductById, getLiveProductsList } from "@/modules/core/lib/apiStore";
import { ProductDetails, ProductColorVariation } from "../types/product";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/components/ui/select";

export const DesktopProductQuickViewModal: React.FC = () => {
  const { isOpen, activeProductId, closeQuickView, openQuickView } = useQuickView();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  // Synchronous product resolution via useMemo so product is available on the first render frame
  const product = useMemo(() => {
    if (!activeProductId) return null;
    return getLiveProductById(String(activeProductId));
  }, [activeProductId]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("S");
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const modalRef = useRef<HTMLDivElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active thumbnail into view when activeImageIndex changes
  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const activeChild = thumbnailContainerRef.current.children[activeImageIndex] as HTMLElement;
      if (activeChild) {
        activeChild.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeImageIndex]);

  // Sync variations & related products when active product changes
  useEffect(() => {
    if (product && isOpen) {
      const firstColor =
        product.colors?.[0]?.colorName ||
        product.variations?.[0]?.colorName ||
        "BLACK";
      const firstSize =
        product.colors?.[0]?.sizes?.[0] ||
        product.variations?.[0]?.size ||
        product.availableSizes?.[0] ||
        "S";

      setSelectedColor(firstColor);
      setSelectedSize(firstSize);
      setActiveImageIndex(0);
      setQuantity(1);
      setIsDescriptionExpanded(false);

      // Filter related products ACCORDING to active product category/type/brand
      const all = getLiveProductsList();
      const currentCatStr = String(
        (product as any).category || (product as any).type || product.brand || ""
      ).toLowerCase();
      const currentTags: string[] = Array.isArray((product as any).tags)
        ? (product as any).tags.map((t: string) => String(t).toLowerCase())
        : [];

      const matched = all.filter((p) => {
        if (String(p.id) === String(activeProductId)) return false;
        const pCat = String((p as any).category || (p as any).type || p.brand || "").toLowerCase();
        const pTags = Array.isArray((p as any).tags)
          ? (p as any).tags.map((t: string) => String(t).toLowerCase())
          : [];

        if (currentCatStr && pCat && (pCat.includes(currentCatStr) || currentCatStr.includes(pCat))) return true;
        if (currentTags.some((t) => pTags.includes(t))) return true;
        return false;
      });

      let finalRelated = matched;
      if (finalRelated.length < 8) {
        const rest = all.filter(
          (p) =>
            String(p.id) !== String(activeProductId) &&
            !finalRelated.some((m) => String(m.id) === String(p.id))
        );
        finalRelated = [...finalRelated, ...rest];
      }

      setRelatedProducts(finalRelated.slice(0, 8));
    }
  }, [activeProductId, isOpen]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeQuickView();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeQuickView]);

  // Available Colors list with thumbnails & prices
  const colorVariantsList = useMemo(() => {
    if (!product) return [];

    if (product.colors && product.colors.length > 0) {
      return product.colors.map((c: any) => {
        const cColName = typeof c === "string" ? c : (c?.colorName || c?.name || c?.color || "Standard");
        const matchingVar = (product.variations || []).find(
          (v: any) => (v?.colorName || v?.color || "").toLowerCase() === cColName.toLowerCase()
        );
        return {
          colorName: cColName,
          colorHex: c?.colorHex || c?.hex || "#000000",
          image: c?.displayImage || c?.mainImage || c?.galleryImages?.[0] || (product as any).image || (product as any).mainImage || "/images/category/Latkan.webp",
          price: matchingVar?.price || (product as any).price || 499,
          originalPrice: matchingVar?.originalPrice || (product as any).originalPrice || 1500,
          stock: matchingVar?.stock || 24,
        };
      });
    }

    if (product.variations && product.variations.length > 0) {
      const uniqueColors = Array.from(
        new Set(product.variations.map((v: any) => v?.colorName || v?.color).filter(Boolean))
      );
      return uniqueColors.map((cName: any) => {
        const v = product.variations!.find((item: any) => (item?.colorName || item?.color) === cName) || {};
        return {
          colorName: String(cName),
          colorHex: (v as any).colorHex || "#000000",
          image: (v as any).thumbnail || (v as any).image || (product as any).image || (product as any).mainImage || "/images/category/Latkan.webp",
          price: (v as any).price || (product as any).price || 499,
          originalPrice: (v as any).originalPrice || (product as any).originalPrice || 1500,
          stock: (v as any).stock || 24,
        };
      });
    }

    return [
      {
        colorName: selectedColor || "Standard",
        colorHex: "#000000",
        image: (product as any)?.image || (product as any)?.mainImage || "/images/category/Latkan.webp",
        price: (product as any)?.price || 499,
        originalPrice: (product as any)?.originalPrice || 1500,
        stock: 24,
      },
    ];
  }, [product, selectedColor]);

  // Active variation details
  const activeVariation: ProductColorVariation = useMemo(() => {
    if (!product) {
      return {
        id: "v-default",
        colorName: "DEFAULT",
        colorHex: "#000000",
        size: "S",
        thumbnail: "",
        price: 499,
        originalPrice: 1500,
        discountPercentage: 67,
        sku: "AH-SKU-100",
        stock: 24,
        images: [],
      };
    }

    const exactMatch = (product.variations || []).find(
      (v: any) =>
        v &&
        (v.colorName || v.color || "").toLowerCase() === (selectedColor || "").toLowerCase() &&
        (((v.size || "").toLowerCase() === (selectedSize || "").toLowerCase()) ||
          ((v.sizeName || "").toLowerCase() === (selectedSize || "").toLowerCase()))
    );

    if (exactMatch) return exactMatch;

    const colorMatch = (product.variations || []).find(
      (v: any) => v && (v.colorName || v.color || "").toLowerCase() === (selectedColor || "").toLowerCase()
    );

    if (colorMatch) return colorMatch;

    const activeColorObj = colorVariantsList.find(
      (c) => (c?.colorName || "").toLowerCase() === (selectedColor || "").toLowerCase()
    );

    return {
      id: `v-${selectedColor}-${selectedSize}`,
      colorName: selectedColor || "Standard",
      colorHex: activeColorObj?.colorHex || "#000000",
      size: selectedSize,
      thumbnail: activeColorObj?.image || (product as any).image || (product as any).mainImage || "/images/category/Latkan.webp",
      price: activeColorObj?.price || (product as any).price || 499,
      originalPrice: activeColorObj?.originalPrice || (product as any).originalPrice || 1500,
      discountPercentage: 67,
      sku: product.defaultSku || `AH-${(selectedColor || "STD").toUpperCase()}-${selectedSize}`,
      stock: activeColorObj?.stock || 24,
      images: [],
    };
  }, [product, selectedColor, selectedSize, colorVariantsList]);

  // Available Sizes List
  const availableSizesList = useMemo(() => {
    if (!product) return ["XS", "S", "M", "L", "XL", "XXL"];
    let rawSizes: any[] = [];
    if (product.availableSizes && Array.isArray(product.availableSizes) && product.availableSizes.length > 0) {
      rawSizes = product.availableSizes;
    } else {
      const activeColorObj = (product.colors || []).find(
        (c: any) => (c?.colorName || c?.name || c?.color || "").toLowerCase() === (selectedColor || "").toLowerCase()
      );
      if (activeColorObj?.sizes && Array.isArray(activeColorObj.sizes) && activeColorObj.sizes.length > 0) {
        rawSizes = activeColorObj.sizes;
      } else if (product.variations && product.variations.length > 0) {
        rawSizes = product.variations.map((v: any) => v?.size || v?.sizeName).filter(Boolean);
      }
    }

    const cleaned = Array.from(new Set(rawSizes.map((s) => String(s || "").trim()).filter(Boolean)));
    return cleaned.length > 0 ? cleaned : ["XS", "S", "M", "L", "XL", "XXL"];
  }, [product, selectedColor]);

  // Gallery Images List
  const galleryImages = useMemo(() => {
    const activeColorObj = (product?.colors || []).find(
      (c: any) => (c?.colorName || c?.name || c?.color || "").toLowerCase() === (selectedColor || "").toLowerCase()
    );

    if (activeColorObj && activeColorObj.galleryImages && activeColorObj.galleryImages.length > 0) {
      return activeColorObj.galleryImages.map((gUrl: string, idx: number) => ({
        id: `img-color-${idx}`,
        url: gUrl,
        alt: `${product?.name} - ${selectedColor} View ${idx + 1}`,
      }));
    }

    if (activeVariation.images && activeVariation.images.length > 0) {
      return activeVariation.images;
    }

    if (product && Array.isArray((product as any).images) && (product as any).images.length > 0) {
      return (product as any).images.map((url: any, i: number) => ({
        id: `img-fallback-${i}`,
        url: typeof url === "string" ? url : url?.url || "",
        alt: product.name,
      }));
    }

    return [
      {
        id: "img-default",
        url:
          activeVariation.thumbnail ||
          (product as any)?.image ||
          (product as any)?.mainImage ||
          "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=800",
        alt: product?.name || "Product Image",
      },
    ];
  }, [product, selectedColor, activeVariation]);

  const currentImage = galleryImages[activeImageIndex] || galleryImages[0];

  const livePrice = activeVariation.price;
  const originalPrice = activeVariation.originalPrice || Math.round(livePrice * 2.5);
  const totalPrice = livePrice * quantity;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      productId: String(product.id),
      productName: product.name,
      brand: product.brand || "Awesome Handmade",
      colorName: selectedColor,
      colorHex: activeVariation.colorHex || "#C89B3C",
      size: selectedSize,
      price: livePrice,
      originalPrice: originalPrice,
      image: currentImage.url,
      sku: activeVariation.sku || product.defaultSku || "AWH-SKU",
      quantity: quantity,
    });
    toast.success(`Added ${quantity} x ${product.name} (${selectedColor}, ${selectedSize}) to Bag!`);
    closeQuickView();
  };

  const handleShare = () => {
    if (navigator.share && product) {
      navigator
        .share({
          title: product.name,
          text: `Check out ${product.name} on Awesome Handmade!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied!");
    }
  };

  // Only render on tablet and laptop screens (>= 768px)
  if (typeof window !== "undefined" && window.innerWidth < 768) {
    return null;
  }

  if (!product) {
    return null;
  }

  const wishlisted = isWishlisted(String(product.id));
  const productCategory = (product as any).category || (product as any).type || product.brand || "Handmade";

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div key="desktop-qv-overlay-wrapper" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            {/* Dark Glassmorphism Backdrop Overlay */}
            <motion.div
              key="desktop-qv-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeQuickView}
              className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity z-0"
            />

            {/* MAIN MODAL POPUP DIALOG */}
            <motion.div
              key={`desktop-qv-dialog-${product.id}`}
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative z-10 w-full max-w-5xl bg-zinc-50 rounded-3xl shadow-2xl overflow-hidden border border-white/20 max-h-[90vh] flex flex-col font-sans my-auto pointer-events-auto"
            >
              {/* Top Header Bar with Close Button */}
              <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200/80 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-700">
                    {productCategory}
                  </span>
                  <span className="text-xs font-mono font-semibold text-zinc-400">
                    SKU: {activeVariation.sku}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share"
                    className="p-2 rounded-full text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={closeQuickView}
                    aria-label="Close modal"
                    className="p-2 rounded-full text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* MODAL BODY (Grid: Gallery Left + Details Right) */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 bg-zinc-50">
                {/* LEFT COLUMN: HERO IMAGE GALLERY (5 Cols) */}
                <div className="md:col-span-6 lg:col-span-5 space-y-4">
                  {/* Hero Main Image Frame */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-white shadow-sm flex items-center justify-center group">
                    <motion.img
                      key={currentImage.url}
                      initial={{ opacity: 0.7, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      src={currentImage.url}
                      alt={currentImage.alt || product.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Top Right Wishlist Floating Icon */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(String(product.id))}
                      aria-label="Wishlist"
                      className={`absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center border border-zinc-200/80 shadow-md transition-all active:scale-90 cursor-pointer z-10 ${
                        wishlisted ? "text-rose-500" : "text-zinc-700 hover:text-black"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${wishlisted ? "fill-current" : ""}`} />
                    </button>

                    {/* Left/Right Carousel Nav Arrows with Infinite Loop */}
                    {galleryImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) =>
                              prev === 0 ? galleryImages.length - 1 : prev - 1
                            );
                          }}
                          aria-label="Previous image"
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-zinc-800 border border-zinc-200/80 flex items-center justify-center shadow-md transition-all cursor-pointer z-20 hover:bg-black hover:text-white active:scale-90"
                        >
                          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) =>
                              prev === galleryImages.length - 1 ? 0 : prev + 1
                            );
                          }}
                          aria-label="Next image"
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-zinc-800 border border-zinc-200/80 flex items-center justify-center shadow-md transition-all cursor-pointer z-20 hover:bg-black hover:text-white active:scale-90"
                        >
                          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Gallery Thumbnails List */}
                  {galleryImages.length > 1 && (
                    <div
                      ref={thumbnailContainerRef}
                      className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 scroll-smooth"
                    >
                      {galleryImages.map((img: any, idx: number) => (
                        <button
                          key={`thumb-${img.id || img.url || idx}-${idx}`}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-white shrink-0 transition-all cursor-pointer ${
                            activeImageIndex === idx
                              ? "border-black shadow-md"
                              : "border-zinc-200 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-200/80 text-center">
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white border border-zinc-200/60 shadow-2xs">
                      <Truck className="w-4 h-4 text-zinc-700" />
                      <span className="text-[10px] font-semibold text-zinc-800">Free Express Shipping</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white border border-zinc-200/60 shadow-2xs">
                      <RotateCcw className="w-4 h-4 text-zinc-700" />
                      <span className="text-[10px] font-semibold text-zinc-800">14-Day Easy Returns</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white border border-zinc-200/60 shadow-2xs">
                      <ShieldCheck className="w-4 h-4 text-zinc-700" />
                      <span className="text-[10px] font-semibold text-zinc-800">100% Authentic Product</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: PRODUCT DETAILS & PURCHASING OPTIONS (7 Cols) */}
                <div className="md:col-span-6 lg:col-span-7 space-y-5">
                  {/* Product Title & Ratings */}
                  <div className="bg-white rounded-2xl p-5 border border-zinc-200/60 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                        In Stock ({activeVariation.stock || 24} units)
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{product.rating || 4.8}</span>
                        <span className="text-zinc-400 font-normal">({product.reviewCount || 128} reviews)</span>
                      </div>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 leading-snug">
                      {product.name}
                    </h1>

                    <div className="flex items-baseline gap-3 pt-1">
                      <span className="text-2xl font-extrabold text-zinc-900">₹{livePrice}</span>
                      <span className="text-sm text-zinc-400 line-through font-semibold">
                        ₹{originalPrice}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Save {Math.round(((originalPrice - livePrice) / originalPrice) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Color Variations Section */}
                  <div className="bg-white rounded-2xl p-5 border border-zinc-200/60 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                        Color Variant: <span className="text-black font-extrabold">{selectedColor}</span>
                      </span>
                    </div>

                    <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1">
                      {colorVariantsList.map((cObj, idx) => {
                        const isSelected = cObj.colorName.toLowerCase() === selectedColor.toLowerCase();
                        return (
                          <button
                            key={`color-${cObj.colorName}-${idx}`}
                            type="button"
                            onClick={() => {
                              setSelectedColor(cObj.colorName);
                              setActiveImageIndex(0);
                            }}
                            className={`w-28 rounded-2xl p-1.5 border-2 bg-white flex flex-col justify-between shrink-0 transition-all cursor-pointer ${
                              isSelected
                                ? "border-black shadow-md ring-1 ring-black/10"
                                : "border-zinc-200 hover:border-zinc-300"
                            }`}
                          >
                            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-100 mb-1.5">
                              <img src={cObj.image} alt={cObj.colorName} className="w-full h-full object-cover" />
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shadow-md">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <div className="text-left space-y-0.5">
                              <span className="text-xs font-semibold text-zinc-900 block truncate">
                                {cObj.colorName}
                              </span>
                              <span className="text-xs font-bold text-zinc-900 block">
                                ₹{cObj.price}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selection Section with Shadcn UI Select Dropdown */}
                  <div className="bg-white rounded-2xl p-5 border border-zinc-200/60 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                        <Ruler className="w-4 h-4 text-zinc-700" />
                        Select Size
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSizeChartOpen(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 underline cursor-pointer hover:text-[#520618]"
                      >
                        <Ruler className="w-3.5 h-3.5 text-[#520618]" />
                        <span>Size Guide</span>
                      </button>
                    </div>

                    {/* Shadcn UI Dropdown Component */}
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger className="w-full h-11 bg-zinc-50 border-zinc-300">
                        <SelectValue placeholder="Choose a size" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSizesList.map((sz, idx) => (
                          <SelectItem key={`sel-size-${sz}-${idx}`} value={sz}>
                            Size {sz} — In Stock (₹{livePrice})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Size Quick Select Pills */}
                    <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
                      {availableSizesList.map((sz, idx) => (
                        <button
                          key={`pill-size-${sz}-${idx}`}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            selectedSize === sz
                              ? "bg-black text-white border-black shadow-xs"
                              : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Product Description Card */}
                  <div className="bg-white rounded-2xl p-5 border border-zinc-200/60 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-black" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                          Product Description & Details
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                        className="text-xs font-semibold text-[#520618] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isDescriptionExpanded ? "Show Less" : "Read More"}</span>
                        {isDescriptionExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                      {product.shortDescription ||
                        "Ultra-breathable wireless support bra engineered for all-day comfort with cloud-like soft microfiber padding and dynamic moisture-wicking technology."}
                    </p>

                    <AnimatePresence>
                      {isDescriptionExpanded && (
                        <motion.div
                          key="desktop-qv-expanded-desc"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="space-y-3 pt-2 overflow-hidden border-t border-zinc-100"
                        >
                          {(product.fullDescription || product.extendedDetails?.description) && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-zinc-800 uppercase tracking-wider block">
                                Overview
                              </span>
                              <p className="text-xs text-zinc-600 leading-relaxed">
                                {product.fullDescription || product.extendedDetails?.description}
                              </p>
                            </div>
                          )}

                          {product.highlights && product.highlights.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[11px] font-bold text-zinc-800 uppercase tracking-wider block">
                                Key Features
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {product.highlights.map((h, i) => (
                                  <div key={`highlight-${i}`} className="flex items-start gap-2 text-xs text-zinc-700">
                                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                                    <span>
                                      <strong className="font-semibold text-zinc-900">{h.label}:</strong>{" "}
                                      {h.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/70 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                              <Sparkles className="w-3.5 h-3.5 text-[#520618]" />
                              <span>Material & Care Instructions</span>
                            </div>
                            <p className="text-[11px] text-zinc-600 leading-normal">
                              {product.extendedDetails?.materialDetails ||
                                "90% Microfiber Nylon, 10% Elastane. Hand wash cold, line dry. Do not iron or dry clean."}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sticky Action Footer inside right column */}
                  <div className="flex items-center gap-3 pt-2">
                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between border border-zinc-300 bg-white rounded-xl py-2.5 px-3 min-w-[110px] text-zinc-900 font-semibold shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-7 h-7 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 rounded-lg active:scale-90 cursor-pointer transition-colors"
                      >
                        <Minus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                      <span className="text-sm font-bold text-zinc-900 px-2">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-7 h-7 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 rounded-lg active:scale-90 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Primary Add to Bag Button */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex-1 bg-black hover:bg-zinc-900 text-white text-sm font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add To Bag — ₹{totalPrice}</span>
                    </button>
                  </div>

                  {/* RELATED PRODUCTS SECTION (Filtered according to Active Product Category) */}
                  {relatedProducts.length > 0 && (
                    <div className="bg-white rounded-2xl p-4 border border-zinc-200/60 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-[#520618]" />
                          Related Products
                        </h3>
                        <span className="text-[10px] font-semibold text-[#520618] bg-[#520618]/10 px-2 py-0.5 rounded-full">
                          {productCategory}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 overflow-x-auto pt-1 pb-1 scrollbar-none snap-x">
                        {relatedProducts.map((relP, rIdx) => {
                          const relImg =
                            relP.images?.[0] ||
                            relP.image ||
                            "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=400";
                          const relOriginalPrice = relP.originalPrice || Math.round((relP.price || 499) * 1.5);
                          const discount = Math.round(((relOriginalPrice - (relP.price || 499)) / relOriginalPrice) * 100);

                          return (
                            <button
                              key={`rel-prod-${relP.id || rIdx}-${rIdx}`}
                              type="button"
                              onClick={() => openQuickView(relP.id)}
                              className="w-40 bg-zinc-50 hover:bg-zinc-100/90 rounded-xl border border-zinc-200/80 p-2 flex flex-col gap-2 text-left transition-all cursor-pointer group shrink-0 snap-start active:scale-95"
                            >
                              <div className="w-full aspect-square rounded-lg overflow-hidden bg-zinc-200 shrink-0 relative">
                                <img
                                  src={relImg}
                                  alt={relP.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {discount > 0 && (
                                  <span className="absolute top-1 left-1 bg-[#520618] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-2xs">
                                    -{discount}%
                                  </span>
                                )}
                              </div>
                              <div className="w-full space-y-0.5 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-semibold text-[#798A7A] truncate">
                                    {relP.category || relP.type || "Lingerie"}
                                  </span>
                                  <div className="flex items-center gap-0.5 text-[9px] font-semibold text-amber-600">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                    <span>{relP.rating || 4.8}</span>
                                  </div>
                                </div>
                                <h4 className="text-xs font-semibold text-zinc-900 line-clamp-1 group-hover:text-[#520618] transition-colors">
                                  {relP.name}
                                </h4>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-xs font-bold text-zinc-900">
                                    ₹{relP.price || 499}
                                  </span>
                                  {relOriginalPrice > (relP.price || 499) && (
                                    <span className="text-[10px] text-zinc-400 line-through font-medium">
                                      ₹{relOriginalPrice}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIZE CHART GUIDE MODAL (z-[10000] to sit above z-[9999] modal dialog) */}
      <AnimatePresence>
        {isSizeChartOpen && (
          <div key="size-chart-modal-wrapper" className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              key="size-chart-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsSizeChartOpen(false);
              }}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs z-0"
            />

            {/* Modal Dialog Content */}
            <motion.div
              key="size-chart-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto pointer-events-auto"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-[#520618]" />
                  <h3 className="text-base font-bold text-zinc-900">
                    Awesome Handmade Size Guide
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSizeChartOpen(false);
                  }}
                  className="p-1 text-zinc-400 hover:text-black rounded-full hover:bg-zinc-100 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-zinc-500 font-medium">
                  Measure around the fullest part of your bust while keeping the tape comfortably horizontal.
                </p>

                <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-100 text-zinc-900 font-semibold">
                      <tr>
                        <th className="p-2.5 border-b border-zinc-200">Size</th>
                        <th className="p-2.5 border-b border-zinc-200">Bust (Inches)</th>
                        <th className="p-2.5 border-b border-zinc-200">Underbust</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                      <tr>
                        <td className="p-2.5 font-bold text-zinc-900">XS</td>
                        <td className="p-2.5">30" – 32"</td>
                        <td className="p-2.5">26" – 28"</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-zinc-900">S</td>
                        <td className="p-2.5">32" – 34"</td>
                        <td className="p-2.5">28" – 30"</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-zinc-900">M</td>
                        <td className="p-2.5">34" – 36"</td>
                        <td className="p-2.5">30" – 32"</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-zinc-900">L</td>
                        <td className="p-2.5">36" – 38"</td>
                        <td className="p-2.5">32" – 34"</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-zinc-900">XL</td>
                        <td className="p-2.5">38" – 40"</td>
                        <td className="p-2.5">34" – 36"</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-zinc-900">XXL</td>
                        <td className="p-2.5">40" – 42"</td>
                        <td className="p-2.5">36" – 38"</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSizeChartOpen(false);
                }}
                className="w-full py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Close Size Guide
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DesktopProductQuickViewModal;
