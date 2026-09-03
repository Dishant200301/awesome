import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/modules/core/context/AuthContext";
import { getLiveProductsList, subscribeToProductStore } from "@/modules/core/lib/apiStore";

interface WishlistContextType {
  wishlistIds: string[];
  addToWishlist: (productId: string | number) => void;
  removeFromWishlist: (productId: string | number) => void;
  toggleWishlist: (productId: string | number) => void;
  isWishlisted: (productId: string | number) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

import { API_BASE_URL } from "@/modules/core/lib/apiStore";

const LOCAL_STORAGE_KEY = "awesome_wishlist_v1";

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, user } = useAuth();

  const [rawWishlistIds, setRawWishlistIds] = useState<string[]>(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("aaramly_wishlist_v1");
      }
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(String).filter((id: string) => !id.startsWith("prod-1") && id !== "prod-2" && id !== "prod-3");
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [catalogProducts, setCatalogProducts] = useState<any[]>(() => getLiveProductsList());

  useEffect(() => {
    const syncCatalog = () => {
      setCatalogProducts(getLiveProductsList());
    };
    syncCatalog();
    return subscribeToProductStore(syncCatalog);
  }, []);

  // Filter rawWishlistIds to ensure only valid existing catalog products count
  const wishlistIds = useMemo(() => {
    const cleaned = rawWishlistIds.filter((id: string) => id !== "prod-1");
    if (!catalogProducts || catalogProducts.length === 0) {
      return cleaned;
    }
    const catalogSet = new Set(catalogProducts.map((p) => String(p.id)));
    return cleaned.filter((id: string) => catalogSet.has(String(id)));
  }, [rawWishlistIds, catalogProducts]);

  const wasLoggedInRef = useRef(isLoggedIn);

  // Local storage persistence (guest & logged-in cache)
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  // Logged-in Sync & Merge
  useEffect(() => {
    const handleAuthSync = async () => {
      if (isLoggedIn) {
        if (!wasLoggedInRef.current) {
          try {
            const savedLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
            const localIds: string[] = savedLocal ? JSON.parse(savedLocal) : [];
            const filteredLocal = localIds.filter((id: string) => id !== "prod-1");
            if (filteredLocal.length > 0) {

              await fetch(`${API_BASE_URL}/wishlist/merge`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${user?.email || "token"}`,
                },
                body: JSON.stringify({ wishlistIds: filteredLocal }),
              });
            }
          } catch (err) {
            console.warn("Wishlist merge warning:", err);
          }
        }

        try {
          const res = await fetch(`${API_BASE_URL}/wishlist`, {
            headers: {
              Authorization: `Bearer ${user?.email || "token"}`,
            },
          });
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setRawWishlistIds(json.data.map(String).filter((id: string) => id !== "prod-1"));
          }

        } catch (err) {
          console.warn("Wishlist fetch warning:", err);
        }
      }

      wasLoggedInRef.current = isLoggedIn;
    };

    handleAuthSync();
  }, [isLoggedIn, user]);

  const addToWishlist = (productId: string | number) => {
    const strId = String(productId);
    setRawWishlistIds((prev) => (prev.includes(strId) ? prev : [...prev, strId]));

    if (isLoggedIn) {
      fetch(`${API_BASE_URL}/wishlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.email || "token"}`,
        },
        body: JSON.stringify({ productId: strId }),
      }).catch((e) => console.warn("Wishlist sync error:", e));
    }
  };

  const removeFromWishlist = (productId: string | number) => {
    const strId = String(productId);
    setRawWishlistIds((prev) => prev.filter((id) => String(id) !== strId));

    if (isLoggedIn) {
      fetch(`${API_BASE_URL}/wishlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.email || "token"}`,
        },
        body: JSON.stringify({ productId: strId }),
      }).catch((e) => console.warn("Wishlist sync error:", e));
    }
  };


  const toggleWishlist = (productId: string | number) => {
    const strId = String(productId);
    if (wishlistIds.includes(strId)) {
      removeFromWishlist(strId);
    } else {
      addToWishlist(strId);
    }
  };

  const isWishlisted = (productId: string | number) => {
    const strId = String(productId);
    return wishlistIds.includes(strId);
  };

  const wishlistCount = useMemo(() => wishlistIds.length, [wishlistIds]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
