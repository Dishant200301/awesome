import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { CartItem } from "../types/product";
import { useAuth } from "@/modules/core/context/AuthContext";

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

import { API_BASE_URL } from "@/modules/core/lib/apiStore";

const LOCAL_STORAGE_KEY = "awesome_cart_v1";

export const isLegacyAaramlyItem = (item: any): boolean => {
  if (!item) return true;
  const str = `${item.name || ""} ${item.category || ""} ${item.subcategory || ""} ${item.sku || ""} ${item.image || ""} ${item.colorName || ""}`.toLowerCase();
  return (
    str.includes("panty") ||
    str.includes("bralette") ||
    str.includes("tactel") ||
    str.includes("innerwear") ||
    str.includes("lingerie") ||
    str.includes("seamless bra") ||
    str.includes("nipple cover") ||
    str.includes("stayfresh") ||
    str.includes("absorbent") ||
    str.includes("period") ||
    str.includes("aaramly") ||
    str.includes("underwear") ||
    item.productId === "prod-1" ||
    item.productId === "prod-2" ||
    item.productId === "prod-3" ||
    item.id === "prod-1" ||
    item.id === "prod-2" ||
    item.id === "prod-3"
  );
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, user } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("aaramly_cart_v1");
        localStorage.removeItem("aaramly_wishlist_v1");
        localStorage.removeItem("aaramly_recently_viewed_v1");
        localStorage.removeItem("aaramly_compare_v1");
        localStorage.removeItem("aaramly_orders_v1");
        localStorage.removeItem("aaramly_user_orders");
        localStorage.removeItem("aaramly_user_addresses");
        localStorage.removeItem("aaramly_user_session");
      }
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((item: CartItem) => !isLegacyAaramlyItem(item));
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const wasLoggedInRef = useRef(isLoggedIn);

  // Local storage persistence (guest & logged-in cache)
  useEffect(() => {
    try {
      const cleanItems = cartItems.filter((item) => !isLegacyAaramlyItem(item));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Logged in Sync & Guest Cart Merge logic
  useEffect(() => {
    const handleAuthSync = async () => {
      if (isLoggedIn) {
        // 1. If transitioning from logged-out to logged-in, merge local cart first
        if (!wasLoggedInRef.current) {
          try {
            const savedLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
            const localItems: CartItem[] = savedLocal
              ? JSON.parse(savedLocal).filter((item: CartItem) => !isLegacyAaramlyItem(item))
              : [];
            if (localItems.length > 0) {
              await fetch(`${API_BASE_URL}/cart/merge`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${user?.email || "token"}`,
                },
                body: JSON.stringify({ items: localItems }),
              });
            }
          } catch (err) {
            console.warn("Guest cart merge warning:", err);
          }
        }

        // 2. Fetch authenticated user's database cart (only update if backend has non-empty items)
        try {
          const res = await fetch(`${API_BASE_URL}/cart`, {
            headers: {
              Authorization: `Bearer ${user?.email || "token"}`,
            },
          });
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const clean = json.data.filter((item: CartItem) => !isLegacyAaramlyItem(item));
            setCartItems(clean);
          }
        } catch (err) {
          console.warn("Cart DB fetch warning:", err);
        }
      }
      wasLoggedInRef.current = isLoggedIn;
    };

    handleAuthSync();
  }, [isLoggedIn, user]);

  const addToCart = (newItem: Omit<CartItem, "id">) => {
    const itemKey = `${newItem.productId}-${newItem.colorName || "default"}-${newItem.size || "default"}`;
    const maxStock = newItem.stock !== undefined && newItem.stock !== null ? Number(newItem.stock) : 999;
    if (maxStock <= 0) return;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === itemKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        const currentStock = updated[existingIndex].stock !== undefined ? Number(updated[existingIndex].stock) : maxStock;
        const targetQty = Math.min(currentStock, updated[existingIndex].quantity + newItem.quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          stock: currentStock,
          quantity: targetQty,
        };
        return updated;
      } else {
        const targetQty = Math.min(maxStock, newItem.quantity);
        return [...prev, { ...newItem, stock: maxStock, quantity: targetQty, id: itemKey }];
      }
    });

    // If logged in, sync mutation to backend API
    if (isLoggedIn) {
      fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.email || "token"}`,
        },
        body: JSON.stringify(newItem),
      }).catch((e) => console.warn("Cart sync error:", e));
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));

    if (isLoggedIn) {
      fetch(`${API_BASE_URL}/cart/item/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.email || "token"}`,
        },
      }).catch((e) => console.warn("Cart delete error:", e));
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const maxLimit = item.stock !== undefined && item.stock !== null ? Number(item.stock) : 999;
        const clamped = Math.min(maxLimit, quantity);
        return { ...item, quantity: clamped };
      })
    );

    if (isLoggedIn) {
      const item = cartItems.find((i) => i.id === id);
      if (item) {
        fetch(`${API_BASE_URL}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.email || "token"}`,
          },
          body: JSON.stringify({ ...item, quantity: quantity - item.quantity }),
        }).catch((e) => console.warn("Cart qty update error:", e));
      }
    }
  };


  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
    if (isLoggedIn) {
      fetch(`${API_BASE_URL}/cart/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.email || "token"}`,
        },
      }).catch((e) => console.warn("Cart clear error:", e));
    }
  };

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
