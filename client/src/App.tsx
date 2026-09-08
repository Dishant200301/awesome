import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import ProductDetailsPage from "@/modules/product/pages/ProductDetailsPage";
import ShopPage from "@/modules/product/pages/ShopPage";
import HomePage from "@/modules/home/pages/HomePage";
import WishlistPage from "@/modules/product/pages/WishlistPage";
import CartPage from "@/modules/product/pages/CartPage";
import CheckoutPage from "@/modules/checkout/pages/CheckoutPage";
import OrderSuccessPage from "@/modules/checkout/pages/OrderSuccessPage";
import AccountPage from "@/modules/user/pages/AccountPage";
import ContactPage from "@/modules/contact/pages/ContactPage";
import NotFound from "@/modules/core/components/NotFound";
import ScrollToTop from "@/modules/core/components/ScrollToTop";
import CartDrawer from "@/modules/core/components/CartDrawer";
import StickyCartWidget from "@/modules/core/components/StickyCartWidget";
import AuthModal from "@/modules/core/components/AuthModal";
import { CartProvider } from "@/modules/product/context/CartContext";
import { WishlistProvider } from "@/modules/product/context/WishlistContext";
import { RecentlyViewedProvider } from "@/modules/product/context/RecentlyViewedContext";
import { CompareProvider } from "@/modules/product/context/CompareContext";
import { AuthProvider } from "@/modules/core/context/AuthContext";
import { QuickViewProvider } from "@/modules/product/context/QuickViewContext";
import MobileProductQuickViewSheet from "@/modules/product/components/MobileProductQuickViewSheet";
import DesktopProductQuickViewModal from "@/modules/product/components/DesktopProductQuickViewModal";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <CompareProvider>
              <QuickViewProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <Toaster position="top-center" richColors />
                  <CartDrawer />
                  <StickyCartWidget />
                  <AuthModal />
                  <MobileProductQuickViewSheet />
                  <DesktopProductQuickViewModal />
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
                </BrowserRouter>
              </QuickViewProvider>
            </CompareProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

