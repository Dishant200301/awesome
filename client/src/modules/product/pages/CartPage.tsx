import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Minus, Plus } from "lucide-react";
import CheckoutHeader from "@/modules/checkout/components/CheckoutHeader";
import Footer from "@/modules/core/components/Footer";
import { useCart } from "../context/CartContext";
import { useAuth } from "@/modules/core/context/AuthContext";

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, openAuthModal } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();

  const handleProceedToCheckout = () => {
    if (isLoggedIn) {
      navigate("/checkout");
    } else {
      openAuthModal("/checkout");
    }
  };
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponMessage({ type: "error", text: "Please enter a valid coupon code." });
      return;
    }
    const code = couponCode.trim().toUpperCase();
    if (code === "HANDMADE10" || code === "FIRST10") {
      setDiscount(0.1);
      setCouponMessage({ type: "success", text: "Coupon code applied! 10% discount added." });
    } else {
      setCouponMessage({ type: "error", text: "Invalid coupon code. Try HANDMADE10" });
    }
  };

  const discountAmount = totalPrice * discount;
  const finalTotal = Math.max(0, totalPrice - discountAmount);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col selection:bg-black selection:text-white">
      <CheckoutHeader activeStep={1} />

      {/* Main Cart Content */}
      <section className="bg-white py-12 sm:py-16 flex-1">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          {cartItems.length === 0 ? (
            /* Empty Cart View matching Hervia Tea 1:1 */
            <div className="py-16 sm:py-24 text-center max-w-xl mx-auto space-y-6">
              {/* Sad face in black circle */}
              <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-zinc-900 flex items-center justify-center text-white shadow-md">
                <svg
                  className="w-14 h-14 sm:w-16 sm:h-16 fill-none stroke-current stroke-[1.5]"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="9" cy="9" r="1" fill="currentColor" />
                  <circle cx="15" cy="9" r="1" fill="currentColor" />
                  <path
                    d="M16 16c-1.333-1.333-2.667-2-4-2s-2.667.667-4 2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7.5 12.5c0 .5-.4 1-.9 1s-.9-.5-.9-1c0-.6.9-1.5.9-1.5s.9.9.9 1.5z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl text-zinc-900 font-normal">
                Your cart is currently empty!
              </h2>

              <div>
                <Link to="/shop">
                  <button
                    type="button"
                    className="px-8 py-3.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold tracking-[0.18em] uppercase transition-colors shadow-sm cursor-pointer"
                  >
                    RETURN TO SHOP
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            /* Cart Page with Items matching Hervia Tea Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Cart Items Table (8 cols) */}
              <div className="lg:col-span-8 space-y-8">
                {/* Mobile View Card List (< sm) */}
                <div className="block sm:hidden divide-y divide-zinc-200 border-t border-b border-zinc-200">
                  {cartItems.map((it) => (
                    <div key={it.id} className="py-5 relative flex flex-col gap-4">
                      {/* Remove Icon */}
                      <button
                        onClick={() => removeFromCart(it.id)}
                        aria-label="Remove item"
                        className="absolute top-4 right-0 p-1 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                      >
                        <X className="h-5 w-5 stroke-[1.5]" />
                      </button>

                      <div className="flex items-center gap-4 pr-8">
                        <img
                          src={it.image}
                          alt={it.productName}
                          className="h-20 w-20 object-cover shrink-0 rounded-lg border border-zinc-200 bg-zinc-50"
                        />
                        <div className="grow min-w-0">
                          <Link
                            to={`/product/${it.productId}`}
                            className="font-bold text-base text-zinc-900 hover:text-[#520618] transition-colors block mb-1 line-clamp-2"
                          >
                            {it.productName}
                          </Link>
                          <span className="text-xs text-zinc-500 block mb-1">
                            {it.colorName && `Color: ${it.colorName}`}
                            {it.size && ` • Size: ${it.size}`}
                          </span>
                          <span className="font-bold text-zinc-900 text-sm block">
                            ₹{it.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Stepper & Subtotal on Mobile */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="inline-flex items-center border border-zinc-300 rounded-md overflow-hidden">
                          <button
                            onClick={() => updateQuantity(it.id, it.quantity - 1)}
                            className="px-3 py-1.5 text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                          <span className="px-4 py-1.5 text-xs font-bold text-zinc-900 min-w-8 text-center">
                            {it.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(it.id, it.quantity + 1)}
                            className="px-3 py-1.5 text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                        </div>

                        <span className="font-bold text-zinc-900 text-base">
                          ₹{(it.price * it.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet & Desktop View Table (>= sm) */}
                <table className="hidden sm:table w-full text-sm">
                  <thead className="border-b border-zinc-200 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="py-3">Product</th>
                      <th className="py-3">Price</th>
                      <th className="py-3 text-center">Quantity</th>
                      <th className="py-3 text-right">Subtotal</th>
                      <th className="py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {cartItems.map((it) => (
                      <tr key={it.id}>
                        <td className="py-5">
                          <div className="flex items-center gap-4">
                            <img
                              src={it.image}
                              alt={it.productName}
                              className="h-20 w-20 object-cover shrink-0 rounded-xl border border-zinc-200 bg-zinc-50"
                            />
                            <div>
                              <Link
                                to={`/product/${it.productId}`}
                                className="font-bold text-base text-zinc-900 hover:text-[#520618] transition-colors block"
                              >
                                {it.productName}
                              </Link>
                              <span className="text-xs text-zinc-500 font-medium mt-0.5 block">
                                {it.colorName && `Color: ${it.colorName}`}
                                {it.size && ` • Size: ${it.size}`}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 font-bold text-zinc-900 text-base">
                          ₹{it.price.toLocaleString("en-IN")}
                        </td>
                        <td className="py-5 text-center">
                          <div className="inline-flex items-center border border-zinc-300 rounded-md overflow-hidden">
                            <button
                              onClick={() => updateQuantity(it.id, it.quantity - 1)}
                              className="px-3 py-2 text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5 stroke-[1.5]" />
                            </button>
                            <span className="px-4 py-2 text-sm font-bold text-zinc-900 min-w-10 text-center">
                              {it.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(it.id, it.quantity + 1)}
                              className="px-3 py-2 text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
                            </button>
                          </div>
                        </td>
                        <td className="py-5 text-right font-bold text-zinc-900 text-base">
                          ₹{(it.price * it.quantity).toLocaleString("en-IN")}
                        </td>
                        <td className="py-5 text-right">
                          <button
                            onClick={() => removeFromCart(it.id)}
                            aria-label="Remove item"
                            className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                          >
                            <X className="h-5 w-5 stroke-[1.5]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Bottom Form Row: Coupon Code & Update Cart */}
                <div className="space-y-3 pt-4 border-t border-zinc-200">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon code"
                        className="border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors w-full sm:w-56 rounded-md"
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors rounded-md"
                      >
                        APPLY COUPON
                      </button>
                    </form>

                    <button
                      type="button"
                      onClick={() =>
                        setCouponMessage({ type: "success", text: "Shopping cart updated." })
                      }
                      className="px-6 py-3 bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-900 text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors rounded-md"
                    >
                      UPDATE CART
                    </button>
                  </div>

                  {couponMessage && (
                    <p
                      className={`text-xs font-semibold ${
                        couponMessage.type === "success" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {couponMessage.text}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Cart Totals Box (4 cols) */}
              <div className="lg:col-span-4 border border-zinc-200 p-6 sm:p-8 bg-zinc-50/50 rounded-2xl space-y-6">
                <h3 className="font-display text-2xl text-zinc-900 font-normal border-b border-zinc-200 pb-4">
                  Cart Totals
                </h3>

                <div className="space-y-4 text-sm text-zinc-800">
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-200/80">
                    <span className="font-semibold text-zinc-900">Subtotal</span>
                    <span className="font-bold text-zinc-900 text-base">
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-200/80 text-emerald-600">
                      <span className="font-semibold">Discount (10%)</span>
                      <span className="font-bold">
                        -₹{discountAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pb-3 border-b border-zinc-200/80">
                    <span className="font-semibold text-zinc-900">Shipping</span>
                    <span className="text-xs text-zinc-500 font-medium">
                      Calculated at checkout
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 font-bold text-xl text-zinc-900">
                    <span>Total</span>
                    <span>₹{finalTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    className="w-full py-4 bg-zinc-900 hover:bg-black text-white text-xs font-bold tracking-[0.18em] uppercase cursor-pointer transition-all shadow-md rounded-md"
                  >
                    PROCEED TO CHECKOUT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CartPage;
