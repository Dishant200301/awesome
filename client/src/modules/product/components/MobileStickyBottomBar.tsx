import React from "react";
import { FiShoppingBag } from "react-icons/fi";
import { Plus, Minus } from "lucide-react";
import { ProductColorVariation } from "../types/product";
import { useCart } from "../context/CartContext";

interface MobileStickyBottomBarProps {
  productId: string;
  productName: string;
  brand: string;
  activeVariation: ProductColorVariation;
  selectedSize: string;
}

export const MobileStickyBottomBar: React.FC<MobileStickyBottomBarProps> = ({
  productId,
  productName,
  brand,
  activeVariation,
  selectedSize,
}) => {
  const { cartItems, addToCart, updateQuantity, setIsCartOpen } = useCart();

  const productCartItems = cartItems.filter((i) => String(i.productId) === String(productId));
  const exactVariantItem = productCartItems.find(
    (i) =>
      (i.colorName || "").toLowerCase() === (activeVariation.colorName || "").toLowerCase() &&
      (i.size || "").toLowerCase() === selectedSize.toLowerCase()
  );
  const activeCartItem = exactVariantItem;
  const cartItemId = activeCartItem ? activeCartItem.id : `${productId}-${activeVariation.colorName}-${selectedSize}`;
  const inCartQuantity = exactVariantItem ? exactVariantItem.quantity : 0;

  const handleAdd = () => {
    addToCart({
      productId,
      productName,
      brand,
      colorName: activeVariation.colorName,
      colorHex: activeVariation.colorHex,
      size: selectedSize,
      price: activeVariation.price,
      originalPrice: activeVariation.originalPrice,
      image: activeVariation.thumbnail || activeVariation.images[0].url,
      sku: activeVariation.sku,
      quantity: 1,
    });
  };

  const handleBuyNow = () => {
    if (inCartQuantity === 0) {
      handleAdd();
    }
    setIsCartOpen(true);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 p-3 flex items-center justify-between gap-3 md:hidden shadow-2xl font-sans">
      {/* Price info */}
      <div className="flex flex-col shrink-0">
        <span className="text-[10px] font-extrabold bg-gradient-to-r from-[#E859B1] to-[#F7D85E] bg-clip-text text-transparent tracking-wider">
          -{activeVariation.discountPercentage}% OFF
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-base font-extrabold text-zinc-900">
            ₹{activeVariation.price}.00
          </span>
          <span className="text-xs text-zinc-400 line-through">
            ₹{activeVariation.originalPrice}
          </span>
        </div>
      </div>

      {/* CTAs matching Home Page button styles */}
      <div className="flex items-center gap-2 flex-1">
        {activeVariation.stock <= 0 ? (
          <button
            disabled
            className="w-full py-3.5 px-4 bg-zinc-200 text-zinc-500 text-xs font-bold tracking-wider rounded-full flex items-center justify-center gap-2 cursor-not-allowed uppercase shadow-2xs select-none"
          >
            Out of Stock
          </button>
        ) : inCartQuantity > 0 ? (
          <div className="w-full py-2.5 px-4 bg-[#1c1c1e] text-white rounded-full flex items-center justify-between shadow-md border border-zinc-800 font-sans">
            <button
              type="button"
              onClick={() => updateQuantity(cartItemId, inCartQuantity - 1)}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-black text-white px-2 min-w-[20px] text-center tracking-wider">
              {inCartQuantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(cartItemId, inCartQuantity + 1)}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            className="w-full py-3 px-4 bg-[#1c1c1e] hover:bg-black active:bg-black text-white text-xs font-bold tracking-wider rounded-full flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <FiShoppingBag size={13} className="stroke-[2.5]" />
            <span>Add To Bag</span>
          </button>
        )}

      </div>
    </div>
  );
};
