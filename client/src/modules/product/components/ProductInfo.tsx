import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiStar,
  FiShoppingBag,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiHeart,
  FiShare2,
  FiZap,
} from "react-icons/fi";
import { Plus, Minus } from "lucide-react";
import { ProductColorVariation, ProductDetails } from "../types/product";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { ShareModal } from "./ShareModal";
import { DynamicLucideIcon } from "../../core/components/DynamicLucideIcon";


interface ProductInfoProps {
  product: ProductDetails;
  activeVariation: ProductColorVariation;
  selectedColor?: string;
  onSelectVariation: (variation: ProductColorVariation) => void;
  onHoverVariation?: (variation: ProductColorVariation | null) => void;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  onOpenSizeChart: () => void;
}

/* Custom Select Dropdown for Cup Size with Compact Height & Hover Scroll Arrows */
interface ShadcnCupSizeSelectProps {
  selectedSize: string;
  availableSizes: string[];
  onSelectSize: (size: string) => void;
}

const ShadcnCupSizeSelect: React.FC<ShadcnCupSizeSelectProps> = ({
  selectedSize,
  availableSizes,
  onSelectSize,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  const handleScrollUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (listRef.current) {
      listRef.current.scrollBy({ top: -40, behavior: "smooth" });
    }
  };

  const handleScrollDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (listRef.current) {
      listRef.current.scrollBy({ top: 40, behavior: "smooth" });
    }
  };

  return (
    <div className="relative inline-block text-left font-sans">
      {/* Trigger Button (Compact Height) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-md bg-white border border-zinc-200 hover:border-zinc-300 text-xs font-bold text-zinc-900 shadow-2xs hover:bg-zinc-50/80 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-950/10 min-w-[110px]"
      >
        <span className="tracking-wider">{selectedSize || "Select Size"}</span>
        <FiChevronDown
          size={14}
          className={`text-zinc-500 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-zinc-900" : ""
            }`}
        />
      </button>

      {/* Dropdown Popover Menu (Compact Height + Top/Bottom Chevron Arrows on Hover) */}
      {isOpen && (
        <div className="group absolute left-0 top-full mt-1.5 z-50 min-w-full w-32 bg-white border border-zinc-200 rounded-md shadow-lg font-sans overflow-hidden">
          {/* Top Chevron Arrow (Visible on Hover) */}
          <button
            type="button"
            onMouseDown={handleScrollUp}
            className="w-full py-1 flex items-center justify-center bg-white/95 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-b border-zinc-100 cursor-pointer text-xs shrink-0"
            title="Scroll Up"
          >
            <FiChevronUp size={14} />
          </button>

          {/* Options Scroll Container (Compact height: max-h-36 / ~144px) */}
          <div
            ref={listRef}
            className="max-h-36 overflow-y-auto p-1 space-y-0.5 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent"
            style={{ scrollbarWidth: "thin" }}
          >
            {availableSizes.map((sz) => {
              const isSelected = sz === selectedSize;
              return (
                <button
                  key={sz}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelectSize(sz);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-sm transition-colors text-left tracking-wider cursor-pointer ${isSelected
                      ? "bg-zinc-100 text-zinc-900 font-bold"
                      : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 font-medium"
                    }`}
                >
                  <span>{sz}</span>
                  {isSelected && <FiCheck size={13} className="text-zinc-900 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Bottom Chevron Arrow (Visible on Hover) */}
          <button
            type="button"
            onMouseDown={handleScrollDown}
            className="w-full py-1 flex items-center justify-center bg-white/95 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-t border-zinc-100 cursor-pointer text-xs shrink-0"
            title="Scroll Down"
          >
            <FiChevronDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  activeVariation,
  selectedColor,
  onSelectVariation,
  onHoverVariation,
  selectedSize,
  onSelectSize,
  onOpenSizeChart,
}) => {
  const { cartItems, addToCart, updateQuantity, setIsCartOpen } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const wishlisted = isWishlisted(product.id);


  // Check if current variant (selected color & size) is in cart
  const productCartItems = cartItems.filter((i) => String(i.productId) === String(product.id));
  const exactVariantItem = productCartItems.find(
    (i) =>
      (i.colorName || "").toLowerCase() === (activeVariation.colorName || "").toLowerCase() &&
      (i.size || "").toLowerCase() === selectedSize.toLowerCase()
  );
  const activeCartItem = exactVariantItem;
  const cartItemId = activeCartItem ? activeCartItem.id : `${product.id}-${activeVariation.colorName}-${selectedSize}`;
  const inCartQuantity = exactVariantItem ? exactVariantItem.quantity : 0;


  const handleAddToCart = () => {
    let formattedTitle = product.name;
    if (activeVariation?.colorName && activeVariation.colorName !== "Default" && !formattedTitle.toLowerCase().includes(activeVariation.colorName.toLowerCase())) {
      formattedTitle = `${product.name} - ${activeVariation.colorName}`;
    }

    addToCart({
      productId: product.id,
      productName: formattedTitle,
      brand: product.brand,
      colorName: activeVariation.colorName,
      colorHex: activeVariation.colorHex,
      size: selectedSize,
      price: activeVariation.price,
      originalPrice: activeVariation.originalPrice,
      image: activeVariation.thumbnail || activeVariation.images[0].url,
      sku: activeVariation.sku,
      quantity: 1,
    });

    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1200);
  };

  const handleBuyNow = () => {
    if (inCartQuantity === 0) {
      handleAddToCart();
    }
    setIsCartOpen(true);
  };

  // Group variations by unique color to display distinct color swatches (merging product.colors, colorMediaConfigs, and product.variations)
  const uniqueColorVariations = React.useMemo(() => {
    const map = new Map<string, ProductColorVariation>();

    // 1. Populate from product.colors if defined
    if (product.colors && product.colors.length > 0) {
      product.colors.forEach((col) => {
        if (!col) return;
        const colName = col.colorName || (col as any).name || (col as any).color || "Default";
        const key = colName.toLowerCase();
        const matchingVar = (product.variations || []).find(
          (v) => v && (v.colorName || (v as any).color || "").toLowerCase() === key
        );

        const colMainImg = col.displayImage || col.mainImage || (col as any).image || (col.galleryImages && col.galleryImages[0]) || matchingVar?.thumbnail || (product as any).mainImage || (product as any).image || "/images/category/Latkan.webp";
        const colGallery = col.galleryImages || (matchingVar?.images ? matchingVar.images.map((i: any) => typeof i === 'string' ? i : i.url) : []);

        map.set(key, {
          id: matchingVar?.id || col.id || `col-${key}`,
          colorName: colName,
          colorHex: col.colorHex || "#000000",
          size: selectedSize || col.sizes?.[0] || "Standard Pair",
          thumbnail: colMainImg,
          price: matchingVar?.price || product.price || 799,
          originalPrice: matchingVar?.originalPrice || product.originalPrice || 1299,
          discountPercentage: matchingVar?.discountPercentage || 38,
          sku: matchingVar?.sku || product.defaultSku || `AH-${colName}-STD`,
          stock: matchingVar?.stock !== undefined ? matchingVar.stock : 50,
          images: [
            { id: `img-${key}-main`, url: colMainImg, alt: `${product.name} - ${colName}` },
            ...colGallery.map((gUrl, idx) => ({ id: `img-${key}-gal-${idx}`, url: gUrl, alt: `${product.name} - ${colName} View ${idx + 1}` }))
          ]
        });
      });
    }

    // 2. Populate from product.colorMediaConfigs
    if (Array.isArray((product as any).colorMediaConfigs) && (product as any).colorMediaConfigs.length > 0) {
      (product as any).colorMediaConfigs.forEach((cm: any) => {
        if (!cm) return;
        const colName = cm.colorName || cm.name || "Default";
        const key = colName.toLowerCase();
        if (!map.has(key)) {
          const cMainImg = cm.mainImage || (product as any).mainImage || (product as any).image || "/images/category/Latkan.webp";
          const cGal = (cm.gallery && cm.gallery.length > 0) ? cm.gallery : [];
          map.set(key, {
            id: cm.colorValueId || `col-${key}`,
            colorName: colName,
            colorHex: cm.colorCode || "#000000",
            size: selectedSize || "Standard Pair",
            thumbnail: cMainImg,
            price: product.price || 799,
            originalPrice: product.originalPrice || 1299,
            discountPercentage: 38,
            sku: product.defaultSku || `AH-${colName}-STD`,
            stock: 50,
            images: [
              { id: `img-${key}-main`, url: cMainImg, alt: `${product.name} - ${colName}` },
              ...cGal.map((gUrl: string, idx: number) => ({ id: `img-${key}-gal-${idx}`, url: gUrl, alt: `${product.name} - ${colName} View ${idx + 1}` }))
            ]
          });
        }
      });
    }

    // 3. Populate strictly from product.variations defined in Admin
    (product.variations || []).forEach((v) => {
      if (!v) return;
      const key = (v.colorName || (v as any).color || "Default").toLowerCase();
      if (!map.has(key)) {
        map.set(key, v);
      }
    });

    // 4. If product is a simple product (0 variants/colors), create a card for it
    if (map.size === 0) {
      const simpleMainImg = (product as any).mainImage || (product as any).image || activeVariation?.thumbnail || "/images/category/Latkan.webp";
      const simpleColName = (product as any).colorName || activeVariation?.colorName || "Standard";
      map.set("default", {
        id: "v-simple",
        colorName: simpleColName,
        colorHex: activeVariation?.colorHex || "#000000",
        size: selectedSize || "Standard Pair",
        thumbnail: simpleMainImg,
        price: product.price || activeVariation?.price || 799,
        originalPrice: product.originalPrice || activeVariation?.originalPrice || 1299,
        discountPercentage: activeVariation?.discountPercentage || 38,
        sku: product.defaultSku || product.sku || activeVariation?.sku || "AH-PROD-001",
        stock: product.stock !== undefined ? product.stock : (activeVariation?.stock || 50),
        images: activeVariation?.images || [{ id: "img-0", url: simpleMainImg, alt: product.name }]
      });
    }

    return Array.from(map.values());
  }, [product.colors, (product as any).colorMediaConfigs, product.variations, product.price, product.originalPrice, product.defaultSku, product.name, product.mainImage, (product as any).image, (product as any).colorName, activeVariation, selectedSize]);

  // Filter available sizes specifically matching the currently active color strictly from Admin data
  const availableSizesForColor = React.useMemo(() => {
    const activeColor = activeVariation?.colorName || "";
    const colorObj = (product.colors || []).find(
      (c) => c && (c.colorName || (c as any).name || (c as any).color || "").toLowerCase() === activeColor.toLowerCase()
    );
    if (colorObj?.sizes && colorObj.sizes.length > 0) {
      return colorObj.sizes;
    }

    const matchingSizes = (product.variations || [])
      .filter((v) => v && (v.colorName || (v as any).color || "").toLowerCase() === activeColor.toLowerCase())
      .map((v) => v.size || v.sizeName)
      .filter(Boolean) as string[];

    if (matchingSizes.length > 0) {
      return Array.from(new Set(matchingSizes));
    }
    return product.availableSizes || ["Free Size", "Standard Pair"];
  }, [product.colors, product.variations, activeVariation?.colorName, product.availableSizes]);

  const isVariableProduct = product.type === "Variable" ||
    (product.colors && product.colors.length > 0) ||
    (product.variations && product.variations.length > 0) ||
    (product.availableSizes && product.availableSizes.length > 0) ||
    uniqueColorVariations.length > 0;
  const savings = activeVariation.originalPrice - activeVariation.price;
  const activeColorMedia = ((product as any).colorMediaConfigs || []).find(
    (cm: any) => cm && (cm.colorName || cm.name || "").toLowerCase() === (activeVariation?.colorName || "").toLowerCase()
  );
  const displayTitle = activeColorMedia?.title || (activeVariation as any)?.title || product.name;
  const displaySubtitle = activeColorMedia?.productInfo || (activeVariation as any)?.productInfo || (activeVariation as any)?.subtitle || product.subtitle || product.shortDescription;
  const rawDescription = displaySubtitle || product.shortDescription || product.fullDescription || product.extendedDetails?.description || "";
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Dynamic selector label (e.g. SELECT METAL, SELECT COLOR, SELECT VARIANT)
  const selectorLabel = React.useMemo(() => {
    const cat = (product.category || (product as any).categories?.[0] || "").toLowerCase();
    if (cat.includes("jewelry") || cat.includes("necklace") || cat.includes("ring") || cat.includes("gold") || cat.includes("diamond")) {
      return "SELECT METAL";
    }
    return "SELECT COLOR";
  }, [product.category, (product as any).categories]);

  return (
    <div className="w-full flex flex-col gap-5 font-sans">
      {/* 1. TOP HEADER: Product Title & Action Buttons (Wishlist / Share) */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          {/* Main Product Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-zinc-900 leading-snug tracking-tight">
            {displayTitle}
          </h1>

          {/* Quick Actions (Wishlist & Share) */}
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className={`p-2.5 rounded-full transition-all duration-300 cursor-pointer shadow-xs ${
                wishlisted
                  ? "bg-rose-500 text-white border border-rose-500 shadow-rose-500/20"
                  : "bg-white text-zinc-800 border border-zinc-200 hover:bg-black hover:text-white hover:border-black"
              }`}
              title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              aria-label="Wishlist"
            >
              <FiHeart size={16} className={`stroke-[2.5] ${wishlisted ? "fill-current" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="p-2.5 rounded-full border border-zinc-200 text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 bg-white transition-all shadow-2xs cursor-pointer"
              title="Share Product"
              aria-label="Share"
            >
              <FiShare2 size={16} />
            </button>
          </div>
        </div>

        {/* 2. STAR RATING DIRECTLY UNDER HEADING */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="flex text-amber-400 gap-0.5">
            {[...Array(5)].map((_, i) => {
              const ratingVal = product.rating || 5;
              const isFilled = i < Math.floor(ratingVal);
              return (
                <FiStar
                  key={i}
                  size={15}
                  className={isFilled ? "fill-amber-400 text-amber-400" : "text-zinc-300 fill-zinc-100"}
                />
              );
            })}
          </div>
          {product.reviewCount !== undefined && (
            <span
              onClick={() => {
                const revEl = document.getElementById("customer-reviews");
                revEl?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-xs text-zinc-400 hover:text-zinc-700 cursor-pointer transition-colors font-medium"
            >
              ({product.reviewCount} reviews)
            </span>
          )}
        </div>
      </div>

      {/* 3. PRICE DISPLAY: Current Price + Original Strikethrough */}
      <div className="flex items-baseline gap-3 flex-wrap pt-0.5">
        <span className="text-2xl sm:text-3xl font-bold text-zinc-900">
          ₹{activeVariation.price.toLocaleString("en-IN")}.00
        </span>
        {activeVariation.originalPrice > activeVariation.price && (
          <span className="text-base sm:text-lg text-zinc-400 line-through font-normal">
            ₹{activeVariation.originalPrice.toLocaleString("en-IN")}.00
          </span>
        )}
        {activeVariation.discountPercentage > 0 && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded">
            {activeVariation.discountPercentage}% OFF
          </span>
        )}
      </div>

      {/* 4. SKU IN BOLD UPPERCASE */}
      <div className="text-sm sm:text-base font-bold text-zinc-900 tracking-wide uppercase">
        SKU {activeVariation.sku && !activeVariation.sku.includes("UNDEFINED")
          ? activeVariation.sku
          : (product.defaultSku || `AH-${(product.category || "PRD").toUpperCase()}-${(activeVariation.colorName || "STD").toUpperCase()}`)}
      </div>

      {/* 5. PRODUCT DESCRIPTION (Full Content Display) */}
      {rawDescription && (
        <div className="space-y-1.5 text-zinc-600 text-xs sm:text-sm leading-relaxed">
          <p className="whitespace-pre-line">
            {rawDescription}
          </p>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("product-description");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="text-zinc-900 font-bold hover:underline text-xs cursor-pointer inline-flex items-center gap-1 pt-0.5"
          >
            See more
          </button>
        </div>
      )}

      {/* 6. SELECT COLOR & VARIANT CARDS (Shown for both Simple and Variable products) */}
      {uniqueColorVariations.length > 0 && (
        <div className="space-y-4 pt-1">
          {/* Color Selection Cards */}
          <div className="space-y-3 font-montserrat">
            <div className="flex items-center justify-between">
              <span className="text-xs font-montserrat font-600 tracking-wider text-zinc-900">
                Colour: <span className="font-bold text-black">{activeVariation?.colorName || uniqueColorVariations[0]?.colorName || "Standard"}</span>
              </span>
            </div>

            {/* Color Cards Row: Responsive Swatches Grid for Mobile, Tablet & Desktop */}
            <div className="grid grid-cols-2 min-[360px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 py-1">
              {uniqueColorVariations.map((v) => {
                const vColName = (v.colorName || (v as any).color || "Standard").trim().toLowerCase();
                const activeColName = (selectedColor || activeVariation?.colorName || "Standard").trim().toLowerCase();
                const isActive = vColName === activeColName || uniqueColorVariations.length === 1;
                const colorObj = (product.colors || []).find((c) => c && (c.colorName || (c as any).name || (c as any).color || "").toLowerCase() === vColName);
                const colorMedia = ((product as any).colorMediaConfigs || []).find((cm: any) => cm && (cm.colorName || cm.name || "").toLowerCase() === vColName);
                const displayImg = colorMedia?.mainImage || (v as any).displayImage || colorObj?.displayImage || colorObj?.mainImage || (colorObj as any)?.image || v.thumbnail || (v.images && v.images[0] ? v.images[0].url : "") || (product as any).mainImage || (product as any).image || "/images/category/Latkan.webp";

                return (
                  <motion.button
                    key={v.id || v.colorName}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectVariation(v);
                    }}
                    className={`flex flex-col p-1.5 sm:p-2 rounded-xl sm:rounded-[16px] border-2 transition-all duration-200 text-left bg-white relative group overflow-hidden cursor-pointer select-none ${
                      isActive
                        ? "border-zinc-900 shadow-md ring-1 ring-zinc-900"
                        : "border-zinc-200 hover:border-zinc-400 opacity-85 hover:opacity-100"
                    }`}
                  >
                    <div className="w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-[#FAF8F5] mb-1 sm:mb-1.5 relative">
                      <img
                        src={displayImg || "/images/category/Latkan.webp"}
                        alt={v.colorName || "Variation"}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/category/Latkan.webp";
                        }}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col justify-between text-[11px] sm:text-xs px-0.5 leading-tight gap-0.5">
                      <span className="font-extrabold text-zinc-900 truncate block text-[11px]">{v.colorName || "Standard"}</span>
                      <div className="flex items-baseline justify-between w-full">
                        <span className="font-bold text-zinc-900 text-[10px] sm:text-[11px]">₹{v.price}</span>
                        <span className="text-[9px] text-zinc-400 line-through">₹{v.originalPrice}</span>
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                        <FiCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Size Selector (If Available) */}
          {availableSizesForColor.length > 0 && availableSizesForColor[0] !== "Standard Pair" && availableSizesForColor[0] !== "Free Size" && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-zinc-900 uppercase">
                  Select Size
                </span>
                {product.sizeChart && product.sizeChart.length > 0 && (
                  <button
                    type="button"
                    onClick={onOpenSizeChart}
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
                  >
                    Size Guide
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {availableSizesForColor.map((sz) => {
                  const isSelected = sz.toLowerCase() === (selectedSize || "").toLowerCase();
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => onSelectSize(sz)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. ACTION BUTTON & LIVE INVENTORY COUNT */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
        {/* Add To Cart / Quantity Selector */}
        {activeVariation.stock <= 0 ? (
          <button
            disabled
            className="w-full sm:w-auto px-8 py-3.5 rounded-md font-semibold text-xs sm:text-sm tracking-wider uppercase bg-zinc-200 text-zinc-500 cursor-not-allowed select-none"
          >
            Out of Stock
          </button>
        ) : inCartQuantity > 0 ? (
          <div className="inline-flex items-center justify-between gap-4 px-6 py-2.5 rounded-md bg-[#232323] text-white shadow-sm font-sans min-w-[200px]">
            <button
              type="button"
              onClick={() => updateQuantity(cartItemId, inCartQuantity - 1)}
              className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 rounded transition-colors cursor-pointer active:scale-90"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold tracking-wider">
              {inCartQuantity} in Cart
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(cartItemId, inCartQuantity + 1)}
              className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 rounded transition-colors cursor-pointer active:scale-90"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-md font-semibold text-xs sm:text-sm tracking-wider transition-all duration-200 shadow-sm cursor-pointer active:scale-95 ${
              isAddedAnimation
                ? "bg-emerald-700 text-white shadow-emerald-700/30"
                : "bg-[#232323] hover:bg-black text-white"
            }`}
          >
            {isAddedAnimation ? "Added To Cart!" : "Add To Shopping Cart"}
          </motion.button>
        )}

        {/* Live Pieces Available Stock Display */}
        <div className="text-xs sm:text-sm text-zinc-600 font-medium">
          {activeVariation.stock > 0 ? (
            <span>{activeVariation.stock} pieces available</span>
          ) : (
            <span className="text-rose-600 font-semibold">Currently Unavailable</span>
          )}
        </div>
      </div>

      {/* Social Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        productName={product.name}
      />
    </div>
  );
};

export default ProductInfo;
