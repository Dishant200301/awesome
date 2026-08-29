import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { X, ShoppingBag, ChevronRight } from "lucide-react";
import Navbar from "@/modules/core/components/Navbar";
import Footer from "@/modules/core/components/Footer";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import {
  fetchLiveProducts,
  subscribeToProductStore,
  getLiveProductsList,
} from "@/modules/core/lib/apiStore";

export const WishlistPage: React.FC = () => {
  const { wishlistIds, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState<any[]>(() => getLiveProductsList());

  useEffect(() => {
    fetchLiveProducts().then(() => {
      setAllProducts(getLiveProductsList());
    });
    return subscribeToProductStore(() => {
      setAllProducts(getLiveProductsList());
    });
  }, []);

  const wishlistedProducts = useMemo(() => {
    const idStrings = wishlistIds.map((id) => String(id));
    return allProducts.filter((p) => p && p.id !== undefined && idStrings.includes(String(p.id)));
  }, [allProducts, wishlistIds]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col selection:bg-black selection:text-white">
      <Navbar />

      {/* Top Breadcrumb Section */}
      <section className="pt-24 pb-4 bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <Link to="/" className="hover:text-zinc-900 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5]" />
            <span className="text-zinc-900 font-bold">Wishlist</span>
          </nav>
        </div>
      </section>

      {/* Main Wishlist Content */}
      <section className="bg-white py-12 sm:py-16 flex-1">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 font-display text-3xl sm:text-4xl text-zinc-900 font-normal">
            My Wishlist
          </h1>

          {wishlistedProducts.length === 0 ? (
            /* Empty State matching Hervia 1:1 */
            <div className="border border-zinc-200 p-12 sm:p-16 text-center rounded-2xl max-w-2xl mx-auto space-y-4">
              <p className="text-sm font-medium text-zinc-500">Your wishlist is empty.</p>
              <div>
                <Link to="/shop" className="inline-block">
                  <button
                    type="button"
                    className="px-8 py-3.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase tracking-[0.16em] cursor-pointer transition-colors shadow-sm rounded-md"
                  >
                    Shop Now
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout (< sm) */}
              <div className="block sm:hidden divide-y divide-zinc-200 border-t border-b border-zinc-200">
                {wishlistedProducts.map((w) => {
                  const mainImg =
                    w.image ||
                    (w.images && w.images[0]) ||
                    "https://m.media-amazon.com/images/I/71LtEuQjqXL._SL1500_.jpg";

                  return (
                    <div key={w.id} className="py-5 relative flex flex-col gap-4">
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromWishlist(String(w.id))}
                        aria-label="Remove item"
                        className="absolute top-4 right-0 p-1 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                      >
                        <X className="h-5 w-5 stroke-[1.5]" />
                      </button>

                      {/* Image & Title & Price */}
                      <div className="flex items-center gap-4 pr-8">
                        <img
                          src={mainImg}
                          alt={w.name}
                          className="h-20 w-20 object-cover shrink-0 rounded-lg border border-zinc-200 bg-zinc-50"
                        />
                        <div className="grow min-w-0">
                          <Link
                            to={`/product/${w.id}`}
                            className="font-bold text-base text-zinc-900 hover:text-[#520618] line-clamp-2 transition-colors block mb-1"
                          >
                            {w.name}
                          </Link>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-bold text-zinc-900">
                              ₹{w.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              In Stock
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            addToCart({
                              productId: String(w.id),
                              productName: w.name,
                              brand: w.brand || "AOCIND",
                              colorName: "Maroon",
                              colorHex: "#800000",
                              size: (w.availableSizes && w.availableSizes[0]) || "Free Size",
                              price: w.price,
                              originalPrice: w.originalPrice || w.price,
                              image: mainImg,
                              sku: w.sku || "AOC-SKU",
                              quantity: 1,
                            })
                          }
                          className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-black text-white text-xs font-bold tracking-[0.15em] uppercase transition-colors rounded-md cursor-pointer"
                        >
                          <ShoppingBag className="h-4 w-4 stroke-[1.5] shrink-0" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tablet & Desktop Single Row Table Layout (>= sm) */}
              <table className="hidden sm:table w-full text-sm">
                <thead className="border-b border-zinc-200 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="py-3">Product</th>
                    <th className="py-3">Price</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-center"></th>
                    <th className="py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {wishlistedProducts.map((w) => {
                    const mainImg =
                      w.image ||
                      (w.images && w.images[0]) ||
                      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=600";

                    return (
                      <tr key={w.id}>
                        <td className="py-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={mainImg}
                              alt={w.name}
                              className="h-20 w-20 object-cover shrink-0 rounded-xl border border-zinc-200 bg-zinc-50"
                            />
                            <Link
                              to={`/product/${w.id}`}
                              className="font-bold text-base text-zinc-900 hover:text-[#520618] transition-colors"
                            >
                              {w.name}
                            </Link>
                          </div>
                        </td>
                        <td className="py-4 font-bold text-zinc-900 text-base">
                          ₹{w.price.toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 text-emerald-600 font-bold text-xs">In Stock</td>
                        <td className="py-4 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              addToCart({
                                productId: String(w.id),
                                productName: w.name,
                                brand: w.brand || "Awesome Handmade",
                                colorName: "Standard",
                                colorHex: "#C89B3C",
                                size: (w.availableSizes && w.availableSizes[0]) || "Free Size",
                                price: w.price,
                                originalPrice: w.originalPrice || w.price,
                                image: mainImg,
                                sku: w.sku || "AWH-SKU",
                                quantity: 1,
                              })
                            }
                            className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase tracking-[0.12em] whitespace-nowrap inline-flex items-center gap-2 rounded-md transition-colors cursor-pointer"
                          >
                            <ShoppingBag className="h-4 w-4 stroke-[1.5] shrink-0" />
                            <span>Add to Cart</span>
                          </button>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => removeFromWishlist(String(w.id))}
                            aria-label="Remove item"
                            className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                          >
                            <X className="h-5 w-5 stroke-[1.5]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WishlistPage;
