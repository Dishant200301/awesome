import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  Edit,
  Tag,
  Sliders,
  ShoppingCart,
  Mail,
  ChevronDown,
  X,
  PanelLeftClose,
  PanelLeft,
  SlidersHorizontal,
  Image as ImageIcon
} from 'lucide-react';
import { Tooltip } from './ui/tooltip';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigate?: (tab: string, productId?: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onNavigate,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  // Dropdown expansion states
  const [isProductsOpen, setIsProductsOpen] = useState(() => {
    return ['all-products', 'add-product', 'edit-product', 'product-details', 'products'].includes(activeTab);
  });

  const [isCategoriesOpen, setIsCategoriesOpen] = useState(() => {
    return ['categories', 'all-categories', 'add-category', 'brands'].includes(activeTab);
  });

  const [isAttributesOpen, setIsAttributesOpen] = useState(() => {
    return ['attributes', 'all-attributes', 'add-attribute'].includes(activeTab);
  });

  // Handle ESC key and body scroll locking for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen, setIsMobileOpen]);

  const handleItemClick = (tab: string, productId?: string) => {
    if (onNavigate) {
      onNavigate(tab, productId);
    } else {
      setActiveTab(tab);
    }
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const renderNavContent = (isMobile = false) => {
    const collapsed = isMobile ? false : isCollapsed;

    return (
      <div className="flex flex-col h-full bg-white border-r border-neutral-200 selection:bg-black selection:text-white font-sans">
        {/* SIDEBAR HEADER & BRAND LOGO */}
        <div className="h-14 px-3.5 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={`${import.meta.env.BASE_URL}images/common/logo.png`.replace(/\/+/g, '/')}
              alt="Awesome Handmade Logo"
              className="h-7 w-7 rounded-full object-cover shrink-0 border border-neutral-200"
            />
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap"
              >
                <span className="font-bold text-sm tracking-wide text-neutral-900">Awesome Handmade <span className="text-xs text-neutral-500 font-semibold uppercase">Admin</span></span>
              </motion.div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
         
          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-md text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NAVIGATION TREE */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1 text-xs font-sans scrollbar-thin">
          {/* DASHBOARD */}
          <Tooltip content="Dashboard" disabled={!collapsed}>
            <button
              type="button"
              onClick={() => handleItemClick('dashboard')}
              className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-black text-white shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-white' : 'text-neutral-500'}`} />
                {!collapsed && <span className="truncate">Dashboard</span>}
              </div>
            </button>
          </Tooltip>

          {/* PRODUCTS DROPDOWN */}
          <div className="space-y-0.5">
            <Tooltip content="Products" disabled={!collapsed}>
              <button
                type="button"
                onClick={() => {
                  if (collapsed) {
                    setIsCollapsed(false);
                    setIsProductsOpen(true);
                  } else {
                    setIsProductsOpen(!isProductsOpen);
                  }
                }}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  ['all-products', 'add-product', 'edit-product', 'product-details', 'products'].includes(activeTab) && !isProductsOpen
                    ? 'bg-neutral-100 text-black font-semibold'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-neutral-700 shrink-0" />
                  {!collapsed && <span>Products</span>}
                </div>
                {!collapsed && (
                  <motion.div animate={{ rotate: isProductsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </motion.div>
                )}
              </button>
            </Tooltip>

            {/* PRODUCTS SUBMENU */}
            <AnimatePresence initial={false}>
              {isProductsOpen && !collapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden pl-2 ml-4 border-l border-neutral-200 space-y-0.5 pt-1"
                >
                  <button
                    type="button"
                    onClick={() => handleItemClick('all-products')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      activeTab === 'all-products' || activeTab === 'products'
                        ? 'bg-black text-white font-semibold'
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>All Products</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleItemClick('add-product')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      activeTab === 'add-product'
                        ? 'bg-black text-white font-semibold'
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Product</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleItemClick('edit-product')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      activeTab === 'edit-product' || activeTab === 'product-details'
                        ? 'bg-black text-white font-semibold'
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                    }`}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Product</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CATEGORIES DROPDOWN */}
          <div className="space-y-0.5">
            <Tooltip content="Categories" disabled={!collapsed}>
              <button
                type="button"
                onClick={() => {
                  if (collapsed) {
                    setIsCollapsed(false);
                    setIsCategoriesOpen(true);
                  } else {
                    setIsCategoriesOpen(!isCategoriesOpen);
                  }
                }}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  ['categories', 'all-categories', 'add-category', 'brands'].includes(activeTab) && !isCategoriesOpen
                    ? 'bg-neutral-100 text-black font-semibold'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 text-neutral-700 shrink-0" />
                  {!collapsed && <span>Categories</span>}
                </div>
                {!collapsed && (
                  <motion.div animate={{ rotate: isCategoriesOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </motion.div>
                )}
              </button>
            </Tooltip>

            {/* CATEGORIES SUBMENU */}
            <AnimatePresence initial={false}>
              {isCategoriesOpen && !collapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden pl-2 ml-4 border-l border-neutral-200 space-y-0.5 pt-1"
                >
                  <button
                    type="button"
                    onClick={() => handleItemClick('all-categories')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      activeTab === 'categories' || activeTab === 'all-categories'
                        ? 'bg-black text-white font-semibold'
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>All Categories &amp; Subcategories</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleItemClick('add-category')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      activeTab === 'add-category'
                        ? 'bg-black text-white font-semibold'
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Category &amp; Subcategory</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ATTRIBUTES DIRECT MENU */}
          <div className="space-y-0.5">
            <Tooltip content="Attributes" disabled={!collapsed}>
              <button
                type="button"
                onClick={() => handleItemClick('attributes')}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  ['attributes', 'all-attributes', 'add-attribute'].includes(activeTab)
                    ? 'bg-black text-white font-semibold shadow-xs'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className={`w-4 h-4 shrink-0 ${['attributes', 'all-attributes', 'add-attribute'].includes(activeTab) ? 'text-white' : 'text-neutral-700'}`} />
                  {!collapsed && <span>Attributes</span>}
                </div>
              </button>
            </Tooltip>
          </div>

          {/* HERO SLIDER DIRECT MENU */}
          <div className="space-y-0.5">
            <Tooltip content="Hero Slider" disabled={!collapsed}>
              <button
                type="button"
                onClick={() => handleItemClick('hero-slider')}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  activeTab === 'hero-slider'
                    ? 'bg-black text-white font-semibold shadow-xs'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className={`w-4 h-4 shrink-0 ${activeTab === 'hero-slider' ? 'text-white' : 'text-neutral-700'}`} />
                  {!collapsed && <span>Hero Slider</span>}
                </div>
              </button>
            </Tooltip>
          </div>

          {/* PROMO BANNER DIRECT MENU */}
          <div className="space-y-0.5">
            <Tooltip content="Promo Banner" disabled={!collapsed}>
              <button
                type="button"
                onClick={() => handleItemClick('homepage-banners')}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  activeTab === 'homepage-banners'
                    ? 'bg-black text-white font-semibold shadow-xs'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className={`w-4 h-4 shrink-0 ${activeTab === 'homepage-banners' ? 'text-white' : 'text-neutral-700'}`} />
                  {!collapsed && <span>Promo Banner</span>}
                </div>
              </button>
            </Tooltip>
          </div>

          {/* ORDERS */}
          {/* <div className="space-y-0.5">
            <Tooltip content="Orders" disabled={!collapsed}>
              <button
                type="button"
                onClick={() => handleItemClick('orders')}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  activeTab === 'orders' || activeTab === 'all-orders'
                    ? 'bg-black text-white font-semibold shadow-xs'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className={`w-4 h-4 shrink-0 ${activeTab === 'orders' || activeTab === 'all-orders' ? 'text-white' : 'text-neutral-700'}`} />
                  {!collapsed && <span>Orders</span>}
                </div>
              </button>
            </Tooltip>
          </div> */}

          {/* INQUIRIES MENU */}
          <div className="space-y-0.5">
            <Tooltip content="Inquiries" disabled={!collapsed}>
              <button
                type="button"
                onClick={() => handleItemClick('contact-messages')}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  activeTab === 'contact-messages'
                    ? 'bg-black text-white font-semibold shadow-xs'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Mail className={`w-4 h-4 shrink-0 ${activeTab === 'contact-messages' ? 'text-white' : 'text-neutral-700'}`} />
                  {!collapsed && <span>Inquiries</span>}
                </div>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* DESKTOP STICKY SIDEBAR (Sleek 60px collapsed width) */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 60 : 280 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:block h-screen sticky top-0 z-30 shrink-0 select-none overflow-hidden"
      >
        {renderNavContent(false)}
      </motion.aside>

      {/* MOBILE OFF-CANVAS DRAWER (Always full 280px expanded layout with text labels) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] shadow-2xl z-50"
            >
              {renderNavContent(true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
