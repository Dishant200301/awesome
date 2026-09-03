import React, { useState, useEffect, useRef } from 'react';
import { getAdminApiBase, getAdminAuthHeaders } from '../utils/authHeaders';
import { 
  Plus, 
  FolderTree, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  Search, 
  ChevronRight, 
  Layers, 
  ArrowLeft,
  Check,
  Tag,
  UploadCloud,
  Image as ImageIcon,
  X,
  Eye,
  AlertTriangle,
  Globe,
  FileText,
  Calendar,
  Package,
  RefreshCw
} from 'lucide-react';
import { Category } from '../types/admin';
import { Select } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

export interface EnhancedCategory extends Category {
  image?: string;
  bannerImage?: string;
  description?: string;
  type?: 'parent' | 'sub';
  parentId?: string;
  parentName?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt?: string;
}

interface CategoriesPageProps {
  initialTab?: string;
  onNavigate?: (tab: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ initialTab = 'all-categories', onNavigate }) => {
  // Main Categories State with LocalStorage & Express Backend Persistence
  const [categories, setCategories] = useState<EnhancedCategory[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('awesome_categories') || localStorage.getItem('aocind_categories');
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return [];
  });

  // Navigation & View Mode: 'all' | 'add' | 'edit'
  const [subView, setSubView] = useState<'all' | 'add' | 'edit'>(() => {
    return initialTab === 'add-category' ? 'add' : 'all';
  });

  // Filter Type: 'ALL' | 'MAIN' | 'SUB'
  const [filterType, setFilterType] = useState<'ALL' | 'MAIN' | 'SUB'>(() => {
    if (initialTab === 'sub-categories' || initialTab === 'subcategories') return 'SUB';
    if (initialTab === 'all-categories' || initialTab === 'categories') return 'MAIN';
    return 'ALL';
  });

  // Sync state if initialTab changes
  useEffect(() => {
    if (initialTab === 'add-category') {
      setSubView('add');
      setCategoryType('parent');
    } else if (initialTab === 'add-subcategory') {
      setSubView('add');
      setCategoryType('sub');
    } else if (initialTab === 'sub-categories' || initialTab === 'subcategories') {
      setSubView('all');
      setFilterType('SUB');
    } else if (initialTab === 'all-categories' || initialTab === 'categories') {
      setSubView('all');
      setFilterType('MAIN');
    }
  }, [initialTab]);

  // Search Query
  const [searchTerm, setSearchTerm] = useState('');

  // Form State for Add / Edit
  const [editingCategory, setEditingCategory] = useState<EnhancedCategory | null>(null);
  const [categoryType, setCategoryType] = useState<'parent' | 'sub'>('parent');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryImage, setCategoryImage] = useState<string>('/images/category/Latkan.webp');
  const [categoryBanner, setCategoryBanner] = useState<string>('');
  const [categoryDescription, setCategoryDescription] = useState<string>('');
  const [metaTitle, setMetaTitle] = useState<string>('');
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [metaKeywords, setMetaKeywords] = useState<string>('');
  const [isActive, setIsActive] = useState(true);

  // Modal / Confirm States
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusConfirmItem, setStatusConfirmItem] = useState<EnhancedCategory | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const API_BASE = getAdminApiBase();

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  // Fetch live categories from Express Server on mount
  useEffect(() => {
    fetch(`${API_BASE}/taxonomies/categories`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data.categories)) {
          const parents = json.data.categories.map((c: any) => ({
            ...c,
            type: 'parent' as const,
            createdAt: c.createdAt || '2026-01-15'
          }));
          const subs = (json.data.subcategories || []).map((s: any) => ({
            ...s,
            type: 'sub' as const,
            createdAt: s.createdAt || '2026-01-20'
          }));
          setCategories([...parents, ...subs]);
        }
      })
      .catch(() => {});
  }, []);

  // Sync to LocalStorage & Express Backend
  useEffect(() => {
    try {
      localStorage.setItem('awesome_categories', JSON.stringify(categories));
      localStorage.setItem('aocind_categories', JSON.stringify(categories));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('awesome_category_sync'));
        window.dispatchEvent(new Event('aocind_category_sync'));
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('awesome_category_sync');
          bc.postMessage({ type: 'CATEGORIES_UPDATED', categories });
          bc.close();
        }
      }
    } catch (e) {}

    // Sync to Express Backend
    fetch(`${API_BASE}/taxonomies/categories/sync`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ categories }),
    }).catch(() => {});
  }, [categories]);

  // Main Categories list for parent selection
  const mainCategoriesList = categories.filter((c) => c.type !== 'sub');
  const subCategoriesList = categories.filter((c) => c.type === 'sub');

  // Count subcategories for a parent category
  const countSubcategories = (parentId: string, parentName: string) => {
    return subCategoriesList.filter((s) => s.parentId === parentId || s.parentName === parentName).length;
  };

  // Open Add View
  const handleOpenAddView = (defaultType: 'parent' | 'sub' = 'parent') => {
    setEditingCategory(null);
    setCategoryType(defaultType);
    setSelectedParentId(mainCategoriesList[0]?.id || '');
    setCategoryName('');
    setCategorySlug('');
    setCategoryImage('/images/category/Latkan.webp');
    setCategoryBanner('');
    setCategoryDescription('');
    setMetaTitle('');
    setMetaDescription('');
    setMetaKeywords('');
    setIsActive(true);
    setSubView('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Edit View with Pre-filled Data
  const handleOpenEditView = (cat: EnhancedCategory) => {
    setEditingCategory(cat);
    const type = cat.type || (cat.parentId ? 'sub' : 'parent');
    setCategoryType(type);
    setSelectedParentId(cat.parentId || mainCategoriesList[0]?.id || '');
    setCategoryName(cat.name);
    setCategorySlug(cat.slug);
    setCategoryImage(cat.image || '/images/category/Latkan.webp');
    setCategoryBanner(cat.bannerImage || '');
    setCategoryDescription(cat.description || '');
    setMetaTitle(cat.metaTitle || cat.name || '');
    setMetaDescription(cat.metaDescription || cat.description || '');
    setMetaKeywords(cat.metaKeywords || '');
    setIsActive(cat.isActive ?? true);
    setSubView('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Global Clipboard Paste (Ctrl + V) for Category Image when in Add/Edit mode
  useEffect(() => {
    if (subView !== 'add' && subView !== 'edit') return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFileProcess(file, false);
            showToast('Category image pasted from clipboard (Ctrl + V)!');
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [subView]);

  // Process File to Base64 / Data URL
  const handleFileProcess = (file: File, isBanner = false) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        if (isBanner) {
          setCategoryBanner(uploadEvent.target.result as string);
        } else {
          setCategoryImage(uploadEvent.target.result as string);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Name Input Change & Auto-generate Slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCategoryName(val);
    if (!editingCategory) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setCategorySlug(generatedSlug);
      if (!metaTitle) setMetaTitle(`${val} | Awesome Handmade`);
    }
  };

  // Save Category or Subcategory
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const slugToSave = categorySlug.trim() || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const parentObj = categoryType === 'sub' ? mainCategoriesList.find((c) => c.id === selectedParentId) : undefined;

    if (editingCategory) {
      // UPDATE EXISTING
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: categoryName.trim(),
                slug: slugToSave,
                image: categoryImage,
                bannerImage: categoryBanner,
                description: categoryDescription,
                type: categoryType,
                parentId: categoryType === 'sub' ? selectedParentId : undefined,
                parentName: parentObj ? parentObj.name : undefined,
                metaTitle: metaTitle.trim(),
                metaDescription: metaDescription.trim(),
                metaKeywords: metaKeywords.trim(),
                isActive
              }
            : c
        )
      );
      showToast(`Updated "${categoryName}" successfully.`);
    } else {
      // CREATE NEW
      const newCat: EnhancedCategory = {
        id: categoryType === 'sub' ? `sub-${Date.now()}` : `cat-${Date.now()}`,
        name: categoryName.trim(),
        slug: slugToSave,
        image: categoryImage,
        bannerImage: categoryBanner,
        description: categoryDescription,
        type: categoryType,
        parentId: categoryType === 'sub' ? selectedParentId : undefined,
        parentName: parentObj ? parentObj.name : undefined,
        metaTitle: metaTitle.trim() || `${categoryName} | Awesome Handmade`,
        metaDescription: metaDescription.trim() || categoryDescription,
        metaKeywords: metaKeywords.trim(),
        productCount: 0,
        isActive,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setCategories((prev) => [newCat, ...prev]);
      showToast(`Created new ${categoryType === 'sub' ? 'subcategory' : 'category'} "${categoryName}".`);
    }

    setSubView('all');
    setEditingCategory(null);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    const itemToDelete = categories.find((c) => c.id === deleteConfirmId);
    setCategories((prev) => prev.filter((c) => c.id !== deleteConfirmId));
    if (editingCategory?.id === deleteConfirmId) {
      setSubView('all');
      setEditingCategory(null);
    }
    setDeleteConfirmId(null);
    if (itemToDelete) {
      showToast(`Deleted "${itemToDelete.name}" successfully.`);
    }
  };

  // Confirm Status Toggle
  const handleConfirmStatusToggle = () => {
    if (!statusConfirmItem) return;
    setCategories((prev) =>
      prev.map((c) => (c.id === statusConfirmItem.id ? { ...c, isActive: !c.isActive } : c))
    );
    showToast(`Status changed for "${statusConfirmItem.name}".`);
    setStatusConfirmItem(null);
  };

  // Filter categories based on search term & filter tab
  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.parentName && c.parentName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilterType =
      filterType === 'ALL'
        ? true
        : filterType === 'MAIN'
        ? c.type !== 'sub'
        : c.type === 'sub';

    return matchesSearch && matchesFilterType;
  });

  return (
    <div className="space-y-6 font-sans selection:bg-black selection:text-white pb-20">
      
      {/* SUCCESS TOAST */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-neutral-950 text-white px-5 py-3 rounded-xl shadow-2xl border border-neutral-800 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* HEADER WITH ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-neutral-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-neutral-950 tracking-tight flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-neutral-950" />
              <span>
                {filterType === 'SUB' ? 'Sub Categories Management' : 'Categories & Subcategories'}
              </span>
            </h1>
            <Badge variant="secondary" className="text-xs font-semibold bg-neutral-100 text-neutral-800 border-neutral-200">
              {filteredCategories.length} Total
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {filterType === 'SUB'
              ? 'Manage linked subcategories, assign to parent categories, and track product associations.'
              : 'Organize your store catalog with Main Categories and linked Subcategories for seamless customer browsing.'}
          </p>
        </div>

        {/* TOP ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          {subView !== 'all' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubView('all')}
              className="text-xs h-9 font-semibold text-neutral-800 border-neutral-200 hover:bg-neutral-50"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back to Listing</span>
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAddView('sub')}
                className="text-xs h-9 px-3.5 font-semibold text-neutral-800 border-neutral-200 hover:bg-neutral-50"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Add Subcategory</span>
              </Button>

              <Button
                size="sm"
                onClick={() => handleOpenAddView('parent')}
                className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs h-9 px-4 font-semibold shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: ALL CATEGORIES & SUBCATEGORIES TABLE & CARDS */}
      {/* ========================================================================= */}
      {subView === 'all' && (
        <div className="space-y-4">
          
          {/* SEARCH & FILTER CONTROLS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search categories by name, slug or parent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs bg-neutral-50 border-neutral-200 focus:bg-white"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg border border-neutral-200 text-xs">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  filterType === 'ALL' ? 'bg-white text-neutral-950 shadow-2xs' : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                All ({categories.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('MAIN')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  filterType === 'MAIN' ? 'bg-white text-neutral-950 shadow-2xs' : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Main Categories ({mainCategoriesList.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('SUB')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  filterType === 'SUB' ? 'bg-white text-neutral-950 shadow-2xs' : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Sub Categories ({subCategoriesList.length})
              </button>
            </div>
          </div>

          {/* EMPTY STATE */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <FolderTree className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-neutral-900">No categories found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {searchTerm
                  ? `No category matching "${searchTerm}". Try a different search term.`
                  : 'Get started by creating your first category.'}
              </p>
              <Button
                onClick={() => handleOpenAddView('parent')}
                size="sm"
                className="bg-neutral-950 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Category
              </Button>
            </div>
          ) : (
            /* DATA TABLE / CARDS GRID */
            <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Image</th>
                      <th className="py-3 px-4">Category Name &amp; Slug</th>
                      <th className="py-3 px-4">Classification</th>
                      {filterType !== 'MAIN' && <th className="py-3 px-4">Parent Category</th>}
                      <th className="py-3 px-4 text-center">Products</th>
                      {filterType !== 'SUB' && <th className="py-3 px-4 text-center">Subcategories</th>}
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredCategories.map((cat) => {
                      const isSub = cat.type === 'sub';
                      const subCount = !isSub ? countSubcategories(cat.id, cat.name) : 0;

                      return (
                        <tr key={cat.id} className="hover:bg-neutral-50/80 transition-colors">
                          {/* Image */}
                          <td className="py-3 px-4">
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 shadow-2xs">
                              <img
                                src={cat.image || '/images/category/Latkan.webp'}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>

                          {/* Name & Slug */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-neutral-950 text-xs">{cat.name}</div>
                            <span className="font-mono text-[10px] text-neutral-400 block truncate max-w-[200px]">
                              /{cat.slug}
                            </span>
                          </td>

                          {/* Classification */}
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                isSub
                                  ? 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                                  : 'bg-neutral-900 text-white'
                              }`}
                            >
                              <Tag className="w-2.5 h-2.5" />
                              <span>{isSub ? 'Subcategory' : 'Main Category'}</span>
                            </span>
                          </td>

                          {/* Parent Category (if applicable) */}
                          {filterType !== 'MAIN' && (
                            <td className="py-3 px-4">
                              {isSub ? (
                                <span className="font-semibold text-neutral-800 text-xs">
                                  {cat.parentName || mainCategoriesList.find(p => p.id === cat.parentId)?.name || '—'}
                                </span>
                              ) : (
                                <span className="text-neutral-400 font-mono text-[11px]">—</span>
                              )}
                            </td>
                          )}

                          {/* Product Count */}
                          <td className="py-3 px-4 text-center">
                            <span className="font-semibold text-neutral-900">
                              {cat.productCount !== undefined ? cat.productCount : 12}
                            </span>
                          </td>

                          {/* Subcategory Count (Main only) */}
                          {filterType !== 'SUB' && (
                            <td className="py-3 px-4 text-center">
                              {!isSub ? (
                                <Badge variant="outline" className="text-[10px] font-semibold">
                                  {subCount} Subcats
                                </Badge>
                              ) : (
                                <span className="text-neutral-400 text-[11px]">—</span>
                              )}
                            </td>
                          )}

                          {/* Status Switch Toggle */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Switch
                                id={`cat-status-${cat.id}`}
                                size="sm"
                                checked={cat.isActive !== false}
                                onCheckedChange={(checked) => {
                                  setCategories((prev) =>
                                    prev.map((c) => (c.id === cat.id ? { ...c, isActive: checked } : c))
                                  );
                                  showToast(
                                    `"${cat.name}" is now ${
                                      checked ? 'Active (Visible on Website)' : 'Inactive (Hidden from Website)'
                                    }.`
                                  );
                                }}
                              />
                              <span
                                className={`text-[10px] font-bold ${
                                  cat.isActive !== false ? 'text-emerald-700' : 'text-neutral-400'
                                }`}
                              >
                                {cat.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </td>

                          {/* Created Date */}
                          <td className="py-3 px-4 text-neutral-500 text-[11px] font-mono whitespace-nowrap">
                            {cat.createdAt || '2026-01-15'}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                onClick={() => handleOpenEditView(cat)}
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs font-medium border-neutral-200 text-neutral-800 hover:bg-neutral-100"
                                title="Edit Category"
                              >
                                <Edit2 className="w-3 h-3 mr-1" />
                                <span>Edit</span>
                              </Button>
                              <Button
                                onClick={() => setDeleteConfirmId(cat.id)}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-neutral-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2 & 3: FULL ADD / EDIT CATEGORY & SUBCATEGORY FORM */}
      {/* ========================================================================= */}
      {(subView === 'add' || subView === 'edit') && (
        <Card className="p-6 sm:p-8 bg-white border border-neutral-200 shadow-2xs rounded-xl max-w-3xl mx-auto space-y-6">
          
          {/* Top Form Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubView('all')}
                className="text-xs border-neutral-200 text-neutral-700 hover:bg-neutral-100"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Back</span>
              </Button>
              <div>
                <h2 className="text-base font-bold text-neutral-950 tracking-tight">
                  {subView === 'edit'
                    ? `Edit ${categoryType === 'sub' ? 'Subcategory' : 'Category'}: ${categoryName}`
                    : `Add New ${categoryType === 'sub' ? 'Subcategory' : 'Category'}`}
                </h2>
                <p className="text-xs text-neutral-500 font-normal">
                  Configure classification, parent category linkage, image media, and SEO metadata.
                </p>
              </div>
            </div>

            {subView === 'edit' && editingCategory && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmId(editingCategory.id)}
                className="text-xs border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                <span>Delete</span>
              </Button>
            )}
          </div>

          <form onSubmit={handleSaveCategory} className="space-y-5 text-xs">
            
            {/* Classification Toggle (Main vs Sub) */}
            <div>
              <label className="block text-xs font-bold text-neutral-950 uppercase tracking-wider mb-1.5">
                Classification Type *
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-lg border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setCategoryType('parent')}
                  className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    categoryType === 'parent' ? 'bg-neutral-950 text-white shadow-2xs' : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  Main Category
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryType('sub')}
                  className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    categoryType === 'sub' ? 'bg-neutral-950 text-white shadow-2xs' : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  Sub Category
                </button>
              </div>
            </div>

            {/* If Subcategory: Parent Category Selector */}
            {categoryType === 'sub' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-950 uppercase tracking-wider">
                  Parent Main Category *
                </label>
                <Select
                  value={selectedParentId || mainCategoriesList[0]?.id || ''}
                  onValueChange={setSelectedParentId}
                  options={mainCategoriesList.map((p) => ({ value: p.id, label: p.name }))}
                />
                <span className="text-[10px] text-neutral-400 block">
                  Select the existing Parent Category this Subcategory belongs to.
                </span>
              </div>
            )}

            {/* Category Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-950 uppercase tracking-wider">
                {categoryType === 'sub' ? 'Subcategory Name *' : 'Category Name *'}
              </label>
              <Input
                type="text"
                required
                placeholder={categoryType === 'sub' ? 'e.g. Mirror Latkan, Saree Tassels, Kids Choli' : 'e.g. Latkan, Choli, Gift Hamper, Necklace'}
                value={categoryName}
                onChange={handleNameChange}
                className="bg-white border-neutral-200 text-xs font-medium"
              />
            </div>

            {/* URL Slug */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-950 uppercase tracking-wider">
                URL Slug *
              </label>
              <div className="flex items-center gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 font-mono text-xs">
                <span className="text-neutral-400 text-[11px] shrink-0">/categories/</span>
                <input
                  type="text"
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                  className="flex-1 bg-transparent text-neutral-950 font-semibold focus:outline-none"
                />
              </div>
            </div>

           

            {/* Category Display Image */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-950 uppercase tracking-wider">
                Category Image Thumbnail *
              </label>
              
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    handleFileProcess(file, false);
                    showToast('Category image added via Drag & Drop!');
                  }
                }}
                className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  isDragOver ? 'border-neutral-900 bg-neutral-100 scale-99' : 'border-dashed border-neutral-200 bg-neutral-50/50 hover:border-neutral-400'
                }`}
              >
                <div className="w-20 h-20 rounded-xl bg-white border border-neutral-200 overflow-hidden shrink-0 shadow-2xs">
                  <img
                    src={categoryImage || '/images/category/Latkan.webp'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <Input
                    type="text"
                    placeholder="Image URL (e.g. /images/category/Latkan.webp or base64)..."
                    value={categoryImage}
                    onChange={(e) => setCategoryImage(e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="px-3 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-semibold cursor-pointer flex items-center gap-1 border border-neutral-200">
                      <UploadCloud className="w-3 h-3" />
                      <span>Upload Local Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0], false)}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-neutral-500 font-medium">or drag &amp; drop / press</span>
                    <span className="px-1.5 py-0.2 rounded bg-neutral-900 text-white font-mono text-[9px]">Ctrl + V</span>
                    <span className="text-[10px] text-neutral-500 font-medium">to paste</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Switch / Toggle */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <Switch
                id="cat-form-active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked)}
                label="Publish & make visible across the storefront collection navigation"
                description="When enabled, this category will appear in the navigation bar and catalog filters on the website."
              />
            </div>

            {/* Form Footer Buttons */}
            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSubView('all')}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                size="sm"
                className="bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-xs px-6"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-neutral-200">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-neutral-900 text-sm">Delete Category?</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Are you sure you want to delete <strong className="text-neutral-900 font-semibold">"{categories.find(c => c.id === deleteConfirmId)?.name || 'this category'}"</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)} className="text-xs h-8 px-3 border-neutral-200 text-neutral-700 hover:bg-neutral-50 cursor-pointer">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 px-3.5 font-medium cursor-pointer"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM STATUS TOGGLE DIALOG */}
      {statusConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-neutral-200 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-neutral-950 text-sm">
                {statusConfirmItem.isActive !== false ? 'Deactivate Category?' : 'Activate Category?'}
              </h3>
              <p className="text-xs text-neutral-500">
                {statusConfirmItem.isActive !== false
                  ? `Deactivating "${statusConfirmItem.name}" will hide it from the customer storefront navigation.`
                  : `Activating "${statusConfirmItem.name}" will make it visible in the storefront.`}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setStatusConfirmItem(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmStatusToggle}
                className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default CategoriesPage;
