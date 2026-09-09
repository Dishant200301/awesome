import React from "react";
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
  colors?: string[];
  sizes?: string[];
  category?: string;
  tags?: string[];
  brand?: string;
  defaultSku?: string;
};

export default function ProductCard(props: { p?: any; [key: string]: any }) {
  const p = props.p || props;
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { openQuickView } = useQuickView();

  if (!p || p.id == null) return null;

  const productId = String(p.id);
  const cartItem = (cartItems || []).find(
    (item) => item && (String(item.productId) === productId || String(item.id) === productId)
  );
  const itemQuantity = cartItem ? cartItem.quantity : 0;

  const handleImageClick = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      e.preventDefault();
      openQuickView(p.id);
    } else {
      navigate(`/product/${p.id}`);
    }
  };

  const extractUrl = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val.trim();
    if (typeof val === "object") {
      if (typeof val.url === "string") return val.url.trim();
      if (typeof val.src === "string") return val.src.trim();
      if (typeof val.image === "string") return val.image.trim();
    }
    return "";
  };

  const mainImg =
    extractUrl(p.image) ||
    extractUrl(p.mainImage) ||
    extractUrl(p.img) ||
    (Array.isArray(p.images) && extractUrl(p.images[0])) ||
    (Array.isArray(p.galleryImages) && extractUrl(p.galleryImages[0])) ||
    (Array.isArray(p.variants) && (extractUrl(p.variants[0]?.mainImage) || extractUrl(p.variants[0]?.image) || extractUrl(p.variants[0]?.thumbnail))) ||
    (Array.isArray(p.variations) && (extractUrl(p.variations[0]?.thumbnail) || extractUrl(p.variations[0]?.mainImage) || extractUrl(p.variations[0]?.image))) ||
    (Array.isArray(p.colors) && (extractUrl(p.colors[0]?.mainImage) || extractUrl(p.colors[0]?.displayImage))) ||
    "";

  const wishlisted = isWishlisted(productId);

  const regPrice = Number(p.originalPrice || p.regularPrice || p.price || 0);
  const finalPrice = Number(p.price || 0);
  const hasDiscount = regPrice > finalPrice;
  const discountVal = p.discountPercentage !== undefined
    ? Number(p.discountPercentage)
    : hasDiscount
    ? Math.round(((regPrice - finalPrice) / regPrice) * 100)
    : 0;

  const badgeTag = p.defaultKey || p.badge || (p.labels?.bestSeller ? "Best Seller" : p.labels?.newArrival ? "New" : "");

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
      colorName: (p.colors && p.colors[0]?.colorName) || "Standard",
      colorHex: (p.colors && p.colors[0]?.colorHex) || "#000000",
      size: (p.sizes && p.sizes[0]) || (p.availableSizes && p.availableSizes[0]) || "Standard Pair",
      price: finalPrice,
      originalPrice: regPrice > 0 ? regPrice : finalPrice,
      image: mainImg,
      sku: p.sku || p.defaultSku || `AH-${p.id}`,
      quantity: 1,
    });
  };

  return (
    <div className="group flex flex-col bg-transparent cursor-pointer select-none">
      {/* Image Wrapper with Smooth Right-to-Left Gallery Auto-Slider on Hover */}
      <div onClick={handleImageClick} className="cursor-pointer">
        <ProductHoverSlider
          product={p}
          alt={p.name}
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
        <Link to={`/product/${p.id}`} className="hover:text-[#520618] transition-colors">
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
