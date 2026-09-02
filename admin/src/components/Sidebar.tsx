import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Sliders,
  Users,
  MessageSquare,
  X,
  Layers,
  Star
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

interface NavItem {
  id: string;
  label: string;
  tab: string;
  path: string;
  icon: any;
  badge?: string | number;
  activeMatchTabs: string[];
  pathPrefixes: string[];
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
  const location = useLocation();
  const navigate = useNavigate();

  const [reviewBadge, setReviewBadge] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      try {
        const stored = localStorage.getItem('awesome_admin_reviews') || localStorage.getItem('aaramly_admin_reviews');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setReviewBadge(parsed.length);
          }
        }
      } catch (e) {}
    };

    updateCount();
    window.addEventListener('awesome_review_sync', updateCount);
    window.addEventListener('aaramly_review_sync', updateCount);

    return () => {
      window.removeEventListener('awesome_review_sync', updateCount);
      window.removeEventListener('aaramly_review_sync', updateCount);
    };
  }, []);

  // Direct Flat Sidebar Navigation Items (No Dropdowns)
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      tab: 'dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      activeMatchTabs: ['dashboard'],
      pathPrefixes: ['/dashboard', '/']
    },
    {
      id: 'products',
      label: 'Products',
      tab: 'all-products',
      path: '/products',
      icon: ShoppingBag,
      activeMatchTabs: ['all-products', 'products', 'add-product', 'edit-product', 'product-details'],
      pathPrefixes: ['/products', '/product']
    },
    {
      id: 'categories',
      label: 'Categories',
      tab: 'all-categories',
      path: '/categories',
      icon: Tag,
      activeMatchTabs: ['all-categories', 'categories', 'add-category', 'sub-categories', 'subcategories', 'add-subcategory'],
      pathPrefixes: ['/categories', '/category']
    },
    {
      id: 'banners',
      label: 'Banners',
      tab: 'hero-slider',
      path: '/banners',
      icon: Layers,
      activeMatchTabs: ['hero-slider', 'homepage-banners', 'banners'],
      pathPrefixes: ['/banners', '/banner']
    },
    {
      id: 'attributes',
      label: 'Attributes',
      tab: 'all-attributes',
      path: '/attributes',
      icon: Sliders,
      activeMatchTabs: ['attributes', 'all-attributes', 'add-attribute', 'edit-attribute'],
      pathPrefixes: ['/attributes', '/variants', '/filters']
    },
    {
      id: 'reviews',
      label: 'Reviews',
      tab: 'reviews',
      path: '/reviews',
      icon: Star,
      badge: reviewBadge > 0 ? reviewBadge : undefined,
      activeMatchTabs: ['reviews', 'customer-reviews', 'customers', 'all-customers'],
      pathPrefixes: ['/reviews', '/customers', '/customer']
    },
    {
      id: 'enquiries',
      label: 'Enquiries',
      tab: 'contact-messages',
      path: '/enquiries',
      icon: MessageSquare,
      badge: 5,
      activeMatchTabs: ['contact-messages', 'notifications', 'email-templates'],
      pathPrefixes: ['/enquiries', '/messages', '/contact-messages']
    }
  ];


  // Handle ESC key & body scroll locking for mobile drawer
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

  // Main Item Click Handler (Direct 1-click Navigation)
  const handleItemClick = (item: NavItem) => {
    if (onNavigate) {
      onNavigate(item.tab);
    }
    navigate(item.path);
    setActiveTab(item.tab);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const isItemActive = (item: NavItem) => {
    const currentPath = location.pathname.replace(/\/+$/, '') || '/';
    if (item.id === 'dashboard') {
      return currentPath === '' || currentPath === '/' || currentPath === '/dashboard';
    }
    return item.pathPrefixes.some((prefix) => currentPath.startsWith(prefix));
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
              className="h-7 w-7 rounded-full object-cover shrink-0 border border-neutral-200 shadow-2xs"
            />
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap"
              >
                <span className="font-bold text-sm tracking-wide text-neutral-950">Awesome Handmade</span>
              </motion.div>
            )}
          </div>

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

        {/* NAVIGATION LIST (DIRECT 1-CLICK FLAT ITEMS, NO DROPDOWNS) */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 text-xs font-sans scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item);

            return (
              <Tooltip key={item.id} content={item.label} disabled={!collapsed}>
                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`w-full group flex items-center justify-between rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
                    } ${isActive
                      ? 'bg-neutral-950 text-white font-semibold shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/80'
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-950'
                        }`}
                    />
                    {!collapsed && (
                      <span className="truncate text-xs tracking-tight">{item.label}</span>
                    )}
                  </div>
                </button>
              </Tooltip>
            );
          })}
        </div>

        

      </div>
    );
  };

  return (
    <>
      {/* DESKTOP COLLAPSIBLE SIDEBAR */}
      <aside
        className={`hidden md:block shrink-0 sticky top-0 h-screen transition-all duration-200 z-30 ${isCollapsed ? 'w-16' : 'w-56'
          }`}
      >
        {renderNavContent(false)}
      </aside>

      {/* MOBILE DRAWER BACKDROP & OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide-out Drawer Panel */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-60 max-w-[85vw] h-full shadow-2xl z-10"
            >
              {renderNavContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Sidebar;
