import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit2, 
  Sparkles, 
  X, 
  Check, 
  Search, 
  RefreshCw, 
  PackageCheck,
  Tag,
  FolderTree,
  Palette
} from 'lucide-react';
import { getGlobalVariantsList } from '../data/mockAdminData';
import { Attribute, AttributeValue, Variant, Category, Subcategory } from '../types/admin';
import { AdminApiService } from '../services/adminApi';

export const ProductManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'attributes' | 'variants' | 'categories'>('attributes');

  // CATEGORIES & SUBCATEGORIES STATE
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showAddSubcatModal, setShowAddSubcatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newSubcatName, setNewSubcatName] = useState('');
  const [selectedParentCatId, setSelectedParentCatId] = useState('');

  // ATTRIBUTES STATE
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [showAddAttrModal, setShowAddAttrModal] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);

  useEffect(() => {
    AdminApiService.getCategories().then((res) => {
      if (res?.categories && Array.isArray(res.categories)) setCategories(res.categories);
      if (res?.subcategories && Array.isArray(res.subcategories)) setSubcategories(res.subcategories);
      if (res?.categories?.[0]?.id) setSelectedParentCatId(res.categories[0].id);
    }).catch(() => {});

    AdminApiService.getAttributes().then((attrs) => {
      if (Array.isArray(attrs)) setAttributes(attrs);
    }).catch(() => {});
  }, []);

  // New attribute form state
  const [newAttrName, setNewAttrName] = useState('');
  const [newDisplayType, setNewDisplayType] = useState<'swatch' | 'button' | 'select'>('button');
  const [newValueInput, setNewValueInput] = useState('');
  const [newHexInput, setNewHexInput] = useState('#000000');
  const [tempValues, setTempValues] = useState<AttributeValue[]>([]);

  // Edit attribute form state
  const [editAttrName, setEditAttrName] = useState('');
  const [editDisplayType, setEditDisplayType] = useState<'swatch' | 'button' | 'select'>('button');
  const [editValues, setEditValues] = useState<AttributeValue[]>([]);
  const [editValInput, setEditValInput] = useState('');
  const [editHexInput, setEditHexInput] = useState('#000000');

  // VARIANTS STATE
  const [variantsList, setVariantsList] = useState<Variant[]>(getGlobalVariantsList);
  const [variantSearch, setVariantSearch] = useState('');
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);

  // New variant form state
  const [newVarColor, setNewVarColor] = useState('Black');
  const [newVarSize, setNewVarSize] = useState('S');
  const [newVarSku, setNewVarSku] = useState('');
  const [newVarPrice, setNewVarPrice] = useState<number>(799);
  const [newVarOriginalPrice, setNewVarOriginalPrice] = useState<number>(1299);
  const [newVarStock, setNewVarStock] = useState<number>(50);
  const [newVarImage, setNewVarImage] = useState('https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=400');
  const [newVarBarcode, setNewVarBarcode] = useState('');
  const [newVarStatus, setNewVarStatus] = useState<'Active' | 'Inactive'>('Active');

  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

  // CATEGORY & SUBCATEGORY CRUD HANDLERS
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug: newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      productCount: 0,
      isActive: true
    };

    setCategories((prev) => [...prev, newCat]);
    setNewCatName('');
    setShowAddCatModal(false);
    AdminApiService.createCategory(newCat).catch(() => {});
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Delete this Category?')) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      AdminApiService.deleteCategory(id).catch(() => {});
    }
  };

  const handleCreateSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcatName.trim()) return;
    const parent = categories.find((c) => c.id === selectedParentCatId) || categories[0];

    const newSubcat: Subcategory = {
      id: `sub-${Date.now()}`,
      categoryId: parent?.id || 'cat-1',
      categoryName: parent?.name || 'Category',
      name: newSubcatName.trim(),
      slug: newSubcatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
    };

    setSubcategories((prev) => [...prev, newSubcat]);
    setNewSubcatName('');
    setShowAddSubcatModal(false);
  };

  const handleDeleteSubcategory = (id: string) => {
    if (window.confirm('Delete this Subcategory?')) {
      setSubcategories((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // ATTRIBUTE CRUD HANDLERS
  const handleAddTempValue = () => {
    if (!newValueInput.trim()) return;
    const valObj: AttributeValue = {
      id: `val-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      value: newValueInput.trim(),
      hexCode: newDisplayType === 'swatch' ? newHexInput : undefined
    };
    setTempValues((prev) => [...prev, valObj]);
    setNewValueInput('');
  };

  const handleCreateAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttrName.trim() || tempValues.length === 0) return;

    const newAttr: Attribute = {
      id: `attr-${Date.now()}`,
      name: newAttrName.trim(),
      displayType: newDisplayType,
      values: tempValues
    };

    setAttributes((prev) => [...prev, newAttr]);
    setShowAddAttrModal(false);
    setNewAttrName('');
    setNewDisplayType('button');
    setTempValues([]);
  };

  const handleOpenEditAttr = (attr: Attribute) => {
    setEditingAttr(attr);
    setEditAttrName(attr.name);
    setEditDisplayType(attr.displayType);
    setEditValues([...attr.values]);
  };

  const handleAddEditValue = () => {
    if (!editValInput.trim()) return;
    const valObj: AttributeValue = {
      id: `val-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      value: editValInput.trim(),
      hexCode: editDisplayType === 'swatch' ? editHexInput : undefined
    };
    setEditValues((prev) => [...prev, valObj]);
    setEditValInput('');
  };

  const handleRemoveEditValue = (id: string) => {
    setEditValues((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSaveAttributeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttr || !editAttrName.trim() || editValues.length === 0) return;

    const updatedAttr: Attribute = {
      ...editingAttr,
      name: editAttrName.trim(),
      displayType: editDisplayType,
      values: editValues
    };

    setAttributes((prev) => prev.map((a) => (a.id === editingAttr.id ? updatedAttr : a)));
    setEditingAttr(null);
  };

  const handleDeleteAttribute = (id: string) => {
    if (window.confirm('Delete this attribute?')) {
      setAttributes((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // VARIANT CRUD HANDLERS
  const handleCreateVariant = (e: React.FormEvent) => {
    e.preventDefault();
    const skuCode = newVarSku.trim() || `AAR-${newVarColor.substring(0, 3).toUpperCase()}-${newVarSize.toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newVariant: Variant = {
      id: `v-${Date.now()}`,
      sku: skuCode,
      parentProductName: "Master Catalog Item",
      color: newVarColor,
      size: newVarSize,
      price: newVarPrice,
      originalPrice: newVarOriginalPrice,
      stock: newVarStock,
      image: newVarImage,
      barcode: newVarBarcode || `890123${Math.floor(100000 + Math.random() * 900000)}`,
      status: newVarStatus
    };

    setVariantsList((prev) => [newVariant, ...prev]);
    setShowAddVariantModal(false);
    setNewVarSku('');
  };

  const handleDeleteVariant = (id: string) => {
    if (window.confirm('Remove this variant combination?')) {
      setVariantsList((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const handleSaveVariantEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant) return;

    setVariantsList((prev) =>
      prev.map((v) => (v.id === editingVariant.id ? { ...editingVariant } : v))
    );
    setEditingVariant(null);
  };

  const filteredVariants = variantsList.filter((v) => {
    const search = variantSearch.toLowerCase();
    return (
      (v.sku || '').toLowerCase().includes(search) ||
      (v.color || '').toLowerCase().includes(search) ||
      (v.size || '').toLowerCase().includes(search) ||
      (v.parentProductName || '').toLowerCase().includes(search)
    );
  });

  const colorAttr = attributes.find((a) => a.name.toLowerCase() === 'color');
  const sizeAttr = attributes.find((a) => a.name.toLowerCase() === 'size');

  const availableColorValues = colorAttr ? colorAttr.values.map((v) => v.value) : ['Black', 'White', 'Beige', 'Pink', 'Denim Blue'];
  const availableSizeValues = sizeAttr ? sizeAttr.values.map((v) => v.value) : ['XS', 'S', 'M', 'L', 'XL', '34B', '36B'];

  return (
    <div className="space-y-6 font-sans selection:bg-black selection:text-white">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-black tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-black" />
            <span>Master Product Management</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Master CRUD for Categories, Subcategories, Attributes &amp; Option Swatches, and Variants.
          </p>
        </div>

        {/* VERCEL TABS SWITCHER */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-md border border-neutral-200 gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-white text-black shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('attributes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'attributes'
                ? 'bg-white text-black shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Attributes ({attributes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('variants')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'variants'
                ? 'bg-white text-black shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Variants ({variantsList.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CATEGORIES & SUBCATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-black">Categories &amp; Subcategories Catalog</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddCatModal(true)}
                className="flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-medium px-3.5 py-2 rounded-md shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>

              <button
                onClick={() => setShowAddSubcatModal(true)}
                className="flex items-center gap-1.5 bg-white text-black hover:bg-neutral-100 border border-neutral-200 text-xs font-medium px-3.5 py-2 rounded-md transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-neutral-500" />
                <span>Add Subcategory</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const childSubcats = subcategories.filter((s) => s.categoryId === cat.id || s.categoryName === cat.name);
              return (
                <div key={cat.id} className="p-5 rounded-xl bg-white border border-neutral-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
                    <h3 className="font-semibold text-black text-sm flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-neutral-600" />
                      <span>{cat.name}</span>
                    </h3>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 text-neutral-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-medium uppercase text-neutral-400 tracking-wider">
                      Subcategories ({childSubcats.length})
                    </h4>

                    {childSubcats.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic">No subcategories linked yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {childSubcats.map((sub) => (
                          <span
                            key={sub.id}
                            className="px-2.5 py-1 rounded-md bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-800 flex items-center gap-1.5"
                          >
                            <span>{sub.name}</span>
                            <button
                              onClick={() => handleDeleteSubcategory(sub.id)}
                              className="text-neutral-400 hover:text-rose-600 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT ATTRIBUTES */}
      {activeTab === 'attributes' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-black">Attributes &amp; Swatches Catalog</h2>
            <button
              onClick={() => setShowAddAttrModal(true)}
              className="flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-medium px-3.5 py-2 rounded-md shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Attribute</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {attributes.map((attr) => (
              <div key={attr.id} className="p-5 rounded-xl bg-white border border-neutral-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-black text-base flex items-center gap-2">
                      <span>{attr.name}</span>
                      <span className="text-[10px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200 uppercase">
                        {attr.displayType}
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {attr.values.length} predefined option swatches
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditAttr(attr)}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-black border border-neutral-200 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Swatches</span>
                    </button>

                    <button
                      onClick={() => handleDeleteAttribute(attr.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {attr.values.map((v) => (
                    <div
                      key={v.id}
                      className="px-2.5 py-1.5 rounded-md bg-neutral-50 border border-neutral-200 flex items-center gap-2 text-xs font-medium text-neutral-800"
                    >
                      {v.hexCode && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs shrink-0"
                          style={{ backgroundColor: v.hexCode }}
                        ></span>
                      )}
                      <span>{v.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCT VARIANTS */}
      {activeTab === 'variants' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search variants by SKU, color, size..."
                value={variantSearch}
                onChange={(e) => setVariantSearch(e.target.value)}
                className="w-full bg-white text-xs text-black pl-8 pr-3 py-1.5 rounded-md border border-neutral-200 focus:outline-none focus:border-black"
              />
            </div>

            <button
              onClick={() => setShowAddVariantModal(true)}
              className="flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-medium px-3.5 py-2 rounded-md shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Variant</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-medium uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Variant Image</th>
                    <th className="py-3 px-4">Variant Combination</th>
                    <th className="py-3 px-4">SKU &amp; Barcode</th>
                    <th className="py-3 px-4">Price (₹)</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredVariants.map((v) => (
                    <tr key={v.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={v.image || 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=100'}
                          alt={v.sku}
                          className="w-8 h-8 rounded-md object-cover border border-neutral-200 bg-neutral-100"
                        />
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-black">{v.color || 'Default'}</span>
                          <span className="text-neutral-300">•</span>
                          <span className="font-medium text-black bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 text-[11px]">
                            {v.size || 'Standard'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-mono font-medium text-black">{v.sku}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">{v.barcode || 'N/A'}</p>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-black">₹{v.price}</span>
                        {v.originalPrice > v.price && (
                          <span className="text-[10px] text-neutral-400 line-through ml-1">₹{v.originalPrice}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-medium ${v.stock > 10 ? 'text-neutral-800' : 'text-amber-700'}`}>
                          {v.stock} units
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {v.status || 'Active'}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right space-x-1">
                        <button
                          onClick={() => handleDeleteVariant(v.id)}
                          className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-neutral-200 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-semibold text-black text-sm">Create New Category</h3>
              <button onClick={() => setShowAddCatModal(false)} className="p-1 text-neutral-400 hover:text-black">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-black block mb-1">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Lounge & Sleep"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-md border border-neutral-200 font-medium text-xs focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-3 py-1.5 rounded-md text-neutral-600 font-medium hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-neutral-800 text-white font-medium px-4 py-1.5 rounded-md shadow-2xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SUBCATEGORY MODAL */}
      {showAddSubcatModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-semibold text-black text-sm">Create New Subcategory</h3>
              <button onClick={() => setShowAddSubcatModal(false)} className="p-1 text-neutral-400 hover:text-black">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubcategory} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-black block mb-1">Parent Category *</label>
                <select
                  value={selectedParentCatId}
                  onChange={(e) => setSelectedParentCatId(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-md border border-neutral-200 text-xs font-medium cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-black block mb-1">Subcategory Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Wireless Padded"
                  value={newSubcatName}
                  onChange={(e) => setNewSubcatName(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-md border border-neutral-200 text-xs font-medium focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubcatModal(false)}
                  className="px-3 py-1.5 rounded-md text-neutral-600 font-medium hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-neutral-800 text-white font-medium px-4 py-1.5 rounded-md shadow-2xs"
                >
                  Save Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ATTRIBUTE MODAL */}
      {showAddAttrModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-semibold text-black text-sm">Create New Attribute</h3>
              <button onClick={() => setShowAddAttrModal(false)} className="p-1 text-neutral-400 hover:text-black">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAttribute} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-black block mb-1">Attribute Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Material, Fabric..."
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-md border border-neutral-200 text-xs font-medium focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-black block mb-1">Display Type</label>
                <select
                  value={newDisplayType}
                  onChange={(e) => setNewDisplayType(e.target.value as any)}
                  className="w-full bg-white p-2.5 rounded-md border border-neutral-200 text-xs font-medium cursor-pointer"
                >
                  <option value="button">Text Button Swatch</option>
                  <option value="swatch">Color Hex Swatch</option>
                  <option value="select">Dropdown Select</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-medium text-black block">Add Swatch Values</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Value (e.g. Cotton, Nude)"
                    value={newValueInput}
                    onChange={(e) => setNewValueInput(e.target.value)}
                    className="flex-1 bg-white p-2 rounded-md border border-neutral-200 text-xs font-medium"
                  />
                  {newDisplayType === 'swatch' && (
                    <input
                      type="color"
                      value={newHexInput}
                      onChange={(e) => setNewHexInput(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded-md border border-neutral-200 cursor-pointer bg-white"
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleAddTempValue}
                    className="bg-white hover:bg-neutral-100 text-black border border-neutral-200 font-medium px-3 rounded-md text-xs"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tempValues.map((v) => (
                    <span key={v.id} className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-xs font-medium text-black">
                      {v.value}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAttrModal(false)}
                  className="px-3 py-1.5 rounded-md text-neutral-600 font-medium hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-neutral-800 text-white font-medium px-4 py-1.5 rounded-md shadow-2xs"
                >
                  Save Attribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE VARIANT MODAL */}
      {showAddVariantModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-semibold text-black text-sm">Create Master Variant</h3>
              <button onClick={() => setShowAddVariantModal(false)} className="p-1 text-neutral-400 hover:text-black">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateVariant} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-black block mb-1">Color Option</label>
                  <select
                    value={newVarColor}
                    onChange={(e) => setNewVarColor(e.target.value)}
                    className="w-full bg-white p-2 rounded-md border border-neutral-200 font-medium"
                  >
                    {availableColorValues.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-black block mb-1">Size Option</label>
                  <select
                    value={newVarSize}
                    onChange={(e) => setNewVarSize(e.target.value)}
                    className="w-full bg-white p-2 rounded-md border border-neutral-200 font-medium"
                  >
                    {availableSizeValues.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-black block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newVarPrice}
                    onChange={(e) => setNewVarPrice(Number(e.target.value))}
                    className="w-full bg-white p-2 rounded-md border border-neutral-200 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="font-medium text-black block mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={newVarStock}
                    onChange={(e) => setNewVarStock(Number(e.target.value))}
                    className="w-full bg-white p-2 rounded-md border border-neutral-200 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVariantModal(false)}
                  className="px-3 py-1.5 rounded-md text-neutral-600 font-medium hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-neutral-800 text-white font-medium px-4 py-1.5 rounded-md shadow-2xs"
                >
                  Save Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
