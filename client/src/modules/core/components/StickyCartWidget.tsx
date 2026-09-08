import React from "react";
import { useLocation } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/modules/product/context/CartContext";

export const StickyCartWidget: React.FC = () => {
  const { totalItemsCount, totalPrice, setIsCartOpen, isCartOpen } = useCart();
  const location = useLocation();

  // Hide on checkout, cart, or order-success pages
  const isCheckoutOrCartPage =
    location.pathname.startsWith("/checkout") ||
    location.pathname.startsWith("/order-success") ||
    location.pathname === "/cart";

  // Hide widget completely when on checkout/cart pages, when cart is empty, or when drawer is open
  if (totalItemsCount <= 0 || isCartOpen || isCheckoutOrCartPage) return null;

  const itemText = totalItemsCount === 1 ? "Item" : "Items";
  const formattedPrice = `₹${totalPrice.toLocaleString("en-IN")}.00`;

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 print:hidden font-sans select-none">
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        aria-label={`Open shopping cart with ${totalItemsCount} ${itemText}`}
        className="flex flex-col items-center justify-center bg-[#212121] text-white pt-2.5 pb-2 px-2.5 sm:px-3 rounded-l-xl shadow-[-4px_4px_18px_rgba(0,0,0,0.35)] border-t border-b border-l border-neutral-700/50 cursor-pointer"
      >
        {/* Top: Shopping Bag Icon + Count & Item text */}
        <div className="flex items-center gap-2 px-1">
          <ShoppingBag className="w-5 h-5 text-white stroke-[2] shrink-0" />
          <div className="flex flex-col items-center leading-none">
            <span className="text-xs sm:text-sm font-extrabold text-white">
              {totalItemsCount}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-neutral-200 mt-0.5">
              {itemText}
            </span>
          </div>
        </div>

        {/* Bottom: White pill badge with Price */}
        <div className="mt-2 bg-white text-neutral-950 font-extrabold text-[11px] sm:text-xs px-2.5 py-1 rounded-md shadow-xs whitespace-nowrap tracking-tight">
          {formattedPrice}
        </div>
      </button>
    </div>
  );
};

export default StickyCartWidget;
