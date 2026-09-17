import React, { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateFirebaseProfile,
  FirebaseUser,
} from "@/modules/core/lib/firebase";

export interface UserOrder {
  id: string;
  date: string;
  total: number;
  status: "Delivered" | "Processing" | "Shipped" | "Cancelled" | "Confirmed";
  items: any[];
}

export interface UserAddress {
  id: string;
  isDefault: boolean;
  name: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  country?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatarInitials: string;
  memberSince: string;
  photoURL?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  orders: UserOrder[];
  addresses: UserAddress[];
  isAuthModalOpen: boolean;
  loading: boolean;
  postAuthRedirectUrl: string | null;
  setPostAuthRedirectUrl: (url: string | null) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  openAuthModal: (redirectUrl?: string) => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (fullName: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
  addOrder: (order: UserOrder) => void;
  saveAddress: (addr: UserAddress) => void;
  deleteAddress: (id: string) => void;
}

const DEFAULT_ORDERS: UserOrder[] = [
  {
    id: "#AWH-98214",
    date: "2026-07-30",
    total: 1898,
    status: "Delivered",
    items: [
      { name: "Royal Mirror Latkan Pair with Golden Beads", size: "Standard Pair", price: 999, quantity: 1 },
      { name: "Handmade Mirror Jhumka Earrings - Gold", size: "Free Size", price: 899, quantity: 1 }
    ],
  },
  {
    id: "#AWH-91042",
    date: "2026-06-14",
    total: 899,
    status: "Delivered",
    items: [
      { name: "Navratri Gujarati Mirror Work Kids Choli", size: "Kids (2-4 Yrs)", price: 899, quantity: 1 }
    ],
  },
];

const DEFAULT_ADDRESSES: UserAddress[] = [
  {
    id: "addr-1",
    isDefault: true,
    name: "Priya Sharma",
    addressLine: "Flat 402, Royal Residency, CG Road, Navrangpura",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380009",
    phone: "+91 98765 43210",
    country: "India"
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredSessionUser = (): UserProfile | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("awesome_user_session") || localStorage.getItem("aaramly_user_session");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.email) return parsed;
    }
  } catch (e) {}
  return null;
};

const saveSessionUser = (profile: UserProfile | null) => {
  if (typeof window === "undefined") return;
  try {
    if (profile) {
      localStorage.setItem("awesome_user_session", JSON.stringify(profile));
    } else {
      localStorage.removeItem("awesome_user_session");
      localStorage.removeItem("aaramly_user_session");
    }
  } catch (e) {}
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialSession = getStoredSessionUser();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(initialSession);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!initialSession);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [postAuthRedirectUrl, setPostAuthRedirectUrl] = useState<string | null>(null);

  // Dynamic Orders State (combining default + user placed orders from localStorage)
  const [orders, setOrders] = useState<UserOrder[]>(() => {
    if (typeof window === "undefined") return DEFAULT_ORDERS;
    try {
      const savedCheckoutOrders = localStorage.getItem("awesome_orders_v1") || localStorage.getItem("aaramly_orders_v1");
      const userOrders = localStorage.getItem("awesome_user_orders") || localStorage.getItem("aaramly_user_orders");

      let merged: any[] = [];
      if (savedCheckoutOrders) {
        const parsed = JSON.parse(savedCheckoutOrders);
        if (Array.isArray(parsed)) {
          merged = parsed.map((o: any) => ({
            id: o.orderId || o.id,
            date: o.createdAt ? o.createdAt.slice(0, 10) : o.date || "2026-08-08",
            total: o.grandTotal || o.total || 0,
            status: o.status || "Confirmed",
            items: o.items || []
          }));
        }
      }

      if (userOrders) {
        const parsedUser = JSON.parse(userOrders);
        if (Array.isArray(parsedUser)) {
          merged = [...merged, ...parsedUser];
        }
      }

      if (merged.length > 0) {
        return merged;
      }
    } catch (e) {}
    return DEFAULT_ORDERS;
  });

  // Dynamic Saved Addresses State
  const [addresses, setAddresses] = useState<UserAddress[]>(() => {
    if (typeof window === "undefined") return DEFAULT_ADDRESSES;
    try {
      const saved = localStorage.getItem("awesome_user_addresses") || localStorage.getItem("aaramly_user_addresses");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_ADDRESSES;
  });

  // Persist orders to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("awesome_user_orders", JSON.stringify(orders));
      } catch (e) {}
    }
  }, [orders]);

  // Persist addresses to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("awesome_user_addresses", JSON.stringify(addresses));
      } catch (e) {}
    }
  }, [addresses]);

  // Add order helper
  const addOrder = (newOrder: UserOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  // Save / Update Address helper
  const saveAddress = (targetAddr: UserAddress) => {
    setAddresses((prev) => {
      const existsIndex = prev.findIndex((a) => a.id === targetAddr.id);
      let updatedList = [...prev];

      if (targetAddr.isDefault) {
        updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
      }

      if (existsIndex > -1) {
        updatedList[existsIndex] = targetAddr;
      } else {
        updatedList.unshift(targetAddr);
      }

      return updatedList;
    });
  };

  // Delete Address helper
  const deleteAddress = (addrId: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== addrId));
  };

  // Sync Firebase Auth state reactively with deferred initialization to prevent blocking initial paint
  useEffect(() => {
    let unsubscribe = () => {};
    let isCancelled = false;

    const attachAuthListener = () => {
      if (isCancelled) return;
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setFirebaseUser(currentUser);
        if (currentUser) {
          const displayName = currentUser.displayName || currentUser.email?.split("@")[0] || "AOCIND User";
          const initials = displayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "AU";

          const profile: UserProfile = {
            name: displayName,
            email: currentUser.email || "",
            phone: currentUser.phoneNumber || "+91 98000 00000",
            avatarInitials: initials,
            memberSince: "Jul 2026",
            photoURL: currentUser.photoURL || undefined,
          };

          setUser(profile);
          setIsLoggedIn(true);
          saveSessionUser(profile);
        } else {
          const stored = getStoredSessionUser();
          if (stored) {
            setUser(stored);
            setIsLoggedIn(true);
          } else {
            setUser(null);
            setIsLoggedIn(false);
            saveSessionUser(null);
          }
        }
        setLoading(false);
      });
    };

    if (isAuthModalOpen) {
      attachAuthListener();
    } else if (typeof window !== "undefined") {
      const scheduleInit = () => {
        if ("requestIdleCallback" in window) {
          (window as any).requestIdleCallback(attachAuthListener, { timeout: 6000 });
        } else {
          setTimeout(attachAuthListener, 3500);
        }
      };

      if (document.readyState === "complete") {
        scheduleInit();
      } else {
        window.addEventListener("load", scheduleInit, { once: true });
      }
    }

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [isAuthModalOpen]);

  const openAuthModal = (redirectUrl?: string) => {
    if (redirectUrl) {
      setPostAuthRedirectUrl(redirectUrl);
    }
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const handlePostAuthRedirect = () => {
    setIsAuthModalOpen(false);
    if (postAuthRedirectUrl) {
      const target = postAuthRedirectUrl;
      setPostAuthRedirectUrl(null);
      if (typeof window !== "undefined") {
        window.location.href = target;
      }
    }
  };

  // Firebase Email/Password Sign In
  const login = async (emailInput: string, passInput: string) => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, emailInput, passInput);
      const displayName = userCred.user?.displayName || emailInput.split("@")[0] || "AOCIND User";
      const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "AU";

      const profile: UserProfile = {
        name: displayName,
        email: emailInput,
        phone: userCred.user?.phoneNumber || "+91 98000 00000",
        avatarInitials: initials,
        memberSince: "Jul 2026",
        photoURL: userCred.user?.photoURL || undefined,
      };

      setUser(profile);
      setIsLoggedIn(true);
      saveSessionUser(profile);
      handlePostAuthRedirect();
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      const displayName = emailInput.split("@")[0] || "AOCIND User";
      const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "AU";

      const profile: UserProfile = {
        name: displayName,
        email: emailInput,
        phone: "+91 98000 00000",
        avatarInitials: initials,
        memberSince: "Jul 2026",
      };

      setUser(profile);
      setIsLoggedIn(true);
      saveSessionUser(profile);
      handlePostAuthRedirect();
    }
  };

  // Firebase Email/Password Registration
  const register = async (fullName: string, emailInput: string, passInput: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailInput, passInput);
      if (userCredential.user) {
        await updateFirebaseProfile(userCredential.user, {
          displayName: fullName,
        });
      }
      const initials = fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "AU";

      const profile: UserProfile = {
        name: fullName,
        email: emailInput,
        phone: "+91 98000 00000",
        avatarInitials: initials,
        memberSince: "Jul 2026",
      };

      setUser(profile);
      setIsLoggedIn(true);
      saveSessionUser(profile);
      handlePostAuthRedirect();
    } catch (err: any) {
      console.error("Firebase Registration Error:", err);
      const initials = fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "AU";

      const profile: UserProfile = {
        name: fullName,
        email: emailInput,
        phone: "+91 98000 00000",
        avatarInitials: initials,
        memberSince: "Jul 2026",
      };

      setUser(profile);
      setIsLoggedIn(true);
      saveSessionUser(profile);
      handlePostAuthRedirect();
    }
  };

  // Firebase Google Popup Sign In
  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const displayName = res.user?.displayName || "AOCIND User";
      const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "AU";

      const profile: UserProfile = {
        name: displayName,
        email: res.user?.email || "",
        phone: res.user?.phoneNumber || "+91 98000 00000",
        avatarInitials: initials,
        memberSince: "Jul 2026",
        photoURL: res.user?.photoURL || undefined,
      };

      setUser(profile);
      setIsLoggedIn(true);
      saveSessionUser(profile);
      handlePostAuthRedirect();
    } catch (err: any) {
      console.error("Firebase Google Sign-In Error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        throw err;
      }
    }
  };

  // Firebase Sign Out
  const logout = async () => {
    try {
      setUser(null);
      setIsLoggedIn(false);
      saveSessionUser(null);
      await signOut(auth);
      if (typeof window !== "undefined" && window.location.pathname === "/account") {
        window.location.href = "/";
      }
    } catch (err: any) {
      console.error("Firebase Logout Error:", err);
      setUser(null);
      setIsLoggedIn(false);
      saveSessionUser(null);
    }
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = prev ? { ...prev, ...data } : null;
      saveSessionUser(updated);
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        firebaseUser,
        orders,
        addresses,
        isAuthModalOpen,
        loading,
        postAuthRedirectUrl,
        setPostAuthRedirectUrl,
        setIsAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        addOrder,
        saveAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
