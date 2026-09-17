import React, { useState, useMemo } from "react";
import { FiHeart, FiShoppingBag, FiEye } from "react-icons/fi";
import { Plus, Minus, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "@/modules/product/context/WishlistContext";
import { useCart } from "@/modules/product/context/CartContext";
import { useQuickView } from "@/modules/product/context/QuickViewContext";
import ProductHoverSlider from "@/modules/product/components/ProductHoverSlider";

export type Product = {
  id: string | number;
  name: string;
  price: number;
  rating?: number;
  img?: string;
  image?: string;
  hoverImg?: string;
  hoverImage?: string;
  colors?: any[];
  sizes?: string[];
  category?: string;
  tags?: string[];
  brand?: string;
  defaultSku?: string;
  sku?: string;
  slug?: string;
  productType?: string;
  type?: string;
  color?: string;
  colorHex?: string;
  variants?: any[];
  variations?: any[];
};

interface CardColorVariant {
  name: string;
  hex: string;
  image: string;
  images: string[];
  price: number;
  originalPrice: number;
  sku: string;
}

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
  if (!name) return '#C89B3C';
  const lower = name.toLowerCase().trim();
  for (const [k, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (lower.includes(k)) return hex;
  }
  return '#C89B3C';
};

export default function ProductCard(props: { p?: any; [key: string]: any }) {
  const p = props.p || props;
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { openQuickView } = useQuickView();

  if (!p || p.id == null) return null;

  const productId = String(p.id);

  const extractUrl = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val.trim();
    if (typeof val === "object") {
      if (typeof val.url === "string") return val.url.trim();
      if (typeof val.src === "string") return val.src.trim();
      if (typeof val.image === "string") return val.image.trim();
      if (typeof val.mainImage === "string") return val.mainImage.trim();
      if (typeof val.thumbnail === "string") return val.thumbnail.trim();
    }
    return "";
  };

  const mainImg =
    extractUrl(p.image) ||
    extractUrl(p.mainImage) ||
    extractUrl(p.img) ||
    (Array.isArray(p.images) && extractUrl(p.images[0])) ||
    (Array.isArray(p.galleryImages) && extractUrl(p.galleryImages[0])) ||
    "";

  const rawVariants = Array.isArray(p.variants) && p.variants.length > 0
    ? p.variants
    : (Array.isArray(p.variations) && p.variations.length > 0 ? p.variations : []);

  const isVariable = (p.productType === "variable" || p.type === "Variable") && rawVariants.length > 0;

  // Extract distinct real color variants from database
  const colorVariants: CardColorVariant[] = useMemo(() => {
    if (!isVariable) return [];
    const map = new Map<string, CardColorVariant>();

    rawVariants.forEach((v: any) => {
      const rawName = (v.colorName || v.title || v.name || v.optionValue || "").trim();
      if (!rawName || ["standard", "default", "none", "free size"].includes(rawName.toLowerCase())) return;
      const key = rawName.toLowerCase();

      const variantImages: string[] = [];
      const addImg = (val: any) => {
        const u = extractUrl(val);
        if (u && !variantImages.includes(u)) {
          variantImages.push(u);
        }
      };

      addImg(v.thumbnail);
      addImg(v.mainImage);
      addImg(v.image);
      if (Array.isArray(v.images)) v.images.forEach(addImg);
      if (Array.isArray(v.galleryImages)) v.galleryImages.forEach(addImg);

      // Check p.colors or p.colorMediaConfigs for this variant's images
      if (Array.isArray(p.colors)) {
        p.colors.forEach((c: any) => {
          const cName = (typeof c === "string" ? c : (c.colorName || c.name || "")).trim().toLowerCase();
          if (cName === key) {
            if (typeof c === "object") {
              addImg(c.thumbnail);
              addImg(c.mainImage);
              addImg(c.image);
              addImg(c.displayImage);
              if (Array.isArray(c.images)) c.images.forEach(addImg);
              if (Array.isArray(c.galleryImages)) c.galleryImages.forEach(addImg);
            }
          }
        });
      }
      if (Array.isArray(p.colorMediaConfigs)) {
        p.colorMediaConfigs.forEach((cm: any) => {
          const cmName = (cm.colorName || "").trim().toLowerCase();
          if (cmName === key) {
            addImg(cm.mainImage);
            addImg(cm.thumbnail);
            if (Array.isArray(cm.images)) cm.images.forEach(addImg);
            if (Array.isArray(cm.galleryImages)) cm.galleryImages.forEach(addImg);
          }
        });
      }

      const vImg = variantImages[0] || mainImg;
      const vPrice = Number(v.price) || Number(p.price) || 0;
      const vOrigPrice = Number(v.originalPrice) || Number(p.originalPrice) || Number(p.regularPrice) || vPrice;

      if (!map.has(key)) {
        map.set(key, {
          name: rawName,
          hex: v.colorHex || "#1c1c1e",
          image: vImg,
          images: variantImages.length > 0 ? variantImages : (vImg ? [vImg] : []),
          price: vPrice,
          originalPrice: vOrigPrice,
          sku: v.sku || p.sku || p.defaultSku || `AH-${p.id}`,
        });
      } else {
        const existing = map.get(key)!;
        variantImages.forEach((img) => {
          if (!existing.images.includes(img)) {
            existing.images.push(img);
          }
        });
        if ((!existing.image || existing.image === mainImg) && existing.images.length > 0) {
          existing.image = existing.images[0];
        }
      }
    });

    return Array.from(map.values());
  }, [isVariable, rawVariants, p, mainImg]);

  const [selectedColor, setSelectedColor] = useState<string>(
    colorVariants[0]?.name || ""
  );

  const activeColor = selectedColor || colorVariants[0]?.name || "";
  const activeVariant = isVariable
    ? colorVariants.find((v) => v.name.toLowerCase() === activeColor.toLowerCase()) || colorVariants[0]
    : null;

  // Simple product single color
  const simpleColorName = (!isVariable && (p.color || p.colorName || (p.colors && p.colors[0]?.colorName) || "Standard")) || "Standard";
  const simpleColorHex = (!isVariable && (p.colorHex || p.color_hex || (p.colors && p.colors[0]?.colorHex) || (p.colors && p.colors[0]?.hex) || getColorHex(simpleColorName))) || "#C89B3C";

  const regPrice = Number(activeVariant?.originalPrice || p.originalPrice || p.regularPrice || p.price || 0);
  const finalPrice = Number(activeVariant?.price || p.price || 0);
  const hasDiscount = regPrice > finalPrice;
  const discountVal = p.discountPercentage !== undefined && !activeVariant
    ? Number(p.discountPercentage)
    : hasDiscount
    ? Math.round(((regPrice - finalPrice) / regPrice) * 100)
    : 0;

  const currentImg = activeVariant?.image || mainImg;
  const currentVariantImages = isVariable && activeVariant?.images && activeVariant.images.length > 0
    ? activeVariant.images
    : undefined;
  const currentSku = activeVariant?.sku || p.sku || p.defaultSku || `AH-${p.id}`;

  const currentProductLink = isVariable && activeColor
    ? `/product/${p.slug || p.id}?color=${encodeURIComponent(activeColor)}`
    : `/product/${p.slug || p.id}`;

  const wishlisted = isWishlisted(productId);

  // Cart item matching currently active variant or simple product
  const cartItem = (cartItems || []).find((item) => {
    if (!item) return false;
    const sameProduct = String(item.productId) === productId || String(item.id) === productId;
    if (!sameProduct) return false;
    if (isVariable && activeColor) {
      return (item.colorName || "").toLowerCase() === activeColor.toLowerCase();
    }
    return true;
  });
  const itemQuantity = cartItem ? cartItem.quantity : 0;

  const handleCardNavigation = (e: React.MouseEvent) => {
    if (props.forceNavigate) {
      e.preventDefault();
      navigate(currentProductLink);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (typeof document !== "undefined") {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.scrollTo(0, { immediate: true });
        } catch (err) {}
      }
      return;
    }
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      e.preventDefault();
      openQuickView(p.id);
    } else {
      navigate(currentProductLink);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (typeof document !== "undefined") {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.scrollTo(0, { immediate: true });
        } catch (err) {}
      }
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: productId,
      productName: p.name || "Handcrafted Product",
      brand: p.brand || "Awesome Handmade",
      colorName: isVariable ? (activeVariant?.name || "Standard") : (simpleColorName || "Standard"),
      colorHex: isVariable ? (activeVariant?.hex || "#000000") : simpleColorHex,
      size: (p.sizes && p.sizes[0]) || (p.availableSizes && p.availableSizes[0]) || "Standard Pair",
      price: finalPrice,
      originalPrice: regPrice > 0 ? regPrice : finalPrice,
      image: currentImg,
      sku: currentSku,
      quantity: 1,
    });
  };

  const badgeTag = p.defaultKey || p.badge || (p.labels?.bestSeller ? "Best Seller" : p.labels?.newArrival ? "New" : "");

  return (
    <div className="group flex flex-col bg-transparent cursor-pointer select-none">
      {/* Image Wrapper with Hover Slider */}
      <div onClick={handleCardNavigation} className="cursor-pointer">
        <ProductHoverSlider
          product={p}
          alt={p.name}
          activeImage={currentImg}
          activeImages={currentVariantImages}
          activeColor={isVariable ? activeColor : undefined}
          className="relative aspect-square w-full overflow-hidden rounded-[18px] bg-[#f5f2ee]"
        >
          {/* Top Badges (Discount % & Custom Tag) */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 items-start">
            {discountVal > 0 && (
              <span className="bg-[#520618] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs tracking-wider">
                -{discountVal}%
              </span>
            )}
            {badgeTag && (
              <span className="bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs tracking-wider uppercase">
                {badgeTag}
              </span>
            )}
          </div>

          {/* Wishlist Heart Icon */}
          <button
            type="button"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute right-3.5 top-3.5 z-20 grid h-8.5 w-8.5 place-items-center rounded-full backdrop-blur-xs transition-all duration-300 shadow-xs cursor-pointer ${
              wishlisted
                ? "bg-rose-500 text-white shadow-rose-500/20"
                : "bg-white/90 text-zinc-800 hover:bg-black hover:text-white"
            }`}
            onClick={handleWishlistClick}
          >
            <FiHeart size={14} className={`stroke-[2.5] ${wishlisted ? "fill-current" : ""}`} />
          </button>

          {/* Quick View Button (Mobile View Only) */}
          <div className="md:hidden absolute inset-x-2.5 bottom-2.5 z-20 transition-all duration-300 ease-out translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-active:translate-y-0 group-active:opacity-100 flex">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openQuickView(p.id);
              }}
              className="w-full bg-white/95 hover:bg-black hover:text-white text-zinc-900 font-extrabold text-[11px] tracking-wider uppercase py-2 px-3 rounded-md shadow-lg border border-white/50 backdrop-blur-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FiEye className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Quick View</span>
            </button>
          </div>
        </ProductHoverSlider>
      </div>

      {/* Info Content */}
      <div className="flex flex-1 flex-col pt-3 px-0.5">
        <Link
          to={currentProductLink}
          onClick={handleCardNavigation}
          className="hover:text-[#520618] transition-colors"
        >
          {/* Category & Subcategory Tag */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#798A7A] tracking-wider uppercase">
              {p.category || "Handmade"}
            </span>
            {p.subcategory && (
              <span className="text-[10px] text-zinc-400 font-medium truncate">
                • {p.subcategory}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="mt-1 text-sm sm:text-base font-bold text-zinc-900 line-clamp-2 leading-snug">
            {p.name}
          </h3>

          {/* Subtitle / Tagline from Admin */}
          {(p.subtitle || p.shortDescription || p.tagline) && (
            <p className="mt-0.5 text-[11px] text-zinc-500 line-clamp-1">
              {p.subtitle || p.shortDescription || p.tagline}
            </p>
          )}

          {/* Star Rating & Review Count */}
          <div className="mt-1 flex items-center gap-1.5 text-amber-500 text-xs font-bold">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-zinc-800 font-semibold">{p.rating !== undefined && p.rating !== null ? p.rating : 4.9}</span>
            </div>
            <span className="text-zinc-400 font-normal text-[10px]">
              ({(p as any).reviewCount || p.salesCount || 12})
            </span>
          </div>
        </Link>

        {/* Color Section: Swatches for Variant Product vs Single Color Badge for Simple Product */}
        <div className="mt-2 min-h-[22px] flex items-center">
          {isVariable && colorVariants.length > 0 ? (
            <div className="flex items-center gap-1 flex-wrap">
              {colorVariants.slice(0, 6).map((cv) => {
                const isSelected = cv.name.toLowerCase() === activeColor.toLowerCase();
                return (
                  <button
                    key={cv.name}
                    type="button"
                    title={cv.name}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(cv.name);
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? "border-2 border-[#520618]"
                        : "border-2 border-transparent hover:border-black/20 opacity-85 hover:opacity-100"
                    }`}
                    aria-label={`Select ${cv.name}`}
                  >
                    <span
                      className="w-4 h-4 rounded-full block border border-black/15 shadow-2xs shrink-0"
                      style={{ backgroundColor: cv.hex }}
                    />
                  </button>
                );
              })}
              {colorVariants.length > 6 && (
                <span className="text-[10px] font-bold text-zinc-500 pl-0.5">
                  +{colorVariants.length - 6}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#520618] shrink-0"
                title={simpleColorName || "Product Color"}
              >
                <span
                  className="w-4 h-4 rounded-full block border border-black/15 shadow-2xs shrink-0"
                  style={{ backgroundColor: simpleColorHex }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Price & Add To Bag Button / Quantity Stepper */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-zinc-900">
              ₹{finalPrice.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-zinc-400 line-through">
                ₹{regPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {itemQuantity > 0 ? (
            <div
              className="inline-flex items-center justify-between bg-[#1c1c1e] text-white px-3 py-2 rounded-full shadow-md gap-2.5 font-extrabold text-xs border border-zinc-800"
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
                className="w-5 h-5 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3 stroke-[2.5]" />
              </button>
              <span className="text-xs font-black px-1 min-w-[14px] text-center">{itemQuantity}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (cartItem) updateQuantity(cartItem.id, cartItem.quantity + 1);
                }}
                className="w-5 h-5 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer active:scale-90"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-wider bg-[#1c1c1e] hover:bg-black text-white px-4 py-2.5 rounded-full shadow-xs transition-all duration-300 cursor-pointer active:scale-95"
              onClick={handleAddToCart}
            >
              <FiShoppingBag size={12} className="stroke-[2.5]" /> Add To Bag
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
