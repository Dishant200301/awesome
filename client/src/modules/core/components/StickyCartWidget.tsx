import React, { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/modules/product/context/CartContext";

export const StickyCartWidget: React.FC = () => {
  const { totalItemsCount, totalPrice, setIsCartOpen, isCartOpen } = useCart();
  const [hasBounced, setHasBounced] = useState(false);

  // Trigger bounce micro-animation whenever items count updates
  useEffect(() => {
    if (totalItemsCount > 0) {
      setHasBounced(true);
      const timer = setTimeout(() => setHasBounced(false), 900);
      return () => clearTimeout(timer);
    }
  }, [totalItemsCount]);

  // Hide widget while the drawer is open to prevent overlap
  if (isCartOpen) return null;

  return (
    <div
      className="fixed right-3 sm:right-6 bottom-20 sm:bottom-8 z-40 print:hidden font-sans"
    >
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        aria-label={`Open shopping cart (${totalItemsCount} items)`}
        className={`group flex items-center gap-2.5 bg-neutral-950/95 hover:bg-black text-white pl-3.5 pr-4 py-2.5 sm:py-3 rounded-full shadow-[0_10px_25px_-5px_rgba(0,0,0,0.35)] border border-amber-400/40 backdrop-blur-md transition-all duration-300 cursor-pointer ${
          hasBounced ? "scale-110 ring-4 ring-amber-400/30" : "scale-100 hover:scale-105 active:scale-95"
        }`}
      >
        {/* Shopping Icon + Badge */}
        <div className="relative flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-amber-300 group-hover:text-amber-200 transition-colors stroke-[2]" />
          {totalItemsCount > 0 && (
            <span className="absolute -top-2 -right-2.5 bg-rose-600 text-white text-[10px] font-extrabold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
              {totalItemsCount > 9 ? "9+" : totalItemsCount}
            </span>
          )}
        </div>

        {/* Text & Total Price */}
        <div className="flex flex-col text-left leading-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
            {totalItemsCount > 0 ? `Cart (${totalItemsCount})` : "Cart"}
          </span>
          {totalPrice > 0 ? (
            <span className="text-xs font-semibold text-white mt-0.5">
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>
          ) : (
            <span className="text-[10px] text-neutral-400 mt-0.5">
              View Bag
            </span>
          )}
        </div>
      </button>
    </div>
  );
};

export default StickyCartWidget;
