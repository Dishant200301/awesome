import React, { useState, useEffect, useMemo } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductCreatePage } from './pages/ProductCreatePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AttributesPage } from './pages/AttributesPage';
import { ProductVariantsPage } from './pages/ProductVariantsPage';
import { InventoryPage } from './pages/InventoryPage';
import { OrdersPage } from './pages/OrdersPage';
import { CustomersPage } from './pages/CustomersPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ContentPages } from './pages/ContentPages';
import { BannersPage } from './pages/BannersPage';
import { SettingsPage } from './pages/SettingsPage';
import { SizeGuidesPage } from './pages/SizeGuidesPage';
import { ContactMessagesPage } from './pages/ContactMessagesPage';
import { FilterManagementPage } from './pages/FilterManagementPage';
import { CouponsPage } from './pages/CouponsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

function AdminMainContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');

  // Sidebar collapse state with Local Storage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('admin_sidebar_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  // Mobile off-canvas drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('admin_sidebar_collapsed', JSON.stringify(isCollapsed));
    } catch (e) {}
  }, [isCollapsed]);

  // Master Navigation Bridge between string tabs and React Router paths
  const handleNavigate = (tab: string, productId?: string) => {
    setActiveTab(tab);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }

    switch (tab) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'all-products':
      case 'products':
      case 'product-details':
        navigate('/products');
        break;
      case 'add-product':
      case 'product-create':
        navigate('/product/new');
        break;
      case 'edit-product':
        if (productId) {
          navigate(`/product/edit/${productId}`);
        } else {
          navigate('/product/new');
        }
        break;
      case 'categories':
      case 'all-categories':
      case 'add-category':
      case 'sub-categories':
      case 'subcategories':
      case 'add-subcategory':
      case 'brands':
        navigate('/categories');
        break;
      case 'banners':
      case 'hero-slider':
      case 'homepage-banners':
        navigate('/banners');
        break;
      case 'attributes':
      case 'all-attributes':
      case 'add-attribute':
      case 'edit-attribute':
        navigate('/attributes');
        break;
      case 'variants':
        navigate('/variants');
        break;
      case 'filters':
        navigate('/filters');
        break;
      case 'inventory':
        navigate('/inventory');
        break;
      case 'reviews':
      case 'customer-reviews':
      case 'customers':
      case 'all-customers':
      case 'admin-users':
      case 'admin-roles':
      case 'admin-permissions':
        navigate('/reviews');
        break;
      case 'orders':
      case 'all-orders':
      case 'orders-pending':
      case 'orders-processing':
      case 'orders-shipped':
      case 'orders-delivered':
      case 'orders-cancelled':
      case 'orders-returns':
      case 'orders-refunded':
      case 'shipping':
        navigate('/orders');
        break;
      case 'contact-messages':
      case 'enquiries':
      case 'messages':
      case 'notifications':
      case 'email-templates':
        navigate('/enquiries');
        break;
      case 'all-size-guides':
      case 'size-guides':
      case 'add-size-guide':
      case 'edit-size-guide':
      case 'size-guide-templates':
        navigate('/size-guides');
        break;
      case 'content-pages':
      case 'website-navigation':
      case 'content-blog':
      case 'content-faq':
        navigate('/content-pages');
        break;
      case 'coupons':
        navigate('/coupons');
        break;
      case 'analytics':
      case 'reports':
      case 'reports-sales':
      case 'reports-products':
      case 'reports-customers':
      case 'reports-orders':
      case 'payments':
        navigate('/analytics');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        navigate(`/${tab}`);
        break;
    }
  };

  // Derive dynamic header title from current location pathname
  const headerTitle = useMemo(() => {
    const p = location.pathname.toLowerCase().replace(/^\/admin(?=\/|$)/, '') || '/';
    if (p.includes('/product/edit') || p.includes('/products/edit') || p.includes('/edit-product')) {
      return 'Edit Product';
    }
    if (p.includes('/product/new') || p.includes('/products/new') || p.includes('/product/create') || p.includes('/products/create') || p.includes('/add-product')) {
      return 'Add New Product';
    }
    if (p.startsWith('/product') || p.startsWith('/products')) {
      return 'Products';
    }
    if (p.startsWith('/categor')) {
      return 'Categories';
    }
    if (p.startsWith('/banner')) {
      return 'Banners';
    }
    if (p.startsWith('/attribute')) {
      return 'Attributes';
    }
    if (p.startsWith('/variant')) {
      return 'Variants';
    }
    if (p.startsWith('/filter')) {
      return 'Filter Management';
    }
    if (p.startsWith('/inventory')) {
      return 'Inventory';
    }
    if (p.startsWith('/customer')) {
      return 'Customers';
    }
    if (p.startsWith('/order')) {
      return 'Orders';
    }
    if (p.startsWith('/enquir') || p.startsWith('/message') || p.startsWith('/contact')) {
      return 'Enquiries & Messages';
    }
    if (p.startsWith('/size')) {
      return 'Size Guides';
    }
    if (p.startsWith('/content')) {
      return 'Content Pages';
    }
    if (p.startsWith('/coupon')) {
      return 'Coupons & Discounts';
    }
    if (p.startsWith('/analytic') || p.startsWith('/report')) {
      return 'Analytics & Reports';
    }
    if (p.startsWith('/setting')) {
      return 'Settings';
    }
    return 'Dashboard';
  }, [location.pathname]);

  // Strictly guard admin dashboard: unauthenticated or invalid users cannot enter
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={() => handleNavigate('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-950 flex font-sans selection:bg-black selection:text-white">
      {/* Collapsible E-commerce Admin Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigate={handleNavigate}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <Header
          title={headerTitle}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onOpenMobileDrawer={() => setIsMobileOpen(true)}
          onNavigate={handleNavigate}
        />
        <main className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-neutral-50/30">
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage onNavigate={handleNavigate} />} />
            <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<DashboardPage onNavigate={handleNavigate} />} />

            {/* Products & Product Edit / Create */}
            <Route path="/products" element={<ProductsPage onNavigate={handleNavigate} />} />
            <Route path="/admin/products" element={<ProductsPage onNavigate={handleNavigate} />} />
            <Route path="/product" element={<ProductsPage onNavigate={handleNavigate} />} />
            <Route path="/admin/product" element={<ProductsPage onNavigate={handleNavigate} />} />
            <Route path="/all-products" element={<ProductsPage onNavigate={handleNavigate} />} />
            <Route path="/admin/all-products" element={<ProductsPage onNavigate={handleNavigate} />} />
            
            <Route path="/products/new" element={<ProductCreatePage onNavigate={handleNavigate} />} />
            <Route path="/admin/products/new" element={<ProductCreatePage onNavigate={handleNavigate} />} />
            <Route path="/product/new" element={<ProductCreatePage onNavigate={handleNavigate} />} />
            <Route path="/admin/product/new" element={<ProductCreatePage onNavigate={handleNavigate} />} />
            <Route path="/products/create" element={<ProductCreatePage onNavigate={handleNavigate} />} />
            <Route path="/admin/products/create" element={<ProductCreatePage onNavigate={handleNavigate} />} />
            <Route path="/product/create" element={<ProductCreatePage onNavigate={handleNavigate} />} />
            <Route path="/admin/product/create" element={<ProductCreatePage onNavigate={handleNavigate} />} />
            <Route path="/add-product" element={<ProductCreatePage onNavigate={handleNavigate} />} />
            <Route path="/admin/add-product" element={<ProductCreatePage onNavigate={handleNavigate} />} />

            <Route path="/products/edit/:id" element={<ProductCreatePage onNavigate={handleNavigate} />} />
            <Route path="/admin/products/edit/:id" element={<ProductCreatePage onNavigate={handleNavigate} />} />
            <Route path="/product/edit/:id" element={<ProductCreatePage onNavigate={handleNavigate} />} />
            <Route path="/admin/product/edit/:id" element={<ProductCreatePage onNavigate={handleNavigate} />} />
            <Route path="/edit-product/:id" element={<ProductCreatePage onNavigate={handleNavigate} />} />
            <Route path="/admin/edit-product/:id" element={<ProductCreatePage onNavigate={handleNavigate} />} />

            {/* Categories & Taxonomy */}
            <Route path="/categories" element={<CategoriesPage initialTab="all-categories" onNavigate={handleNavigate} />} />
            <Route path="/admin/categories" element={<CategoriesPage initialTab="all-categories" onNavigate={handleNavigate} />} />
            <Route path="/category" element={<CategoriesPage initialTab="all-categories" onNavigate={handleNavigate} />} />
            <Route path="/admin/category" element={<CategoriesPage initialTab="all-categories" onNavigate={handleNavigate} />} />
            <Route path="/all-categories" element={<CategoriesPage initialTab="all-categories" onNavigate={handleNavigate} />} />
            <Route path="/admin/all-categories" element={<CategoriesPage initialTab="all-categories" onNavigate={handleNavigate} />} />
            <Route path="/categories/subcategories" element={<CategoriesPage initialTab="sub-categories" onNavigate={handleNavigate} />} />
            <Route path="/admin/categories/subcategories" element={<CategoriesPage initialTab="sub-categories" onNavigate={handleNavigate} />} />

            {/* Banners & Hero Slider */}
            <Route path="/banners" element={<BannersPage initialTab="hero-slider" onNavigate={handleNavigate} />} />
            <Route path="/admin/banners" element={<BannersPage initialTab="hero-slider" onNavigate={handleNavigate} />} />
            <Route path="/banner" element={<BannersPage initialTab="hero-slider" onNavigate={handleNavigate} />} />
            <Route path="/hero-slider" element={<BannersPage initialTab="hero-slider" onNavigate={handleNavigate} />} />
            <Route path="/homepage-banners" element={<BannersPage initialTab="homepage-banners" onNavigate={handleNavigate} />} />

            {/* Attributes, Variants & Filters */}
            <Route path="/attributes" element={<AttributesPage initialTab="all-attributes" onNavigate={handleNavigate} />} />
            <Route path="/admin/attributes" element={<AttributesPage initialTab="all-attributes" onNavigate={handleNavigate} />} />
            <Route path="/all-attributes" element={<AttributesPage initialTab="all-attributes" onNavigate={handleNavigate} />} />
            <Route path="/variants" element={<ProductVariantsPage onNavigate={handleNavigate} />} />
            <Route path="/admin/variants" element={<ProductVariantsPage onNavigate={handleNavigate} />} />
            <Route path="/filters" element={<FilterManagementPage />} />
            <Route path="/admin/filters" element={<FilterManagementPage />} />

            {/* Inventory */}
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/admin/inventory" element={<InventoryPage />} />

            {/* Reviews & Feedback (Real-Time Customer Reviews) */}
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/admin/reviews" element={<ReviewsPage />} />
            <Route path="/customer-reviews" element={<ReviewsPage />} />
            <Route path="/customers" element={<ReviewsPage />} />
            <Route path="/all-customers" element={<ReviewsPage />} />

            {/* Orders */}
            <Route path="/orders" element={<OrdersPage initialStatusFilter="ALL" />} />
            <Route path="/admin/orders" element={<OrdersPage initialStatusFilter="ALL" />} />
            <Route path="/all-orders" element={<OrdersPage initialStatusFilter="ALL" />} />
            <Route path="/admin/all-orders" element={<OrdersPage initialStatusFilter="ALL" />} />

            {/* Enquiries & Messages */}
            <Route path="/enquiries" element={<ContactMessagesPage />} />
            <Route path="/messages" element={<ContactMessagesPage />} />
            <Route path="/contact-messages" element={<ContactMessagesPage />} />

            {/* Size Guides */}
            <Route path="/size-guides" element={<SizeGuidesPage initialSubTab="all-guides" />} />
            <Route path="/all-size-guides" element={<SizeGuidesPage initialSubTab="all-guides" />} />

            {/* Content Pages & Blog */}
            <Route path="/content-pages" element={<ContentPages initialSubTab="content-pages" />} />
            <Route path="/website-navigation" element={<ContentPages initialSubTab="content-pages" />} />

            {/* Coupons & Analytics */}
            <Route path="/coupons" element={<CouponsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/reports" element={<AnalyticsPage />} />

            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
        <AdminMainContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
