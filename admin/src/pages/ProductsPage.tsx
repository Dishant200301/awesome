import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Package, 
  Search, 
  Trash2, 
  Edit2, 
  Eye, 
  Copy, 
  Check, 
  Sparkles, 
  Filter,
  RefreshCw,
  Layers, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  ChevronDown,
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';
import { 
  getAdminProducts,
  broadcastAdminProductChange
} from '../data/mockAdminData';
import { Product, Category, Subcategory, Brand } from '../types/admin';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { AdminApiService } from '../services/adminApi';

interface ProductsPageProps {
  onNavigate?: (tab: string, productId?: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onNavigate }) => {
  // Main Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  // Dynamic Categories & Taxonomy State directly from backend/MySQL
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [subcategoriesList, setSubcategoriesList] = useState<Subcategory[]>([]);
  const [brandsList, setBrandsList] = useState<Brand[]>([]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [subcategoryFilter, setSubcategoryFilter] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL, in_stock, low_stock, out_of_stock
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, Active, Inactive, Draft, Out of Stock
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, today, 7days, 30days
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, price_asc, price_desc, name_asc, name_desc, stock_asc, stock_desc, discount_desc
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Selection & Bulk Action State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Modals & Dialog State
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Show Toast Message
  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 4000);
  };

  // Sync category updates in real time
  const loadTaxonomies = async () => {
    try {
      const res = await AdminApiService.getCategories();
      if (res && Array.isArray(res.categories)) {
        setCategoriesList(res.categories);
        setSubcategoriesList(res.subcategories || []);
      }
    } catch (e) {
      console.warn("Error fetching categories in ProductsPage:", e);
    }
  };

  useEffect(() => {
    loadTaxonomies();

    let catBc: BroadcastChannel | null = null;
    try {
      catBc = new BroadcastChannel('awesome_category_sync');
      catBc.onmessage = () => {
        loadTaxonomies();
      };
    } catch (e) {}

    const handleCategorySync = () => {
      loadTaxonomies();
    };

    const handleProductSync = () => {
      loadProducts(false);
    };

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('awesome_product_sync');
      bc.onmessage = () => {
        loadProducts(false);
      };
    } catch (e) {}

    window.addEventListener('awesome_category_sync', handleCategorySync);
    window.addEventListener('aaramly_category_sync', handleCategorySync);
    window.addEventListener('awesome_product_sync', handleProductSync);
    window.addEventListener('aaramly_product_sync', handleProductSync);

    AdminApiService.getBrands().then((b) => {
      if (Array.isArray(b)) setBrandsList(b);
    }).catch(() => {});

    return () => {
      window.removeEventListener('awesome_category_sync', handleCategorySync);
      window.removeEventListener('aaramly_category_sync', handleCategorySync);
      window.removeEventListener('awesome_product_sync', handleProductSync);
      window.removeEventListener('aaramly_product_sync', handleProductSync);
      if (bc) bc.close();
    };
  }, []);

  // Fetch products from backend API with complete filter parameters
  const loadProducts = async (showSkeleton = true) => {
    if (showSkeleton) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await AdminApiService.getProducts({
        page: currentPage,
        limit: pageSize,
        search: searchTerm.trim() || undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        subcategory: subcategoryFilter !== 'ALL' ? subcategoryFilter : undefined,
        brand: brandFilter !== 'ALL' ? brandFilter : undefined,
        stockStatus: stockFilter !== 'ALL' ? stockFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        dateFilter: dateFilter !== 'ALL' ? dateFilter : undefined,
        sort: sortBy
      });

      const localProducts = getAdminProducts();
      if (res && Array.isArray(res.items) && res.items.length > 0) {
        const serverIds = new Set(res.items.map((p: any) => String(p.id)));
        const unsyncedLocals = localProducts.filter((p: any) => !serverIds.has(String(p.id)));
        const combined = [...unsyncedLocals, ...res.items];
        setProducts(combined);
        setTotalCount(res.total !== undefined ? Math.max(res.total, combined.length) : combined.length);
      } else {
        setProducts(localProducts);
        setTotalCount(localProducts.length);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
      const fallback = getAdminProducts();
      setProducts(fallback);
      setTotalCount(fallback.length);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Trigger fetch on filter / page / sort change
  useEffect(() => {
    loadProducts(true);
  }, [
    currentPage,
    pageSize,
    categoryFilter,
    subcategoryFilter,
    brandFilter,
    stockFilter,
    statusFilter,
    minPrice,
    maxPrice,
    dateFilter,
    sortBy
  ]);

  // Debounced search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      loadProducts(false);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Subcategories available for selected category
  const availableSubcategories = useMemo(() => {
    if (categoryFilter === 'ALL') {
      return subcategoriesList;
    }
    return subcategoriesList.filter(
      (s) => s.categoryName === categoryFilter || s.categoryId === categoryFilter
    );
  }, [categoryFilter, subcategoriesList]);

  // Count active filters for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (categoryFilter !== 'ALL') count++;
    if (subcategoryFilter !== 'ALL') count++;
    if (brandFilter !== 'ALL') count++;
    if (stockFilter !== 'ALL') count++;
    if (statusFilter !== 'ALL') count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (dateFilter !== 'ALL') count++;
    if (searchTerm) count++;
    return count;
  }, [categoryFilter, subcategoryFilter, brandFilter, stockFilter, statusFilter, minPrice, maxPrice, dateFilter, searchTerm]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('ALL');
    setSubcategoryFilter('ALL');
    setBrandFilter('ALL');
    setStockFilter('ALL');
    setStatusFilter('ALL');
    setMinPrice('');
    setMaxPrice('');
    setDateFilter('ALL');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Copy SKU to clipboard with feedback
  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  // Toggle Single Product Status (Activate / Deactivate)
  const handleToggleStatus = async (product: Product) => {
    const isCurrentlyPublished = product.isPublished !== false && product.status !== 'Draft' && product.status !== 'Inactive';
    const newStatus = isCurrentlyPublished ? 'Inactive' : 'Active';
    const newPublished = !isCurrentlyPublished;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              isPublished: newPublished,
              status: (newPublished ? 'Published' : 'Inactive') as any
            }
          : p
      )
    );

    try {
      await AdminApiService.updateProductStatus(product.id, newStatus, newPublished);
      broadcastAdminProductChange({ ...product, isPublished: newPublished, status: newPublished ? 'Published' : 'Inactive' });
      showToast(`Product "${product.name}" is now ${newPublished ? 'Active' : 'Inactive'}`);
    } catch (e) {
      console.error('Failed to toggle status:', e);
      loadProducts(false);
    }
  };

  // Duplicate Product
  const handleDuplicateProduct = async (product: Product) => {
    try {
      const duplicated = await AdminApiService.duplicateProduct(product.id);
      if (duplicated) {
        showToast(`Duplicated "${product.name}" successfully!`);
        loadProducts(false);
        if (onNavigate) {
          onNavigate('edit-product', duplicated.id);
        }
      }
    } catch (e) {
      console.error('Failed to duplicate:', e);
      alert('Failed to duplicate product. Please try again.');
    }
  };

  // Delete Single Product
  const confirmDeleteProduct = async () => {
    if (!deleteCandidate) return;
    const target = deleteCandidate;
    const targetId = String(target.id);
    setDeleteCandidate(null);

    // Optimistic remove from UI
    setProducts((prev) => prev.filter((p) => String(p.id) !== targetId));
    setTotalCount((prev) => Math.max(0, prev - 1));

    try {
      await AdminApiService.deleteProduct(targetId);
      showToast(`Product "${target.name}" deleted successfully.`);
      await loadProducts(false);
    } catch (e) {
      console.error('Failed to delete product:', e);
      alert('Failed to delete product.');
      await loadProducts(false);
    }
  };

  // Bulk Select All on current page
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(products.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  // Toggle individual row selection
  const handleToggleRowSelect = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Status Update
  const handleBulkStatusUpdate = async (isPublished: boolean) => {
    if (selectedProductIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      await AdminApiService.bulkUpdateStatus(selectedProductIds, isPublished, isPublished ? 'Active' : 'Inactive');
      showToast(`Updated status for ${selectedProductIds.length} products.`);
      setSelectedProductIds([]);
      await loadProducts(false);
    } catch (e) {
      console.error('Bulk status failed:', e);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    setIsBulkProcessing(true);
    setBulkDeleteConfirm(false);
    const toDeleteIds = [...selectedProductIds].map(String);
    setSelectedProductIds([]);

    // Optimistic remove
    setProducts((prev) => prev.filter((p) => !toDeleteIds.includes(String(p.id))));
    setTotalCount((prev) => Math.max(0, prev - toDeleteIds.length));

    try {
      await AdminApiService.bulkDeleteProducts(toDeleteIds);
      showToast(`Deleted ${toDeleteIds.length} products.`);
      await loadProducts(false);
    } catch (e) {
      console.error('Bulk delete failed:', e);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const itemsToExport = selectedProductIds.length > 0
      ? products.filter((p) => selectedProductIds.includes(p.id))
      : products;

    if (itemsToExport.length === 0) {
      alert('No products to export.');
      return;
    }

    const headers = [
      'ID', 'Name', 'SKU', 'Category', 'Subcategory', 'Brand',
      'Regular Price', 'Discount %', 'Selling Price', 'Stock', 'Status', 'Created Date'
    ];

    const rows = itemsToExport.map((p) => [
      `"${p.id}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.sku || p.defaultSku || ''}"`,
      `"${p.category || ''}"`,
      `"${p.subcategory || p.subCategory || ''}"`,
      `"${p.brand || ''}"`,
      p.regularPrice || p.originalPrice || p.price,
      p.discountPercentage || 0,
      p.price,
      p.stock,
      `"${p.status || (p.isPublished ? 'Active' : 'Draft')}"`,
      `"${p.createdAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6 font-sans text-neutral-900 selection:bg-black selection:text-white pb-16">
      
      {/* SUCCESS TOAST BANNER */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-xl border border-neutral-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{actionSuccessMsg}</span>
          <button onClick={() => setActionSuccessMsg(null)} className="ml-2 text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-neutral-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-950 tracking-tight flex items-center gap-2">
                <span>Products Management</span>
                <Badge variant="secondary" className="text-xs font-semibold bg-neutral-100 text-neutral-800 border-neutral-200">
                  {totalCount} Total
                </Badge>
              </h1>
              <p className="text-xs text-neutral-500 font-normal">
                Manage your product catalog, inventory stock levels, multi-tiered pricing, and live storefront status.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadProducts(false)}
            disabled={isRefreshing || isLoading}
            className="text-xs h-9 border-neutral-200 text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-neutral-900' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs h-9 border-neutral-200 text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <Button
            onClick={() => (onNavigate ? onNavigate('add-product', undefined) : null)}
            className="bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-xs h-9 px-4 rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <Card className="p-4 sm:p-5 bg-white border-neutral-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by Product Name, SKU, Brand, Barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 text-xs bg-neutral-50/60 border-neutral-200 h-9 rounded-lg focus:bg-white transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="w-36 sm:w-44">
              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  setCategoryFilter(val);
                  setSubcategoryFilter('ALL');
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'ALL', label: 'All Categories' },
                  ...categoriesList.map((c) => ({ value: c.name, label: c.name }))
                ]}
              />
            </div>

            {/* Stock Filter */}
            <div className="w-32 sm:w-36">
              <Select
                value={stockFilter}
                onValueChange={(val) => {
                  setStockFilter(val);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'ALL', label: 'Stock: All' },
                  { value: 'in_stock', label: 'In Stock (>10)' },
                  { value: 'low_stock', label: 'Low Stock (1-10)' },
                  { value: 'out_of_stock', label: 'Out of Stock (0)' }
                ]}
              />
            </div>

            {/* Status Filter */}
            <div className="w-32 sm:w-36">
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'ALL', label: 'Status: All' },
                  { value: 'Active', label: 'Active / Live' },
                  { value: 'Inactive', label: 'Inactive' },
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Out of Stock', label: 'Out of Stock' }
                ]}
              />
            </div>

            {/* Toggle Advanced Filters Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`text-xs h-9 px-3 border-neutral-200 flex items-center gap-1.5 ${
                showAdvancedFilters || activeFiltersCount > 0
                  ? 'bg-neutral-100 text-neutral-900 border-neutral-300 font-semibold'
                  : 'text-neutral-600'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-neutral-900 text-white rounded-full text-[10px]">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* Sort Selector */}
            <div className="w-36 sm:w-44">
              <Select
                value={sortBy}
                onValueChange={(val) => {
                  setSortBy(val);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'newest', label: 'Sort: Newest First' },
                  { value: 'oldest', label: 'Sort: Oldest First' },
                  { value: 'price_asc', label: 'Price: Low to High' },
                  { value: 'price_desc', label: 'Price: High to Low' },
                  { value: 'discount_desc', label: 'Discount: Highest' },
                  { value: 'stock_asc', label: 'Stock: Low to High' },
                  { value: 'stock_desc', label: 'Stock: High to Low' },
                  { value: 'name_asc', label: 'Name: A to Z' },
                  { value: 'name_desc', label: 'Name: Z to A' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* ADVANCED FILTER DRAWER / ACCORDION */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-neutral-50/50 p-3 rounded-lg animate-in fade-in duration-150 text-xs">
            {/* Subcategory */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1">Subcategory</label>
              <Select
                value={subcategoryFilter}
                onValueChange={(val) => {
                  setSubcategoryFilter(val);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'ALL', label: 'All Subcategories' },
                  ...availableSubcategories.map((s) => ({ value: s.name, label: s.name }))
                ]}
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1">Brand</label>
              <Select
                value={brandFilter}
                onValueChange={(val) => {
                  setBrandFilter(val);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'ALL', label: 'All Brands' },
                  ...brandsList.map((b) => ({ value: b.name, label: b.name }))
                ]}
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1">Price Range (₹)</label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-8 text-xs bg-white"
                />
                <span className="text-neutral-400">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-8 text-xs bg-white"
                />
              </div>
            </div>

            {/* Created Date Range */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1">Created Date</label>
              <Select
                value={dateFilter}
                onValueChange={(val) => {
                  setDateFilter(val);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'ALL', label: 'Any Time' },
                  { value: 'today', label: 'Today' },
                  { value: '7days', label: 'Last 7 Days' },
                  { value: '30days', label: 'Last 30 Days' }
                ]}
              />
            </div>

            {/* Clear Filters Action */}
            <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-neutral-500 hover:text-neutral-900"
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* BULK ACTIONS TOOLBAR */}
      {selectedProductIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900 text-white px-4 py-2.5 rounded-lg shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
              {selectedProductIds.length}
            </span>
            <span>products selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusUpdate(true)}
              disabled={isBulkProcessing}
              className="text-xs h-7 bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Set Active
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusUpdate(false)}
              disabled={isBulkProcessing}
              className="text-xs h-7 bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Set Inactive
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkDeleteConfirm(true)}
              disabled={isBulkProcessing}
              className="text-xs h-7 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/30"
            >
              Delete Selected
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedProductIds([])}
              className="text-xs h-7 text-neutral-400 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* PRODUCTS RESPONSIVE DATA TABLE */}
      <Card className="overflow-hidden border-neutral-200 bg-white shadow-2xs">
        <div className="overflow-x-auto min-h-[360px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-600 font-semibold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedProductIds.length === products.length}
                    onChange={handleSelectAll}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                  />
                </th>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Category &amp; Sub</th>
                <th className="p-3 text-center">Regular Price</th>
                <th className="p-3 text-center">Discount</th>
                <th className="p-3 text-center">Final Price</th>
                <th className="p-3 text-center">Stock Level</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Created</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-3 text-center"><div className="w-4 h-4 bg-neutral-200 rounded mx-auto" /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-200 shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 bg-neutral-200 rounded w-36" />
                          <div className="h-2 bg-neutral-200 rounded w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><div className="h-3 bg-neutral-200 rounded w-24" /></td>
                    <td className="p-3 text-center"><div className="h-3 bg-neutral-200 rounded w-12 mx-auto" /></td>
                    <td className="p-3 text-center"><div className="h-3 bg-neutral-200 rounded w-12 mx-auto" /></td>
                    <td className="p-3 text-center"><div className="h-3 bg-neutral-200 rounded w-14 mx-auto" /></td>
                    <td className="p-3 text-center"><div className="h-3 bg-neutral-200 rounded w-16 mx-auto" /></td>
                    <td className="p-3 text-center"><div className="h-3 bg-neutral-200 rounded w-16 mx-auto" /></td>
                    <td className="p-3 text-center"><div className="h-3 bg-neutral-200 rounded w-16 mx-auto" /></td>
                    <td className="p-3 text-center"><div className="h-3 bg-neutral-200 rounded w-20 mx-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-neutral-500">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
                        <Package className="w-6 h-6" />
                      </div>
                      <h4 className="font-semibold text-neutral-800 text-sm">No products found</h4>
                      <p className="text-xs text-neutral-500">
                        Try adjusting your search query, clearing applied filters, or add a new product to your catalog.
                      </p>
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetFilters}
                          className="text-xs mt-2"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const regPrice = p.regularPrice || p.originalPrice || p.price;
                  const finalPrice = p.price;
                  const hasDiscount = regPrice > finalPrice;
                  const discountVal = p.discountPercentage !== undefined
                    ? p.discountPercentage
                    : hasDiscount
                    ? Math.round(((regPrice - finalPrice) / regPrice) * 100)
                    : 0;

                  const isSelected = selectedProductIds.includes(p.id);
                  const isLive = p.isPublished !== false && p.status !== 'Draft' && p.status !== 'Inactive';

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        isSelected ? 'bg-neutral-50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRowSelect(p.id)}
                          className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                        />
                      </td>

                      {/* Product Image & Name */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative group shrink-0">
                            <img
                              src={
                                p.mainImage ||
                                p.image ||
                                (p.images && p.images[0]) ||
                                (p.colors && p.colors[0]?.mainImage) ||
                                (p.colors && p.colors[0]?.displayImage) ||
                                (p.variations && p.variations[0]?.thumbnail) ||
                                (p.variations && p.variations[0]?.images?.[0]?.url) ||
                                '/images/category/Latkan.webp'
                              }
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover border border-neutral-200 bg-neutral-100 shadow-2xs transition-transform group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/category/Latkan.webp';
                              }}
                            />
                            {p.images && p.images.length > 1 && (
                              <span className="absolute -bottom-1 -right-1 bg-neutral-900 text-white text-[9px] font-bold px-1 rounded-full border border-white">
                                +{p.images.length - 1}
                              </span>
                            )}
                          </div>
                          <div className="max-w-[200px] sm:max-w-[260px]">
                            <h4
                              onClick={() => onNavigate ? onNavigate('edit-product', p.id) : null}
                              className="font-medium text-neutral-950 text-xs line-clamp-1 hover:underline cursor-pointer"
                              title={`Click to edit ${p.name}`}
                            >
                              {p.name}
                            </h4>
                            <p className="text-[10px] text-neutral-400 line-clamp-1 font-mono" title={`Slug: /${p.slug || (p.name ? p.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'product')}`}>
                              /{p.slug || (p.name ? p.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'product')}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Subcategory */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-medium text-neutral-900">{p.category}</div>
                        <div className="text-[10px] text-neutral-400">{p.subcategory || p.subCategory || 'General'}</div>
                      </td>

                      {/* Regular Price */}
                      <td className="p-3 whitespace-nowrap text-center font-medium text-neutral-500">
                        ₹{regPrice.toLocaleString('en-IN')}
                      </td>

                      {/* Discount */}
                      <td className="p-3 whitespace-nowrap text-center">
                        {hasDiscount && discountVal > 0 ? (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {discountVal}% OFF
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-[10px]">No Discount</span>
                        )}
                      </td>

                      {/* Final Selling Price */}
                      <td className="p-3 whitespace-nowrap text-center font-bold text-neutral-950 text-sm">
                        ₹{finalPrice.toLocaleString('en-IN')}
                      </td>

                      {/* Stock Level */}
                      <td className="p-3 whitespace-nowrap text-center">
                        {p.stock <= 0 ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            Out of Stock (0)
                          </span>
                        ) : p.stock <= (p.lowStockAlert || 10) ? (
                          <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            Low Stock ({p.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            In Stock ({p.stock})
                          </span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="p-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={isLive}
                              onChange={() => handleToggleStatus(p)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4.5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-neutral-950"></div>
                          </label>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="p-3 whitespace-nowrap text-center font-mono text-[11px] text-neutral-400">
                        {p.createdAt || '2026-08-01'}
                      </td>

                      {/* Actions */}
                      <td className="p-3 whitespace-nowrap text-center space-x-1">
                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onNavigate ? onNavigate('edit-product', p.id) : null}
                          className="w-7 h-7 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        {/* Duplicate */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicateProduct(p)}
                          className="w-7 h-7 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                          title="Duplicate Product"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteCandidate(p)}
                          className="w-7 h-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION & FOOTER */}
        <div className="p-3 sm:p-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <div className="w-20">
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
                className="h-8 text-xs bg-neutral-50"
                options={[
                  { value: '10', label: '10' },
                  { value: '25', label: '25' },
                  { value: '50', label: '50' },
                  { value: '100', label: '100' }
                ]}
              />
            </div>
            <span>of <strong>{totalCount}</strong> products</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className="text-xs h-8 px-2.5"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>

            <span className="px-3 py-1 font-medium text-neutral-700">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
              className="text-xs h-8 px-2.5"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* SINGLE PRODUCT DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-neutral-200">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-neutral-900 text-sm">Delete Product?</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Are you sure you want to delete <strong className="text-neutral-900 font-semibold">"{deleteCandidate.name}"</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteCandidate(null)}
                className="text-xs h-8 px-3 border-neutral-200 text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={confirmDeleteProduct}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 px-3.5 font-medium cursor-pointer"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-neutral-200">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-neutral-900 text-sm">Delete {selectedProductIds.length} Products?</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Are you sure you want to delete these {selectedProductIds.length} selected products? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkDeleteConfirm(false)}
                className="text-xs h-8 px-3 border-neutral-200 text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleBulkDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 px-3.5 font-medium cursor-pointer"
              >
                Delete All
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default ProductsPage;
