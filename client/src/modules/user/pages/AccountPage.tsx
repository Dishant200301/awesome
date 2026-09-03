import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPackage,
  FiMapPin,
  FiLogOut,
  FiCheck,
  FiSettings,
  FiLock,
  FiMessageSquare,
  FiCornerDownRight,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiX,
} from "react-icons/fi";
import Navbar from "@/modules/core/components/Navbar";
import Footer from "@/modules/core/components/Footer";
import { useWishlist } from "@/modules/product/context/WishlistContext";
import { useCart } from "@/modules/product/context/CartContext";
import { useAuth, UserAddress } from "@/modules/core/context/AuthContext";

export const AccountPage: React.FC = () => {
  const { wishlistCount } = useWishlist();
  const { totalItemsCount } = useCart();
  const { isLoggedIn, loading, user, orders, addresses, logout, updateProfile, saveAddress, deleteAddress, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const [supportMessages, setSupportMessages] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const local = localStorage.getItem("awesome_contact_sync");
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed?.message) return [parsed.message];
        }
      } catch (e) {}
    }
    return [];
  });

  // Redirect and open Auth Modal popup if trying to view /account while logged out
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      openAuthModal();
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, loading, navigate, openAuthModal]);

  // Tab handling via search params
  const tabParam = searchParams.get("tab") as "orders" | "messages" | "addresses" | "profile" | "settings" | null;
  const [activeTab, setActiveTab] = useState<"orders" | "messages" | "addresses" | "profile" | "settings">(
    tabParam || "orders"
  );

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Edit Profile Form State
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone);
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: editName, phone: editPhone });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Address Modal & Editing State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [addrForm, setAddrForm] = useState({
    name: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    country: "India",
    isDefault: false,
  });

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddrForm({
      name: user?.name || "",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
      phone: user?.phone || "",
      country: "India",
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddress(addr);
    setAddrForm({
      name: addr.name || "",
      addressLine: addr.addressLine || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      phone: addr.phone || "",
      country: addr.country || "India",
      isDefault: !!addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: UserAddress = {
      id: editingAddress ? editingAddress.id : `addr-${Date.now()}`,
      name: addrForm.name,
      addressLine: addrForm.addressLine,
      city: addrForm.city,
      state: addrForm.state,
      pincode: addrForm.pincode,
      phone: addrForm.phone,
      country: addrForm.country,
      isDefault: addrForm.isDefault,
    };
    saveAddress(newAddr);
    setIsAddressModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 pt-32 pb-16 px-4 text-center max-w-md mx-auto space-y-4">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Verifying Session…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 pt-32 pb-16 px-4 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-800 flex items-center justify-center mx-auto">
            <FiLock size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900">Sign In Required</h1>
          <p className="text-xs text-zinc-500">
            Please sign in to access your orders, profile, saved addresses and settings.
          </p>
          <button
            onClick={() => openAuthModal()}
            className="px-8 py-3.5 bg-zinc-900 hover:bg-black text-white text-xs font-extrabold rounded-full uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            Sign In / Register
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Account Header Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-2xs mb-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                {user?.avatarInitials || "AU"}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
                  {user?.name || "Awesome Handmade Customer"}
                </h1>
                <p className="text-xs text-zinc-500 font-medium">
                  {user?.email} • Member since {user?.memberSince || "2026"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={logout}
                className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-4 py-2.5 rounded-full border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <FiLogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-zinc-200 gap-8 no-scrollbar">
            <button
              onClick={() => {
                setActiveTab("orders");
                setSearchParams({ tab: "orders" });
              }}
              className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "orders" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-700"
              }`}
            >
              <FiPackage size={16} />
              <span>My Orders ({orders.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("messages");
                setSearchParams({ tab: "messages" });
              }}
              className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "messages" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-700"
              }`}
            >
              <FiMessageSquare size={16} />
              <span>Support Inquiries ({supportMessages.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("profile");
                setSearchParams({ tab: "profile" });
              }}
              className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "profile" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-700"
              }`}
            >
              <FiUser size={16} />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("addresses");
                setSearchParams({ tab: "addresses" });
              }}
              className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "addresses" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-700"
              }`}
            >
              <FiMapPin size={16} />
              <span>Saved Addresses ({addresses.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
                setSearchParams({ tab: "settings" });
              }}
              className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "settings" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-700"
              }`}
            >
              <FiSettings size={16} />
              <span>Settings</span>
            </button>
          </div>

          {/* TAB: MY ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 space-y-3">
                  <FiPackage size={36} className="mx-auto text-zinc-300 stroke-[1.5]" />
                  <h3 className="text-base font-extrabold text-zinc-900">No Orders Yet</h3>
                  <p className="text-xs text-zinc-500">You have not placed any orders yet.</p>
                  <Link
                    to="/shop"
                    className="inline-block px-6 py-2.5 bg-zinc-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-full hover:bg-black transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-4 shadow-2xs hover:border-zinc-300 transition-colors">
                    {/* Header bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                      <div>
                        <span className="font-extrabold text-sm text-zinc-900 uppercase">{ord.id}</span>
                        <span className="text-xs text-zinc-400 ml-3">Placed on {ord.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1">
                          <FiCheck size={12} />
                          <span>{ord.status}</span>
                        </span>
                        <span className="font-extrabold text-sm text-zinc-900">
                          Rs. {ord.total.toLocaleString("en-IN")}.00
                        </span>
                      </div>
                    </div>

                    {/* Order Items Detailed List */}
                    <div className="divide-y divide-zinc-100">
                      {ord.items.map((item: any, idx: number) => {
                        const isObj = typeof item === "object" && item !== null;
                        const itemName = isObj ? (item.productName || item.name || "Awesome Handmade Product") : String(item);
                        const itemPrice = isObj ? item.price : null;
                        const itemQty = isObj ? item.quantity : 1;
                        const itemImg = isObj ? (item.image || item.thumbnail) : null;
                        const itemSize = isObj ? item.size : null;

                        return (
                          <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4">
                            {itemImg ? (
                              <img
                                src={itemImg}
                                alt={itemName}
                                className="w-14 h-16 object-cover rounded-xl bg-zinc-100 border border-zinc-200 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 shrink-0 flex items-center justify-center text-zinc-400">
                                <FiPackage size={20} />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-extrabold text-zinc-900 uppercase tracking-tight truncate">
                                {itemName}
                              </h4>
                              <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                                {itemSize && <span>Size: {itemSize} • </span>}
                                Qty: {itemQty}
                              </p>
                            </div>

                            {itemPrice && (
                              <span className="text-xs font-bold text-zinc-900 shrink-0">
                                Rs. {(itemPrice * itemQty).toLocaleString("en-IN")}.00
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: SUPPORT INQUIRIES & ADMIN REPLIES */}
          {activeTab === "messages" && (
            <div className="space-y-4">
              {supportMessages.length === 0 ? (
                <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-zinc-200 text-xs text-zinc-500">
                  No support inquiries submitted yet.
                </div>
              ) : (
                supportMessages.map((msg) => (
                  <div key={msg.id} className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-4 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-zinc-900">{msg.subject}</h4>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          Submitted by {msg.name} ({msg.email}) • {msg.date}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        msg.status === "Replied"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : msg.status === "Read"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}>
                        {msg.status === "Replied" ? "Replied by Admin" : msg.status}
                      </span>
                    </div>

                    <div className="bg-zinc-50 p-4 rounded-xl text-xs text-zinc-800 space-y-1">
                      <p className="font-bold text-zinc-500 uppercase text-[10px] tracking-wider">Your Message:</p>
                      <p className="font-medium leading-relaxed">{msg.message}</p>
                    </div>

                    {msg.replyText && (
                      <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-xl text-xs text-emerald-950 space-y-1.5 ml-4">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                          <FiCornerDownRight className="w-4 h-4 text-emerald-600" />
                          <span>Admin Response:</span>
                        </div>
                        <p className="font-medium text-emerald-900 leading-relaxed pl-5">
                          {msg.replyText}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: MY PROFILE */}
          {activeTab === "profile" && (
            <div className="max-w-xl bg-white p-6 rounded-3xl border border-zinc-200 space-y-6 font-montserrat shadow-2xs">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wider">
                  Personal Details
                </h3>
                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <FiCheck size={14} /> Profile Saved!
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="text-zinc-500 uppercase text-[10px] tracking-wider block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-zinc-50 text-zinc-900 p-3 rounded-2xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 uppercase text-[10px] tracking-wider block mb-1">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-zinc-100 text-zinc-500 p-3 rounded-2xl border border-zinc-200 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 uppercase text-[10px] tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-zinc-50 text-zinc-900 p-3 rounded-2xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 bg-zinc-900 hover:bg-black text-white font-extrabold rounded-full tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB: SAVED ADDRESSES WITH EDIT ADDRESS FUNCTIONALITY */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                  Your Delivery Addresses
                </h3>
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="flex items-center gap-1.5 bg-zinc-900 hover:bg-black text-white px-4 py-2 rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                >
                  <FiPlus size={14} />
                  <span>Add New Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-3 relative shadow-2xs flex flex-col justify-between">
                    <div>
                      {addr.isDefault && (
                        <span className="px-3 py-1 rounded-full bg-zinc-900 text-white text-[10px] font-extrabold uppercase tracking-wider inline-block mb-2">
                          Default Shipping Address
                        </span>
                      )}
                      <h3 className="font-extrabold text-sm text-zinc-900">{addr.name}</h3>
                      <p className="text-xs text-zinc-600 leading-relaxed mt-1">
                        {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode} ({addr.country || "India"})
                      </p>
                      <p className="text-xs font-mono font-bold text-zinc-800 mt-2">Phone: {addr.phone}</p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEditAddress(addr)}
                        className="text-xs font-extrabold text-zinc-700 hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
                      >
                        <FiEdit size={14} /> Edit Address
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAddress(addr.id)}
                        className="text-xs font-extrabold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                      >
                        <FiTrash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === "settings" && (
            <div className="max-w-xl bg-white p-6 rounded-3xl border border-zinc-200 space-y-6 font-montserrat shadow-2xs">
              <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-3">
                Account Settings & Preferences
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl">
                  <div>
                    <p className="font-extrabold text-zinc-900">Email Notifications</p>
                    <p className="text-[11px] text-zinc-500">Receive order tracking and exclusive discounts</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-zinc-900" />
                </div>

                <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl">
                  <div>
                    <p className="font-extrabold text-zinc-900">Two-Factor Security</p>
                    <p className="text-[11px] text-zinc-500">Add SMS verification layer for account safety</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-zinc-900" />
                </div>

                <div className="pt-2">
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 text-rose-600 font-extrabold hover:text-rose-700 cursor-pointer"
                  >
                    <FiLogOut />
                    <span>Sign out from all active sessions</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* EDIT / ADD ADDRESS MODAL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 uppercase tracking-tight">
                {editingAddress ? "Edit Shipping Address" : "Add New Shipping Address"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAddressSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-zinc-500 uppercase text-[10px] tracking-wider block mb-1">
                  Full Name / Recipient Name
                </label>
                <input
                  type="text"
                  required
                  value={addrForm.name}
                  onChange={(e) => setAddrForm({ ...addrForm, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-zinc-50 text-zinc-900 p-3 rounded-2xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="text-zinc-500 uppercase text-[10px] tracking-wider block mb-1">
                  Street Address / Flat / Building
                </label>
                <input
                  type="text"
                  required
                  value={addrForm.addressLine}
                  onChange={(e) => setAddrForm({ ...addrForm, addressLine: e.target.value })}
                  placeholder="e.g. Flat 402, Royal Residency, CG Road"
                  className="w-full bg-zinc-50 text-zinc-900 p-3 rounded-2xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-500 uppercase text-[10px] tracking-wider block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={addrForm.city}
                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                    placeholder="Ahmedabad"
                    className="w-full bg-zinc-50 text-zinc-900 p-3 rounded-2xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 uppercase text-[10px] tracking-wider block mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={addrForm.state}
                    onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                    placeholder="Gujarat"
                    className="w-full bg-zinc-50 text-zinc-900 p-3 rounded-2xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-500 uppercase text-[10px] tracking-wider block mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    required
                    value={addrForm.pincode}
                    onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                    placeholder="380009"
                    className="w-full bg-zinc-50 text-zinc-900 p-3 rounded-2xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 uppercase text-[10px] tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={addrForm.phone}
                    onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-zinc-50 text-zinc-900 p-3 rounded-2xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="addrDefaultToggle"
                  checked={addrForm.isDefault}
                  onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                  className="w-4 h-4 accent-zinc-900 cursor-pointer"
                />
                <label htmlFor="addrDefaultToggle" className="text-xs font-bold text-zinc-800 cursor-pointer">
                  Set as Default Shipping Address
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-zinc-200 text-zinc-700 font-extrabold text-xs hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-zinc-900 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-colors"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AccountPage;
