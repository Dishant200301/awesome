import React, { useState, useEffect, useRef } from 'react';
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
  X
} from 'lucide-react';
import { MOCK_CATEGORIES, MOCK_SUBCATEGORIES } from '../data/mockAdminData';
import { Category } from '../types/admin';
import { Select } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

export interface EnhancedCategory extends Category {
  image?: string;
  type?: 'parent' | 'sub';
  parentId?: string;
  parentName?: string;
}

interface CategoriesPageProps {
  initialTab?: string;
  onNavigate?: (tab: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ initialTab = 'all-categories', onNavigate }) => {
  // Main Categories State with LocalStorage Persistence (12 Master Categories Default)
  const [categories, setCategories] = useState<EnhancedCategory[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('awesome_categories') || localStorage.getItem('aocind_categories');
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    const initialParents = MOCK_CATEGORIES.map(c => ({ ...c, type: 'parent' as const }));
    const initialSubs = MOCK_SUBCATEGORIES.map(s => ({ ...s, type: 'sub' as const }));
    return [...initialParents, ...initialSubs];
  });

  // Navigation & View Mode: 'all' | 'add' | 'edit'
  const [subView, setSubView] = useState<'all' | 'add' | 'edit'>(() => {
    return initialTab === 'add-category' ? 'add' : 'all';
  });

  // Sync subView if initialTab changes
  useEffect(() => {
    if (initialTab === 'add-category') {
      setSubView('add');
    } else if (initialTab === 'all-categories' || initialTab === 'categories') {
      setSubView('all');
    }
  }, [initialTab]);

  // Separate Filter Tab: 'ALL' | 'MAIN' | 'SUB'
  const [filterType, setFilterType] = useState<'ALL' | 'MAIN' | 'SUB'>('ALL');

  // Search Query
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [editingCategory, setEditingCategory] = useState<EnhancedCategory | null>(null);
  const [categoryType, setCategoryType] = useState<'parent' | 'sub'>('parent');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryImage, setCategoryImage] = useState<string>('/images/category/Latkan.webp');
  const [isActive, setIsActive] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api/v1" : "http://localhost:5000/api/v1");

  // Fetch live categories from Express Server on mount
  useEffect(() => {
    fetch(`${API_BASE}/taxonomies/categories`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data.categories)) {
          const parents = json.data.categories.map((c: any) => ({
            ...c,
            type: 'parent' as const,
          }));
          const subs = (json.data.subcategories || []).map((s: any) => ({
            ...s,
            type: 'sub' as const,
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
        window.dispatchEvent(new Event('aaramly_category_sync'));
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories }),
    }).catch(() => {});
  }, [categories]);

  // Main Categories list for parent selection
  const mainCategoriesList = categories.filter((c) => c.type !== 'sub');
  const subCategoriesList = categories.filter((c) => c.type === 'sub');

  // Helper to find parent slug for URL display
  const getParentSlug = (parentId?: string, parentName?: string) => {
    if (parentId) {
      const parent = categories.find((c) => c.id === parentId);
      if (parent) return parent.slug;
    }
    if (parentName) {
      return parentName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    return '';
  };

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open Add View
  const handleOpenAddView = (defaultType: 'parent' | 'sub' = 'parent') => {
    setEditingCategory(null);
    setCategoryType(defaultType);
    setSelectedParentId(mainCategoriesList[0]?.id || '');
    setCategoryName('');
    setCategorySlug('');
    setCategoryImage('');
    setIsActive(true);
    setSubView('add');
  };

  // Open Edit View
  const handleOpenEditView = (cat: EnhancedCategory) => {
    setEditingCategory(cat);
    const type = cat.type || (cat.parentId ? 'sub' : 'parent');
    setCategoryType(type);
    setSelectedParentId(cat.parentId || mainCategoriesList[0]?.id || '');
    setCategoryName(cat.name);
    setCategorySlug(cat.slug);
    setCategoryImage(cat.image || '');
    setIsActive(cat.isActive ?? true);
    setSubView('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Process File to Base64 / Data URL
  const handleFileProcess = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setCategoryImage(uploadEvent.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag and Drop Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  // Handle Input Change Upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  // Handle Name Input Change & Auto-generate Slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCategoryName(val);
    if (!editingCategory) {
      setCategorySlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
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
                type: categoryType,
                parentId: categoryType === 'sub' ? selectedParentId : undefined,
                parentName: parentObj ? parentObj.name : undefined,
                isActive
              }
            : c
        )
      );
    } else {
      // CREATE NEW
      const newCat: EnhancedCategory = {
        id: categoryType === 'sub' ? `sub-${Date.now()}` : `cat-${Date.now()}`,
        name: categoryName.trim(),
        slug: slugToSave,
        image: categoryImage,
        type: categoryType,
        parentId: categoryType === 'sub' ? selectedParentId : undefined,
        parentName: parentObj ? parentObj.name : undefined,
        productCount: 0,
        isActive
      };
      setCategories((prev) => [newCat, ...prev]);
    }

    setSubView('all');
    setEditingCategory(null);
  };

  // Delete Category
  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? Subcategories or assigned products may be affected.')) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (editingCategory?.id === id) {
        setSubView('all');
        setEditingCategory(null);
      }
    }
  };

  // Toggle Active Status
  const toggleStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Filter categories based on search term & separate category filter tab
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
    <div className="space-y-6 font-sans selection:bg-black selection:text-white pb-16">
      {/* HEADER WITH ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-neutral-200 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-black" />
            <span>All Categories &amp; Subcategories</span>
            <Badge variant="secondary" className="text-xs font-semibold bg-neutral-100 text-neutral-800 border-neutral-200">
              {categories.length} Total
            </Badge>
          </h1>
          <p className="text-xs text-neutral-500 font-normal mt-1">
            Organize products into Main Categories &amp; Subcategories without image bloat.
          </p>
        </div>

        {/* SUB-VIEW NAVIGATION */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setSubView('all')}
            variant={subView === 'all' ? 'default' : 'outline'}
            size="sm"
            className={`text-xs font-medium ${subView === 'all' ? 'bg-black text-white hover:bg-neutral-800' : 'text-black border-neutral-200 hover:bg-neutral-50'}`}
          >
            All List ({categories.length})
          </Button>

          <Button
            onClick={() => handleOpenAddView('parent')}
            variant={subView === 'add' ? 'default' : 'outline'}
            size="sm"
            className={`text-xs font-medium flex items-center gap-1.5 ${subView === 'add' ? 'bg-black text-white hover:bg-neutral-800' : 'text-black border-neutral-200 hover:bg-neutral-50'}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category &amp; Subcategory</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: ALL CATEGORIES & SUBCATEGORIES LISTING */}
      {/* ========================================================================= */}
      {subView === 'all' && (
        <div className="space-y-6">
          {/* SEARCH & SEPARATE FILTER TABS (MAIN VS SUB) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Tabs: ALL | MAIN CATEGORIES | SUBCATEGORIES */}
            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-lg border border-neutral-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'ALL' ? 'bg-black text-white shadow-2xs' : 'text-neutral-600 hover:text-black'
                }`}
              >
                All ({categories.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('MAIN')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'MAIN' ? 'bg-black text-white shadow-2xs' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Main Categories ({mainCategoriesList.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('SUB')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'SUB' ? 'bg-black text-white shadow-2xs' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Subcategories ({subCategoriesList.length})
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search category or subcategory name..."
                className="pl-8 text-xs bg-white border-neutral-200"
              />
            </div>
          </div>

          {/* CATEGORIES & SUBCATEGORIES GRID CARDS */}
          {filteredCategories.length === 0 ? (
            <Card className="p-12 text-center space-y-3 bg-white border-neutral-200">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                <FolderTree className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-black">No Categories Found</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No category matches "{searchTerm}". Click "Add Category &amp; Subcategory" to create one.
              </p>
              <Button onClick={() => handleOpenAddView('parent')} size="sm" className="bg-black text-white hover:bg-neutral-800 text-xs font-medium mt-2">
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Category</span>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((cat) => (
                <Card
                  key={cat.id}
                  className={`p-5 bg-white border border-neutral-200 shadow-2xs rounded-xl flex flex-col justify-between hover:border-neutral-300 transition-all ${
                    !cat.isActive ? 'opacity-70 bg-neutral-50/50' : ''
                  }`}
                >
                  <div className="space-y-3">
                    {/* TYPE BADGE & ACTIVE STATUS TOGGLE */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-semibold border ${
                          cat.type === 'sub'
                            ? 'bg-neutral-100 text-neutral-800 border-neutral-300'
                            : 'bg-black text-white border-black'
                        }`}
                      >
                        {cat.type === 'sub' ? 'Subcategory' : 'Main Category'}
                      </Badge>

                      <button
                        onClick={() => toggleStatus(cat.id)}
                        title={cat.isActive ? "Deactivate category" : "Activate category"}
                        className="cursor-pointer shrink-0"
                      >
                        {cat.isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </button>
                    </div>

                    {/* IMAGE THUMBNAIL, NAME & PARENT BREADCRUMB */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 shadow-2xs">
                        <img
                          src={cat.image || '/images/category/Latkan.webp'}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        {cat.type === 'sub' && (cat.parentName || cat.parentId) && (
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block flex items-center gap-1 mb-0.5">
                            <span>{cat.parentName || 'Main Category'}</span>
                            <ChevronRight className="w-2.5 h-2.5 text-neutral-400" />
                          </span>
                        )}
                        <h3 className="font-bold text-black text-sm tracking-tight truncate">{cat.name}</h3>
                        <span className="text-[10px] text-neutral-400 font-mono truncate block">
                          /{cat.type === 'sub' && getParentSlug(cat.parentId, cat.parentName) ? `${getParentSlug(cat.parentId, cat.parentName)}/` : ''}{cat.slug}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTIONS */}
                  <div className="pt-4 border-t border-neutral-100 mt-4 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-neutral-400 font-normal">
                      ID: <span className="font-mono text-neutral-600">{cat.id}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => handleOpenEditView(cat)}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 px-2.5 font-medium text-black border-neutral-200 hover:bg-neutral-100"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        onClick={() => handleDeleteCategory(cat.id)}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 px-2 text-neutral-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2 & 3: FULL PAGE CREATE / EDIT FORM */}
      {/* ========================================================================= */}
      {(subView === 'add' || subView === 'edit') && (
        <Card className="p-6 sm:p-8 bg-white border border-neutral-200 shadow-2xs rounded-xl max-w-2xl mx-auto space-y-6 font-sans">
          {/* FORM TOP BAR */}
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubView('all')}
                className="text-xs border-neutral-200 text-neutral-700 hover:bg-neutral-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Categories</span>
              </Button>
              <div>
                <h2 className="text-base font-bold text-black tracking-tight">
                  {subView === 'edit' ? `Edit Category: ${categoryName}` : 'Add Category & Subcategory'}
                </h2>
                <p className="text-xs text-neutral-500 font-normal">
                  Configure name, category type, and parent main category.
                </p>
              </div>
            </div>

            {subView === 'edit' && editingCategory && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteCategory(editingCategory.id)}
                className="text-xs border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>
            )}
          </div>

          <form onSubmit={handleSaveCategory} className="space-y-5 text-xs">
            {/* CATEGORY TYPE TOGGLE (MAIN CATEGORY VS SUBCATEGORY) */}
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                Select Classification *
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-lg border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setCategoryType('parent')}
                  className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    categoryType === 'parent' ? 'bg-black text-white shadow-2xs' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Main Category
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryType('sub')}
                  className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    categoryType === 'sub' ? 'bg-black text-white shadow-2xs' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Subcategory
                </button>
              </div>
            </div>

            {/* IF SUBCATEGORY: SELECT PARENT MAIN CATEGORY */}
            {categoryType === 'sub' && (
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Select Parent Main Category *
                </label>
                <Select
                  value={selectedParentId || mainCategoriesList[0]?.id || ''}
                  onValueChange={setSelectedParentId}
                  options={mainCategoriesList.map((p) => ({ value: p.id, label: p.name }))}
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  This subcategory will be grouped under the selected Main Category.
                </span>
              </div>
            )}

            {/* CATEGORY / SUBCATEGORY NAME */}
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                {categoryType === 'sub' ? 'Subcategory Name *' : 'Main Category Name *'}
              </label>
              <Input
                type="text"
                required
                placeholder={categoryType === 'sub' ? 'e.g. Mirror Latkan, Kids Choli' : 'e.g. Latkan, Choli, Gift Hamper, Necklace'}
                value={categoryName}
                onChange={handleNameChange}
                className="bg-white border-neutral-200 text-xs text-black font-medium"
              />
            </div>

            {/* URL SLUG */}
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                URL Slug (Auto-generated)
              </label>
              <div className="flex items-center gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 text-xs font-mono overflow-x-auto">
                <span className="text-neutral-400 text-[11px] shrink-0">
                  /{categoryType === 'sub' && (mainCategoriesList.find(c => c.id === selectedParentId)?.slug || getParentSlug(selectedParentId)) ? `${mainCategoriesList.find(c => c.id === selectedParentId)?.slug || getParentSlug(selectedParentId)}/` : ''}
                </span>
                <input
                  type="text"
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="flex-1 bg-transparent text-black font-bold focus:outline-none min-w-[120px]"
                />
              </div>
            </div>

            {/* CATEGORY IMAGE (DRAG & DROP / UPLOAD / DIRECT URL) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">
                  Category Display Image *
                </label>
                {categoryImage && (
                  <button
                    type="button"
                    onClick={() => setCategoryImage('')}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove Image</span>
                  </button>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileUpload}
                className="hidden"
              />

              {/* DRAG & DROP UPLOAD ZONE */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-xl border-2 border-dashed p-4 sm:p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragOver
                    ? 'border-black bg-neutral-100 scale-[0.99]'
                    : categoryImage
                    ? 'border-neutral-300 bg-neutral-50/70 hover:border-black'
                    : 'border-neutral-300 hover:border-black bg-neutral-50/50 hover:bg-neutral-50'
                }`}
              >
                {categoryImage ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-white border border-neutral-200 shadow-sm shrink-0">
                      <img
                        src={categoryImage}
                        alt="Category Preview"
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="text-center sm:text-left space-y-1">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-black">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Image Selected</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 font-normal">
                        Click or drag a new image here to replace
                      </p>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[11px] font-semibold rounded-lg shadow-xs hover:bg-neutral-800 transition-colors">
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Change File</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-2">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 flex items-center justify-center mx-auto shadow-2xs">
                      <UploadCloud className="w-6 h-6 text-black" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-black">
                        Drag & drop category image here, or <span className="underline text-brand-maroon">Browse</span>
                      </p>
                      <p className="text-[11px] text-neutral-400 font-normal">
                        Supports PNG, JPG, WEBP, AVIF (Max 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* DIRECT URL INPUT */}
              <div className="pt-1">
                <span className="text-[11px] text-neutral-500 font-medium block mb-1">
                  Or enter image URL / asset path:
                </span>
                <Input
                  type="text"
                  placeholder="e.g. /images/category/Latkan.webp or https://images.unsplash.com/..."
                  value={categoryImage}
                  onChange={(e) => setCategoryImage(e.target.value)}
                  className="bg-white border-neutral-200 text-xs text-black font-medium h-8"
                />
              </div>
            </div>

            {/* STATUS TOGGLE */}
            <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <div>
                <span className="text-xs font-bold text-black block">Status Pipeline</span>
                <span className="text-[11px] text-neutral-400 font-normal block">Enable or disable visibility on storefront website</span>
              </div>

              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                  isActive ? 'bg-black text-white border-black' : 'bg-white text-neutral-600 border-neutral-200'
                }`}
              >
                {isActive ? '✓ Active' : 'Inactive'}
              </button>
            </div>

            {/* FORM ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubView('all')}
                className="text-xs border-neutral-200 text-neutral-700 hover:bg-neutral-100 font-medium"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="bg-black hover:bg-neutral-800 text-white font-semibold text-xs px-6 py-2 rounded-md shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{subView === 'edit' ? 'Update Category' : 'Save Category'}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default CategoriesPage;
