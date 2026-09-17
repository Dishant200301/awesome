import React from "react";
import { CartItem } from "@/modules/product/types/product";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CheckoutProductItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
}

export const CheckoutProductItem: React.FC<CheckoutProductItemProps> = ({
  item,
  onUpdateQuantity,
  onRemoveItem
}) => {
  // Max stock cap (default 10 if stock not specified)
  const maxStock = (item as any).stock !== undefined ? (item as any).stock : 10;
  const isMaxStockReached = item.quantity >= maxStock;

  const itemTotal = item.price * item.quantity;
  const originalTotal = (item.originalPrice || item.price) * item.quantity;
  const hasDiscount = item.originalPrice && item.originalPrice > item.price;

  return (
    <div className="py-3.5 flex items-start gap-3 border-b border-zinc-100 font-sans group relative">
      {/* PRODUCT IMAGE THUMBNAIL */}
      <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200/80 relative">
        <img
          src={item.image || "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&q=80&w=400"}
          alt={item.productName}
          className="w-full h-full object-cover object-top"
        />
       
      </div>

      {/* PRODUCT DETAILS */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-xs text-zinc-900 leading-snug line-clamp-2">
            {item.productName}
          </h4>
          <button
            type="button"
            onClick={() => onRemoveItem(item.id)}
            className="text-zinc-400 hover:text-red-600 transition-colors p-1 -mr-1"
            title="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* VARIANT ATTRIBUTES BADGES */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] text-zinc-500">
          {item.colorName && !["default", "none"].includes(item.colorName.toLowerCase()) && (
            <span className="bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 border border-zinc-200/60">
              <span className="w-2 h-2 rounded-full inline-block border border-zinc-300" style={{ backgroundColor: item.colorHex || "#000" }} />
              {item.colorName}
            </span>
          )}
          {item.size && !["standard pair", "free size", "default", "standard"].includes(item.size.toLowerCase()) && (
            <span className="bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-md font-bold border border-zinc-200/60">
              {item.size}
            </span>
          )}
          {item.sku && (
            <span className="font-mono text-[10px] text-zinc-400 font-normal">
              SKU: {item.sku}
            </span>
          )}
        </div>

        {/* QUANTITY CONTROLS & PRICE ROW */}
        <div className="flex items-center justify-between pt-2">
          {/* QUANTITY BUTTONS */}
          <div className="flex items-center gap-1.5 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
            <button
              type="button"
              disabled={item.quantity <= 1}
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="w-6 h-6 rounded-md bg-white text-zinc-800 flex items-center justify-center text-xs font-bold shadow-2xs hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-zinc-900">
              {item.quantity}
            </span>
            <button
              type="button"
              disabled={isMaxStockReached}
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-6 h-6 rounded-md bg-white text-zinc-800 flex items-center justify-center text-xs font-bold shadow-2xs hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title={isMaxStockReached ? `Maximum available stock (${maxStock}) reached` : "Increase quantity"}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* PRICE DISPLAY */}
          <div className="text-right">
            <span className="font-bold text-xs sm:text-sm text-zinc-900 block">
              ₹{itemTotal.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-zinc-400 line-through block">
                ₹{originalTotal.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutProductItem;
