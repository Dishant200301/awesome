import React, { useState, useEffect, useMemo, useRef } from "react";
import { Drawer } from "vaul";
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

export const MobileProductQuickViewSheet: React.FC = () => {
  const { isOpen, activeProductId, closeQuickView, openQuickView } = useQuickView();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  // Active Product State
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("S");
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const contentRef = useRef<HTMLDivElement>(null);
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

  // Sync state when active product changes
  useEffect(() => {
    if (activeProductId && isOpen) {
      const live = getLiveProductById(String(activeProductId));
      setProduct(live);

      const firstColor =
        live.colors?.[0]?.colorName ||
        live.variations?.[0]?.colorName ||
        "BLACK";
      const firstSize =
        live.colors?.[0]?.sizes?.[0] ||
        live.variations?.[0]?.size ||
        live.availableSizes?.[0] ||
        "S";

      setSelectedColor(firstColor);
      setSelectedSize(firstSize);
      setActiveImageIndex(0);
      setQuantity(1);
      setIsDescriptionExpanded(false);

      // Filter related products ACCORDING to active product category/type/brand
      const all = getLiveProductsList();
      const currentCatStr = String(
        (live as any).category || (live as any).type || live.brand || ""
      ).toLowerCase();
      const currentTags: string[] = Array.isArray((live as any).tags)
        ? (live as any).tags.map((t: string) => String(t).toLowerCase())
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

      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  }, [activeProductId, isOpen]);

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
        .catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied!");
    }
  };

  // Only render on mobile screens (< 768px)
  if (!product || !isOpen || (typeof window !== "undefined" && window.innerWidth >= 768)) {
    return null;
  }

  const wishlisted = isWishlisted(String(product.id));
  const productCategory = (product as any).category || (product as any).type || product.brand || "Handmade";

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && closeQuickView()} shouldScaleBackground={false}>
      <Drawer.Portal>
        {/* Dark Backdrop Overlay */}
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 sm:hidden" />

        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 h-[88vh] max-h-[90vh] flex flex-col outline-none font-sans overflow-hidden max-w-full sm:hidden rounded-t-[24px] bg-white shadow-2xl">
          {/* TOP DRAG HANDLE BAR */}
          <div className="py-2.5 flex justify-center items-center shrink-0 bg-white cursor-grab active:cursor-grabbing">
            <div className="w-10 h-1.5 rounded-full bg-zinc-300" />
          </div>

          {/* MAIN SCROLLABLE CONTENT BODY */}
          <div
            ref={contentRef}
            data-vaul-no-drag
            className="flex-1 overflow-y-auto overscroll-contain overflow-x-hidden px-3 pb-6 text-zinc-900 space-y-4 max-w-full box-border bg-white"
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
          >
            {/* 1. HERO PRODUCT IMAGE GALLERY CONTAINER */}
            <div className="bg-white rounded-2xl max-w-full overflow-hidden">
              <div className="relative aspect-[3/4] sm:aspect-[4/3] max-h-[44vh] w-full rounded-2xl overflow-hidden touch-pan-y select-none flex items-center justify-center mx-auto text-center">
                <motion.img
                  key={currentImage.url}
                  initial={{ opacity: 0.5, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.5 }}
                  transition={{ duration: 0.2 }}
                  drag="x"
                  dragPropagation={true}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, { offset }) => {
                    const swipe = offset.x;
                    if (swipe < -40 && galleryImages.length > 1) {
                      setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
                    } else if (swipe > 40 && galleryImages.length > 1) {
                      setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
                    }
                  }}
                  src={currentImage.url}
                  alt={currentImage.alt || product.name}
                  className="w-full h-full object-cover block touch-pan-y"
                />

                {/* Top Right Floating Action Buttons: Wishlist & Share */}
                <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(String(product.id))}
                    aria-label="Wishlist"
                    className={`w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center border border-zinc-200/80 transition-transform active:scale-90 cursor-pointer ${wishlisted ? "text-rose-500" : "text-zinc-700 hover:text-black"
                      }`}
                  >
                    <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share product"
                    className="w-8 h-8 rounded-full bg-white/95 text-zinc-700 hover:text-black backdrop-blur-md flex items-center justify-center border border-zinc-200/80 transition-transform active:scale-90 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Left/Right Navigation Arrows with Infinite Loop */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveImageIndex((prev) =>
                          prev === 0 ? galleryImages.length - 1 : prev - 1
                        );
                      }}
                      aria-label="Previous image"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-zinc-800 flex items-center justify-center cursor-pointer z-20 shadow-md hover:bg-black hover:text-white transition-all active:scale-90"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveImageIndex((prev) =>
                          prev === galleryImages.length - 1 ? 0 : prev + 1
                        );
                      }}
                      aria-label="Next image"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-zinc-800 flex items-center justify-center cursor-pointer z-20 shadow-md hover:bg-black hover:text-white transition-all active:scale-90"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Horizontal Scrollable Thumbnail Gallery */}
              {galleryImages.length > 1 && (
                <div
                  ref={thumbnailContainerRef}
                  className="flex items-center gap-2 pt-2.5 overflow-x-auto no-scrollbar max-w-full scroll-smooth"
                >
                  {galleryImages.map((img: any, idx: number) => (
                    <button
                      key={`mob-thumb-${img.id || img.url || idx}-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${activeImageIndex === idx
                        ? "border-[1px] border-black"
                        : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. PRODUCT HEADER CARD */}
            <div className="bg-white rounded-2xl p-3  space-y-2 max-w-full overflow-hidden">


              <h2 className="text-base sm:text-lg font-semibold text-zinc-900 leading-snug">
                {product.name}
              </h2>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-lg font-semibold text-zinc-900">₹{livePrice}</span>
                <span className="text-xs text-zinc-400 line-through font-semibold">
                  ₹{originalPrice}
                </span>
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-white px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating || 4.8}</span>
                  <span className="text-zinc-400 font-normal">({product.reviewCount || 128})</span>
                </div>
              </div>
            </div>

          {/* 3. PRODUCT DESCRIPTION & SPECIFICATIONS CARD */}
          <div className="bg-white rounded-2xl px-2 space-y-3 max-w-full overflow-hidden">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-black" />
                <h3 className="text-xs font-semibold  tracking-wider text-zinc-900">
                  Product Description
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                className="text-xs font-semibold text-[#520618] hover:underline flex items-center gap-1 cursor-pointer"
              >

                {isDescriptionExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Short Description */}
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              {product.shortDescription ||
                "Ultra-breathable wireless support bra engineered for all-day comfort with cloud-like soft microfiber padding and dynamic moisture-wicking technology."}
            </p>

            {/* Expandable Full Description & Key Specs */}
            <AnimatePresence>
              {isDescriptionExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3 pt-2 overflow-hidden border-t border-zinc-100"
                >
                  {/* Full Description text */}
                  {(product.fullDescription || product.extendedDetails?.description) && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-zinc-800  tracking-wider block">
                        Overview
                      </span>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {product.fullDescription || product.extendedDetails?.description}
                      </p>
                    </div>
                  )}

                  {/* Highlights / Features list */}
                  {product.highlights && product.highlights.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-zinc-800  tracking-wider block">
                        Key Features
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {product.highlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-zinc-700">
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

                  {/* Care & Material info */}
                  <div className="bg-white rounded-xl p-3 border border-zinc-200/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
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

          {/* 4. COLOR VARIANTS CARD */}
            <div className="bg-white rounded-2xl px-2 space-y-3 max-w-full overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900">
                  Colour: <span className="text-black font-semibold">{selectedColor}</span>
                </span>
              </div>

              {/* Color Cards Horizontal Scroll Row */}
              <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1 max-w-full">
                {colorVariantsList.map((cObj, idx) => {
                  const isSelected = cObj.colorName.toLowerCase() === selectedColor.toLowerCase();
                  return (
                    <button
                      key={`mob-color-${cObj.colorName}-${idx}`}
                      type="button"
                      onClick={() => {
                        setSelectedColor(cObj.colorName);
                        setActiveImageIndex(0);
                      }}
                      className={`w-28 sm:w-32 rounded-xl p-1 border-2 bg-white flex flex-col justify-between shrink-0 transition-all cursor-pointer ${isSelected
                        ? "border-[1px] border-black shadow-md ring-1 ring-black/10"
                        : "border-zinc-200 hover:border-zinc-300"
                        }`}
                    >
                      {/* Thumbnail Image + Active Checkmark Badge */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-zinc-100 mb-2">
                        <img
                          src={cObj.image}
                          alt={cObj.colorName}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Color Title & Price */}
                      <div className="text-left space-y-0.5">
                        <span className="text-xs font-semibold text-zinc-900 block truncate">
                          {cObj.colorName}
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs font-semibold text-zinc-900">
                            ₹{cObj.price}
                          </span>
                          <span className="text-[10px] text-zinc-400 line-through font-semibold">
                            ₹{cObj.originalPrice}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. SIZE SELECTION WITH SHADCN UI DROPDOWN LIBRARY */}
            <div className="bg-white rounded-2xl px-2 space-y-3 max-w-full overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-zinc-900 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-zinc-700" />
                  Select Size
                </span>
                <span className="text-[11px] font-mono font-semibold text-zinc-400">
                  SKU: {activeVariation.sku}
                </span>
              </div>

              {/* Shadcn UI Dropdown Component */}
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a size" />
                </SelectTrigger>
                <SelectContent>
                  {availableSizesList.map((sz, idx) => (
                    <SelectItem key={`mob-sel-size-${sz}-${idx}`} value={sz}>
                      Size {sz} — In Stock (₹{livePrice})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Size Quick Select Pills & Chart Trigger */}
              <div className="pt-1 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSizeChartOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 underline shrink-0 cursor-pointer hover:text-[#520618]"
                >
                  <Ruler className="w-3.5 h-3.5 text-[#520618]" />
                  <span>Size Chart</span>
                </button>
              </div>
            </div>

            {/* Bottom Padding spacer to ensure everything scrolls cleanly above the sticky bar */}
            <div className="h-6" />
          </div>

          {/* 7. STICKY BOTTOM ACTION BAR */}
        <div className="shrink-0 bg-white border-t border-zinc-200/80 p-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center justify-between border border-zinc-300 bg-white rounded-xl py-2 px-3 min-w-[100px] text-zinc-900 font-semibold shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="w-6 h-6 flex items-center justify-center text-zinc-700 hover:bg-zinc-200 rounded-lg active:scale-90 cursor-pointer transition-colors"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>
            <span className="text-sm font-medium text-zinc-900 px-1">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="w-6 h-6 flex items-center justify-center text-zinc-700 hover:bg-zinc-200 rounded-lg active:scale-90 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Primary Add Item Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 bg-black hover:bg-zinc-900 text-white text-sm font-medium py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Add Item</span>
            <span className="text-sm font-medium">₹{totalPrice}</span>
          </button>
        </div>
      </Drawer.Content>
    </Drawer.Portal>

      {/* SIZE CHART RESPONSIVE POPUP MODAL */ }
  <AnimatePresence>
    {isSizeChartOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsSizeChartOpen(false);
          }}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-0"
        />

        {/* Modal Dialog Content */}
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative z-10 bg-white rounded-2xl max-w-md w-full p-3 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto pointer-events-auto"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[#520618]" />
              <h3 className="text-base font-semibold text-zinc-900">
                Awesome Handmade Size Guide
              </h3>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSizeChartOpen(false);
              }}
              className="p-1 text-zinc-400 hover:text-black rounded-full hover:bg-zinc-100 cursor-pointer"
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
                    <td className="p-2.5 font-semibold text-zinc-900">XS</td>
                    <td className="p-2.5">30" – 32"</td>
                    <td className="p-2.5">26" – 28"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-zinc-900">S</td>
                    <td className="p-2.5">32" – 34"</td>
                    <td className="p-2.5">28" – 30"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-zinc-900">M</td>
                    <td className="p-2.5">34" – 36"</td>
                    <td className="p-2.5">30" – 32"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-zinc-900">L</td>
                    <td className="p-2.5">36" – 38"</td>
                    <td className="p-2.5">32" – 34"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-zinc-900">XL</td>
                    <td className="p-2.5">38" – 40"</td>
                    <td className="p-2.5">34" – 36"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-zinc-900">XXL</td>
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
            className="w-full py-2.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Close Size Guide
          </button>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
    </Drawer.Root >
  );
};

export default MobileProductQuickViewSheet;
