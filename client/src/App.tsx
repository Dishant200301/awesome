import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import HomePage from "@/modules/home/pages/HomePage";

const ProductDetailsPage = lazy(() => import("@/modules/product/pages/ProductDetailsPage"));
const ShopPage = lazy(() => import("@/modules/product/pages/ShopPage"));
const WishlistPage = lazy(() => import("@/modules/product/pages/WishlistPage"));
const CartPage = lazy(() => import("@/modules/product/pages/CartPage"));
const CheckoutPage = lazy(() => import("@/modules/checkout/pages/CheckoutPage"));
const OrderSuccessPage = lazy(() => import("@/modules/checkout/pages/OrderSuccessPage"));
const AccountPage = lazy(() => import("@/modules/user/pages/AccountPage"));
const ContactPage = lazy(() => import("@/modules/contact/pages/ContactPage"));
const NotFound = lazy(() => import("@/modules/core/components/NotFound"));

import ScrollToTop from "@/modules/core/components/ScrollToTop";
import CartDrawer from "@/modules/core/components/CartDrawer";
import StickyCartWidget from "@/modules/core/components/StickyCartWidget";
import AuthModal from "@/modules/core/components/AuthModal";
import { CartProvider } from "@/modules/product/context/CartContext";
import { WishlistProvider } from "@/modules/product/context/WishlistContext";
import { RecentlyViewedProvider } from "@/modules/product/context/RecentlyViewedContext";
import { AuthProvider } from "@/modules/core/context/AuthContext";
import { QuickViewProvider } from "@/modules/product/context/QuickViewContext";
import MobileProductQuickViewSheet from "@/modules/product/components/MobileProductQuickViewSheet";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <QuickViewProvider>
              <BrowserRouter>
                <ScrollToTop />
                <Toaster position="top-center" richColors />
                <CartDrawer />
                <StickyCartWidget />
                <AuthModal />
                <MobileProductQuickViewSheet />
                <Suspense fallback={<div className="min-h-screen bg-white" />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/categories" element={<ShopPage />} />
                    <Route path="/collections" element={<ShopPage />} />
                    <Route path="/collections/:categorySlug" element={<ShopPage />} />
                    <Route path="/collection/:categorySlug" element={<ShopPage />} />
                    <Route path="/category/:categorySlug" element={<ShopPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/login" element={<AccountPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/contact-us" element={<ContactPage />} />
                    <Route path="/product" element={<ProductDetailsPage />} />
                    <Route path="/product-details" element={<ProductDetailsPage />} />
                    <Route path="/product/:id" element={<ProductDetailsPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </QuickViewProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

