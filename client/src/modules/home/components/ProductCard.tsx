import React from "react";
import { FiHeart, FiShoppingBag, FiEye } from "react-icons/fi";
import { Plus, Minus } from "lucide-react";
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

  const skuMap: Record<string, string> = {
    p1: "#1102", p2: "#1354", p3: "#1498", p4: "#1532",
    p5: "#1722", p6: "#1811", p7: "#1902", p8: "#1988",
    p9: "#2105", p10: "#2341", p11: "#2410", p12: "#2490",
    p13: "#2509", p14: "#2718", p15: "#2901", p16: "#2950",
    p17: "#3104", p18: "#3312", p19: "#3420", p20: "#3550"
  };
  const sku = p.code || skuMap[String(p.id)] || `#${String(p.id).toUpperCase()}`;

  const mainImg = p.img || p.image || (p.images && p.images[0]) || "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=600";
  const hoverImg = p.hoverImg || p.hoverImage || mainImg;
  const wishlisted = isWishlisted(String(p.id));

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(String(p.id));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: String(p.id),
      productName: p.name,
      brand: p.brand || "Awesome Handmade",
      colorName: "Standard",
      colorHex: "#000000",
      size: (p.sizes && p.sizes[0]) || "S",
      price: p.price,
      originalPrice: p.originalPrice || Math.round(p.price * 1.4),
      image: mainImg,
      sku: sku,
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
          {/* SKU Number */}
          <p className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase">{sku}</p>

          {/* Product Title */}
          <h3 className="mt-1 text-sm sm:text-base font-bold text-zinc-900 line-clamp-2 leading-snug">
            {p.name}
          </h3>
        </Link>

        {/* Price & Add To Bag Button / Quantity Stepper */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-base sm:text-lg font-bold text-zinc-900">
            ₹{p.price.toLocaleString("en-IN")}.00
          </span>

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
