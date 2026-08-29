import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShoppingBag, Lock, Minus, Plus } from "lucide-react";
import { useCart } from "@/modules/product/context/CartContext";
import { useAuth } from "@/modules/core/context/AuthContext";
import { getLiveProductsList, subscribeToProductStore } from "@/modules/core/lib/apiStore";

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, totalPrice, totalItemsCount, addToCart } = useCart();
  const { isLoggedIn, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [liveProducts, setLiveProducts] = useState(() => getLiveProductsList());

  useEffect(() => {
    const unsub = subscribeToProductStore(() => {
      setLiveProducts(getLiveProductsList());
    });
    return unsub;
  }, []);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  // Generate recommended products list
  const recommendedProducts = React.useMemo(() => {
    if (liveProducts && liveProducts.length > 0) {
      return liveProducts.slice(0, 3);
    }
    // Fallback high quality products
    return [
      {
        id: "rec-1",
        name: "CONTRAST TIPPING POLO - SKY BLUE",
        price: 2279,
        originalPrice: 2399,
        image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80",
        size: "S"
      },
      {
        id: "rec-2",
        name: "CONTRAST TIPPING POLO - LAVENDER",
        price: 2279,
        originalPrice: 2399,
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80",
        size: "M"
      },
      {
        id: "rec-3",
        name: "CONTRAST TIPPING POLO - SAGE GREEN",
        price: 2279,
        originalPrice: 2399,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
        size: "L"
      }
    ];
  }, [liveProducts]);

  const handleAddRecommended = (prod: any) => {
    addToCart({
      productId: prod.id,
      productName: prod.name || prod.title || "Handcrafted Latkan",
      brand: prod.brand || "Awesome Handmade",
      price: prod.price || prod.salePrice || 799,
      originalPrice: prod.originalPrice || prod.regularPrice || 2399,
      image: prod.image || prod.mainImage || (prod.images && prod.images[0]) || "/images/category/Latkan.webp",
      quantity: 1,
      size: prod.size || "Free Size",
      colorName: prod.color || prod.colorName || "Maroon",
      colorHex: prod.colorHex || "#520618",
      sku: prod.sku || `AH-${prod.id}`
    });
  };

  const formattedTotalPrice = `RS. ${totalPrice.toLocaleString("en-IN")}.00`;

  return (
    <div
      className={`fixed inset-0 z-[100] transition-all duration-300 ${
        isCartOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-2xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-over Drawer Panel */}
      <aside
        className={`absolute right-0 top-0 flex h-full max-h-screen w-full sm:w-auto max-w-[100vw] transition-transform duration-300 ease-out z-50 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ========================================================================= */}
        {/* DESKTOP SIDEBAR: YOU MAY ALSO LIKE (Visible on md: & lg: screens) */}
        {/* ========================================================================= */}
        <div className="hidden md:flex flex-col w-64 bg-[#f5f5f7] border-r border-neutral-200 overflow-y-auto p-5 space-y-6 shrink-0 font-sans">
          <h3 className="text-xs font-bold text-neutral-800 tracking-[0.18em] uppercase text-center border-b border-neutral-200/80 pb-3">
            YOU MAY ALSO LIKE
          </h3>

          <div className="space-y-6">
            {recommendedProducts.map((prod) => {
              const img = prod.image || prod.mainImage || (prod.images && prod.images[0]);
              const title = prod.name || prod.title;
              const saleP = prod.price || prod.salePrice || 2279;
              const regP = prod.originalPrice || prod.regularPrice || 2399;

              return (
                <div
                  key={prod.id}
                  onClick={() => handleAddRecommended(prod)}
                  className="group flex flex-col items-center text-center cursor-pointer transition-all hover:opacity-90"
                >
                  <div className="w-40 h-52 overflow-hidden bg-white border border-neutral-200 rounded-none mb-3 shadow-2xs">
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-tight line-clamp-2 px-1 mb-1">
                    {title}
                  </h4>

                  <div className="flex items-center justify-center gap-2 text-xs font-bold">
                    <span className="text-neutral-900">Rs. {saleP.toLocaleString("en-IN")}.00</span>
                    {regP > saleP && (
                      <span className="text-neutral-400 line-through font-normal">
                        Rs. {regP.toLocaleString("en-IN")}.00
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN CART DRAWER PANEL (Mobile & Laptop Item List + Checkout) */}
        {/* ========================================================================= */}
        <div className="w-full sm:w-[420px] max-w-[100vw] bg-white flex flex-col h-full shadow-2xl font-sans relative overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 sm:px-6 py-4 bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-neutral-900 stroke-[1.75]" />
              <span className="text-sm sm:text-base font-bold text-neutral-900">
                {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
              </span>
            </div>

            <button
              type="button"
              aria-label="Close cart"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>

          {/* Cart Body Scroll Container */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 overflow-x-hidden">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-neutral-300 stroke-[1.2]" />
                <p className="text-sm font-semibold text-neutral-600">Your shopping cart is empty.</p>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {cartItems.map((it) => {
                  const saleP = it.price;
                  const regP = it.originalPrice || Math.round(it.price * 1.1);

                  // Color-specific product title formatting (e.g., "PRODUCT NAME - COLOR")
                  let displayTitle = it.productName || "PRODUCT";
                  if (it.colorName && it.colorName !== "Default" && !displayTitle.toLowerCase().includes(it.colorName.toLowerCase())) {
                    displayTitle = `${displayTitle} - ${it.colorName}`;
                  }

                  return (
                    <li key={it.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex gap-3 sm:gap-4 items-start">
                        {/* Item Thumbnail */}
                        <div className="w-18 h-22 sm:w-20 sm:h-24 shrink-0 bg-neutral-100 border border-neutral-200 overflow-hidden rounded-lg">
                          <img
                            src={it.image}
                            alt={displayTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-tight leading-snug line-clamp-2">
                            {displayTitle}
                          </h3>

                          {it.size && (
                            <p className="text-xs font-semibold text-neutral-500 uppercase">
                              {it.size}
                            </p>
                          )}

                          {/* Prices */}
                          <div className="flex items-center gap-2 text-xs font-bold pt-0.5">
                            <span className="text-neutral-900">
                              Rs. {saleP.toLocaleString("en-IN")}.00
                            </span>
                            {regP > saleP && (
                              <span className="text-neutral-400 line-through font-normal">
                                Rs. {regP.toLocaleString("en-IN")}.00
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls Pill + Remove Button */}
                          <div className="flex items-center gap-3 pt-2">
                            <div className="flex items-center border border-neutral-300 rounded-md bg-white">
                              <button
                                type="button"
                                onClick={() => updateQuantity(it.id, it.quantity - 1)}
                                className="px-2 py-1 text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 text-xs font-bold text-neutral-900">
                                {it.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(it.id, it.quantity + 1)}
                                className="px-2 py-1 text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(it.id)}
                              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 underline underline-offset-2 transition-colors cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* ========================================================================= */}
            {/* MOBILE & TABLET INLINE SECTION: YOU MAY ALSO LIKE (Visible on sm: and below) */}
            {/* ========================================================================= */}
            <div className="block md:hidden pt-4 border-t border-neutral-200">
              <div className="bg-[#f5f5f7] p-3.5 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-neutral-800 tracking-[0.14em] uppercase">
                  YOU MAY ALSO LIKE
                </h4>

                <div className="space-y-2.5">
                  {recommendedProducts.slice(0, 2).map((prod) => {
                    const img = prod.image || prod.mainImage || (prod.images && prod.images[0]);
                    const title = prod.name || prod.title;
                    const saleP = prod.price || prod.salePrice || 2279;
                    const regP = prod.originalPrice || prod.regularPrice || 2399;

                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleAddRecommended(prod)}
                        className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-neutral-200 cursor-pointer active:scale-98 transition-transform overflow-hidden shadow-2xs"
                      >
                        <img
                          src={img}
                          alt={title}
                          className="w-12 h-14 object-cover rounded-lg shrink-0 bg-neutral-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-neutral-900 uppercase truncate">
                            {title}
                          </h5>
                          <div className="flex items-center gap-2 text-xs font-bold mt-1">
                            <span className="text-neutral-900">Rs. {saleP.toLocaleString("en-IN")}.00</span>
                            {regP > saleP && (
                              <span className="text-neutral-400 line-through font-normal text-[11px]">
                                Rs. {regP.toLocaleString("en-IN")}.00
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Checkout Section */}
          {cartItems.length > 0 && (
            <div className="border-t border-neutral-200 p-4 sm:p-6 space-y-3 bg-white shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  if (isLoggedIn) {
                    navigate("/cart");
                  } else {
                    openAuthModal("/cart");
                  }
                }}
                className="w-full py-3.5 sm:py-4 bg-[#212121] hover:bg-black text-white font-bold text-xs uppercase tracking-[0.15em] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-98 rounded-lg sm:rounded-none"
              >
                <span>CHECKOUT &bull; {formattedTotalPrice}</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default CartDrawer;