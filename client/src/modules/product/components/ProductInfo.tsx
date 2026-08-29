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

    return Array.from(map.values());
  }, [product.colors, (product as any).colorMediaConfigs, product.variations, product.price, product.originalPrice, product.defaultSku, product.name, selectedSize]);

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

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      {/* Brand & Action Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-montserrat font-600 tracking-[0.25em] text-[#798A7A]">
            {/* Brand: <strong className="text-zinc-900 font-bold">{product.brand}</strong> */}
          </span>

          <div className="flex items-center gap-2">
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
              onClick={() => setIsShareModalOpen(true)}
              className="p-2.5 rounded-full border border-zinc-200 text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 bg-white transition-all shadow-2xs cursor-pointer"
              title="Share Product"
              aria-label="Share"
            >
              <FiShare2 size={16} />
            </button>
          </div>
        </div>

        {/* Title in Montserrat 800 uppercase matching Home Page */}
        <h1 className="text-[22px] sm:text-[26px] lg:text-[30px] xl:text-[34px] font-montserrat font-800 text-zinc-900 leading-[1.2] tracking-tight line-clamp-3">
          {displayTitle}
        </h1>

        {displaySubtitle && (
          <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
            {displaySubtitle}
          </p>
        )}

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2 pt-1 font-montserrat">
          <div className="flex items-center gap-1.5 bg-[#f5f2ee] border border-zinc-200 px-3 py-1 rounded-full">
            <span className="text-xs font-bold text-zinc-900">{product.rating}</span>
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={12}
                  className={i < Math.floor(product.rating) ? "fill-amber-500" : "text-zinc-300"}
                />
              ))}
            </div>
          </div>
          <span
            onClick={() => {
              const revEl = document.getElementById("customer-reviews");
              revEl?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-xs text-zinc-500 font-semibold hover:text-zinc-900 cursor-pointer transition-colors"
          >
            ({product.reviewCount} reviews)
          </span>
        </div>
      </div>

      <hr className="border-zinc-100" />

      {/* Pricing with Discount Tag */}
      <div className="space-y-1 font-montserrat">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-[#E859B1] to-[#F7D85E] bg-clip-text text-transparent drop-shadow-xs">
            -{activeVariation.discountPercentage}%
          </span>
          <span className="text-3xl md:text-4xl font-800 text-zinc-900">
            ₹{activeVariation.price.toLocaleString("en-IN")}.00
          </span>
          <span className="text-base text-zinc-400 line-through font-medium">
            ₹{activeVariation.originalPrice.toLocaleString("en-IN")}.00
          </span>
          {savings > 0 && (
            <span className="text-xs font-bold text-[#410815] bg-gradient-to-r from-[#E859B1] to-[#F7D85E] px-3 py-1 rounded-full shadow-xs">
              Save ₹{savings.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-500 font-medium pt-1">
          Inclusive of all taxes • SKU: <span className="font-mono text-zinc-700 font-bold uppercase">
            {activeVariation.sku && !activeVariation.sku.includes("UNDEFINED")
              ? activeVariation.sku
              : `AH-${(product.category || "PRD").toUpperCase()}-${(activeVariation.colorName || "STD").toUpperCase()}-${selectedSize || "STD"}`}
          </span>
        </p>
      </div>

      {/* Render Color & Size Selectors only if Product Type is Variable */}
      {isVariableProduct && (
        <>
          {/* Color Selection Cards */}
          {uniqueColorVariations.length > 0 && uniqueColorVariations[0]?.colorName !== "Standard" && (
            <div className="space-y-3 font-montserrat">
              <div className="flex items-center justify-between">
                <span className="text-xs font-montserrat font-600 tracking-wider text-zinc-900">
                  Colour: <span className="font-bold text-black">{activeVariation.colorName}</span>
                </span>
                {activeVariation.stock > 0 ? (
                  <span className="text-xs font-bold text-[#798A7A] bg-[#798A7A]/15 px-3 py-0.5 rounded-full">
                    In Stock ({activeVariation.stock} left)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Color Cards Row: Unique Color Swatches Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3 py-1">
                {uniqueColorVariations.map((v) => {
                  const vColName = (v.colorName || (v as any).color || "").trim().toLowerCase();
                  const activeColName = (selectedColor || activeVariation?.colorName || "").trim().toLowerCase();
                  const isActive = vColName === activeColName;
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
                      onMouseEnter={() => onHoverVariation?.(v)}
                      onMouseLeave={() => onHoverVariation?.(null)}
                      className={`flex flex-col p-1.5 sm:p-2 rounded-xl sm:rounded-[16px] border-2 transition-all duration-200 text-left bg-white relative group overflow-hidden cursor-pointer select-none ${isActive
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
          )}

          {/* Size Selector with Out of Stock handling */}
          {availableSizesForColor.length > 0 && (
            <div className="space-y-3 font-montserrat">
              

              {/* Size Buttons Row with Out of Stock indication */}
              <div className="flex flex-wrap items-center gap-2">
                {availableSizesForColor.map((sz) => {
                  const activeColName = (activeVariation?.colorName || "").toLowerCase();
                  const szLower = String(sz || "").toLowerCase();
                  const matchingVar = (product.variations || []).find(
                    (v) =>
                      v &&
                      (v.colorName || "").toLowerCase() === activeColName &&
                      (((v.size || "").toLowerCase() === szLower) ||
                        ((v.sizeName || "").toLowerCase() === szLower))
                  );
                  const isOutOfStock = matchingVar ? matchingVar.stock <= 0 : false;
                  const isSelected = szLower === (selectedSize || "").toLowerCase();

                  return (
                    <button
                      key={sz}
                      disabled={isOutOfStock}
                      onClick={() => !isOutOfStock && onSelectSize(sz)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative border cursor-pointer ${isSelected
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                          : isOutOfStock
                            ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed line-through opacity-70"
                            : "bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
                        }`}
                      title={isOutOfStock ? `${sz} - Out of Stock` : `Select ${sz}`}
                    >
                      <span>{sz}</span>
                      {isOutOfStock && (
                        <span className="absolute -top-1.5 -right-1 bg-rose-500 text-white text-[8px] font-extrabold px-1 rounded-full uppercase tracking-tighter">
                          OOS
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Top Highlights Section */}
      <div className="border-t border-b border-zinc-200/80 py-4 space-y-3 font-montserrat">
        <div className="flex items-center justify-between font-montserrat font-800 text-xs tracking-wider text-zinc-900">
          <span>Top Highlights</span>
        </div>

        {/* Dynamic Highlight key-values list */}
        <div className="space-y-2.5 text-xs">
          {(() => {
            const hasProductAttributes = product.productAttributes && Array.isArray(product.productAttributes) && product.productAttributes.length > 0;
            
            if (hasProductAttributes) {
              const activeHighlights = product.productAttributes!
                .filter((pa) => pa.showInHighlights && pa.value !== undefined && pa.value !== null && pa.value !== '')
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

              return activeHighlights.map((pa, idx) => {
                const formattedVal = Array.isArray(pa.value) ? pa.value.join(', ') : String(pa.value);
                return (
                  <div key={pa.attributeId || idx} className="flex items-center gap-3">
                    <DynamicLucideIcon name="Sparkles" className="w-4 h-4 text-zinc-700 shrink-0" />
                    <span className="text-zinc-500 font-bold tracking-wider text-[11px] w-36 shrink-0">{pa.attributeName}:</span>
                    <span className="text-zinc-900 font-semibold">{formattedVal}</span>
                  </div>
                );
              });
            }

            return (product.highlights || []).slice(0, 6).map((h: any, idx: number) => {
              if (typeof h === "string") {
                if (h.includes(":")) {
                  const [lbl, ...valParts] = h.split(":");
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <DynamicLucideIcon name="Sparkles" className="w-4 h-4 text-zinc-700 shrink-0" />
                      <span className="text-zinc-500 font-bold tracking-wider text-[11px] w-36 shrink-0">{lbl.trim()}:</span>
                      <span className="text-zinc-900 font-semibold">{valParts.join(":").trim()}</span>
                    </div>
                  );
                }
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <DynamicLucideIcon name="Sparkles" className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
                    <span className="text-zinc-900 font-medium">{h}</span>
                  </div>
                );
              }

              const icon = h.iconName || h.icon || "Sparkles";
              const label = h.label || h.title || h.key || "";
              const val = h.value || h.text || h.desc || "";

              if (!label && val) {
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <DynamicLucideIcon name={icon} className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
                    <span className="text-zinc-900 font-medium">{val}</span>
                  </div>
                );
              }

              return (
                <div key={idx} className="flex items-center gap-3">
                  <DynamicLucideIcon name={icon} className="w-4 h-4 text-zinc-700 shrink-0" />
                  {label && <span className="text-zinc-500 font-bold tracking-wider text-[11px] w-36 shrink-0">{label}:</span>}
                  <span className="text-zinc-900 font-semibold">{val}</span>
                </div>
              );
            });
          })()}
        </div>

        {/* View More button */}
        <button
          onClick={() => {
            const descEl = document.getElementById("product-description") || document.getElementById("manufacturing-details");
            if (descEl) {
              descEl.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="text-xs font-bold text-zinc-900 hover:text-[#520618] tracking-wider pt-1 text-left block cursor-pointer transition-colors"
        >
          View More Details →
        </button>
      </div>

      {/* Primary Action Button: Full Width ADD TO BAG / QUANTITY CONTROLLER (Placed below Top Highlights) */}
      <div className="pt-1 font-montserrat">
        {activeVariation.stock <= 0 ? (
          <button
            disabled
            className="w-full py-4 px-6 rounded-full font-bold text-xs tracking-[0.2em] flex items-center justify-center gap-2.5 bg-zinc-200 text-zinc-500 cursor-not-allowed uppercase shadow-xs select-none"
          >
            Out of Stock
          </button>
        ) : inCartQuantity > 0 ? (
          /* Interactive In-Cart Quantity Counter matching Product Card style 1:1 */
          <div className="w-full py-3 px-6 rounded-full bg-[#1c1c1e] text-white flex items-center justify-between shadow-md border border-zinc-800 font-sans transition-all">
            <button
              type="button"
              onClick={() => updateQuantity(cartItemId, inCartQuantity - 1)}
              className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer active:scale-90"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <span className="text-xs sm:text-sm font-semibold px-1 min-w-[20px] text-center tracking-wider">
              {inCartQuantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(cartItemId, inCartQuantity + 1)}
              className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer active:scale-90"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          /* Default Full Width Add To Bag Button matching Product Card style 1:1 */
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className={`w-full py-3.5 px-6 rounded-full font-bold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-xs cursor-pointer active:scale-95 ${
              isAddedAnimation
                ? "bg-emerald-700 text-white shadow-emerald-700/30"
                : "bg-[#1c1c1e] hover:bg-black text-white shadow-zinc-900/20"
            }`}
          >
            {isAddedAnimation ? (
              <>
                <FiCheck size={18} className="animate-bounce" />
                <span>Added To Bag!</span>
              </>
            ) : (
              <>
                <FiShoppingBag size={14} className="stroke-[2.5]" />
                <span>Add To Bag</span>
              </>
            )}
          </motion.button>
        )}

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
