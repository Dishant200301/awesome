import React, { useState, useEffect } from 'react';
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
import { ContentPages } from './pages/ContentPages';
import { SettingsPage } from './pages/SettingsPage';
import { SizeGuidesPage } from './pages/SizeGuidesPage';
import { ContactMessagesPage } from './pages/ContactMessagesPage';
import { FilterManagementPage } from './pages/FilterManagementPage';
import { getAdminProducts } from './data/mockAdminData';

function AdminMainContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined);

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

  const handleNavigate = (tab: string, productId?: string) => {
    setActiveTab(tab);
    setEditingProductId(productId || undefined);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  // Strictly guard admin dashboard: unauthenticated or invalid users cannot enter
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={() => handleNavigate('dashboard')}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'all-products':
      case 'products':
      case 'product-details':
        return <ProductsPage onNavigate={handleNavigate} />;
      case 'add-product':
      case 'edit-product':
        return (
          <ProductCreatePage
            onNavigate={handleNavigate}
            editingProductId={editingProductId || (activeTab === 'edit-product' ? getAdminProducts()[0]?.id : undefined)}
          />
        );
      case 'categories':
      case 'all-categories':
      case 'add-category':
      case 'brands':
        return <CategoriesPage initialTab={activeTab} />;
      case 'attributes':
      case 'all-attributes':
      case 'add-attribute':
        return <AttributesPage />;
      case 'filters':
        return <FilterManagementPage />;
      case 'variants':
        return <ProductVariantsPage onNavigate={handleNavigate} />;
      case 'inventory':
        return <InventoryPage />;
      case 'all-size-guides':
      case 'size-guides':
        return <SizeGuidesPage initialSubTab="all-guides" />;
      case 'add-size-guide':
      case 'edit-size-guide':
        return <SizeGuidesPage initialSubTab="add-guide" />;
      case 'size-guide-templates':
        return <SizeGuidesPage initialSubTab="templates" />;
      case 'orders':
      case 'all-orders':
        return <OrdersPage />;
      case 'customers':
      case 'all-customers':
        return <CustomersPage />;
      case 'hero-slider':
        return <ContentPages initialSubTab="hero-slider" />;
      case 'homepage-banners':
        return <ContentPages initialSubTab="homepage-banners" />;
      case 'content-pages':
        return <ContentPages initialSubTab="content-pages" />;
      case 'content-blog':
        return <ContentPages initialSubTab="content-blog" />;
      case 'content-faq':
        return <ContentPages initialSubTab="content-faq" />;
      case 'settings':
        return <SettingsPage />;
      case 'contact-messages':
        return <ContactMessagesPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-950 flex font-sans selection:bg-black selection:text-white">
      {/* Vercel Light Theme Sidebar */}
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
          title={activeTab}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onOpenMobileDrawer={() => setIsMobileOpen(true)}
          onNavigate={handleNavigate}
        />
        <main className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-neutral-50/30">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AdminMainContent />
    </AuthProvider>
  );
}

export default App;
