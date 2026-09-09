import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Trash2, 
  Edit2, 
  Eye, 
  Filter, 
  Package, 
  Tag, 
  Check, 
  X, 
  Sparkles,
  ArrowUpRight,
  UploadCloud
} from 'lucide-react';
import { getGlobalVariantsList, getAdminProducts } from '../data/mockAdminData';
import { Variant } from '../types/admin';
import { Select } from '../components/ui/select';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { compressImage } from '../utils/imageCompressor';

interface ProductVariantsPageProps {
  onNavigate: (tab: string, productId?: string) => void;
}

export const ProductVariantsPage: React.FC<ProductVariantsPageProps> = ({ onNavigate }) => {
  const [variantsList, setVariantsList] = useState<Variant[]>(getGlobalVariantsList);
  const [searchTerm, setSearchTerm] = useState('');
  const [parentFilter, setParentFilter] = useState('ALL');
  const [colorFilter, setColorFilter] = useState('ALL');
  const [sizeFilter, setSizeFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [deleteCandidate, setDeleteCandidate] = useState<Variant | null>(null);

  // Edit Modal State
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editProductInfo, setEditProductInfo] = useState<string>('');
  const [editImage, setEditImage] = useState<string>('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editOriginalPrice, setEditOriginalPrice] = useState<number>(0);
  const [editCostPrice, setEditCostPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editSku, setEditSku] = useState<string>('');
  const [editBarcode, setEditBarcode] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive' | 'Out of Stock'>('Active');
  const [isVariantDragOver, setIsVariantDragOver] = useState(false);

  // Filter list
  const filteredVariants = variantsList.filter((v) => {
    const parentName = v.parentProductName || '';
    const sku = v.sku || '';
    const color = v.color || '';
    const size = v.size || '';

    const matchesSearch =
      parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      size.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesParent = parentFilter === 'ALL' || v.parentProductId === parentFilter;
    const matchesColor = colorFilter === 'ALL' || color === colorFilter;
    const matchesSize = sizeFilter === 'ALL' || size === sizeFilter;

    const matchesStock =
      stockFilter === 'ALL'
        ? true
        : stockFilter === 'IN_STOCK'
        ? v.stock > 10
        : stockFilter === 'LOW_STOCK'
        ? v.stock > 0 && v.stock <= 10
        : v.stock === 0;

    return matchesSearch && matchesParent && matchesColor && matchesSize && matchesStock;
  });

  // Unique lists for filters
  const uniqueParents = getAdminProducts().filter((p) => p.type === 'Variable');
  const uniqueColors = Array.from(new Set(variantsList.map((v) => v.color).filter((c): c is string => Boolean(c))));
  const uniqueSizes = Array.from(new Set(variantsList.map((v) => v.size).filter((s): s is string => Boolean(s))));

  // Save Inline Edit
  const handleSaveVariantEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant) return;

    const updatedVariant: Variant = {
      ...editingVariant,
      title: editTitle.trim() || editingVariant.title,
      productInfo: editProductInfo.trim(),
      image: editImage.trim() || editingVariant.image,
      price: editPrice,
      originalPrice: editOriginalPrice,
      costPrice: editCostPrice,
      stock: editStock,
      sku: editSku,
      barcode: editBarcode,
      status: editStock === 0 ? 'Out of Stock' : editStatus
    };

    setVariantsList((prev) =>
      prev.map((v) => (v.id === editingVariant.id ? updatedVariant : v))
    );

    // Sync with parent product in store and broadcast
    if (editingVariant.parentProductId) {
      const parentProd = getAdminProducts().find((p) => p.id === editingVariant.parentProductId);
      if (parentProd && parentProd.variants) {
        parentProd.variants = parentProd.variants.map((v) =>
          v.id === editingVariant.id ? updatedVariant : v
        );
        import('../data/mockAdminData').then((m) => m.broadcastAdminProductChange(parentProd));
      }
    }

    setEditingVariant(null);
  };

  // Delete Variant
  const handleDeleteVariant = (variant: Variant) => {
    setDeleteCandidate(variant);
  };

  const confirmDeleteVariant = () => {
    if (!deleteCandidate) return;
    setVariantsList((prev) => prev.filter((v) => v.id !== deleteCandidate.id));
    setDeleteCandidate(null);
  };

  return (
    <div className="space-y-6 font-sans selection:bg-rose-500 selection:text-white">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-indigo-600" />
            <span>Product Variants Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global listing of all generated product variations across color swatches, sizes, SKUs, and stock levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
            Total Active Variants: {variantsList.length}
          </span>
        </div>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search variant SKU, parent product, color or size..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white text-xs text-slate-800 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-black transition-all font-medium placeholder-slate-400"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Parent Filter */}
          <div className="w-44">
            <Select
              value={parentFilter}
              onValueChange={setParentFilter}
              options={[
                { value: 'ALL', label: 'All Parent Products' },
                ...uniqueParents.map((p) => ({ value: p.id, label: p.name }))
              ]}
            />
          </div>

          {/* Color Filter */}
          <div className="w-36">
            <Select
              value={colorFilter}
              onValueChange={setColorFilter}
              options={[
                { value: 'ALL', label: 'All Colors' },
                ...uniqueColors.map((c) => ({ value: c, label: c }))
              ]}
            />
          </div>

          {/* Size Filter */}
          <div className="w-32">
            <Select
              value={sizeFilter}
              onValueChange={setSizeFilter}
              options={[
                { value: 'ALL', label: 'All Sizes' },
                ...uniqueSizes.map((s) => ({ value: s, label: s }))
              ]}
            />
          </div>

          {/* Stock Filter */}
          <div className="w-36">
            <Select
              value={stockFilter}
              onValueChange={setStockFilter}
              options={[
                { value: 'ALL', label: 'All Stock Levels' },
                { value: 'IN_STOCK', label: 'In Stock (>10)' },
                { value: 'LOW_STOCK', label: 'Low Stock (1-10)' },
                { value: 'OUT_OF_STOCK', label: 'Out of Stock (0)' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* VARIANTS DATA TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredVariants.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-800">No Product Variants Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No variant combinations match your filter selection. Try generating variants inside the Add Product page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Variant Image</th>
                  <th className="py-3.5 px-4">Parent Product</th>
                  <th className="py-3.5 px-4">Variant Combination</th>
                  <th className="py-3.5 px-4">Variant SKU</th>
                  <th className="py-3.5 px-4">Price (₹)</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVariants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Variant Thumbnail */}
                    <td
                      className="py-3.5 px-4"
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          try {
                            const dataUrl = await compressImage(file);
                            if (dataUrl) {
                              setVariantsList((prev) =>
                                prev.map((item) =>
                                  item.id === variant.id ? { ...item, image: dataUrl } : item
                                )
                              );
                            }
                          } catch (err) {
                            console.error('Failed to compress variant image:', err);
                          }
                        }
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0"
                        title="Drag & drop a new photo here to update"
                      >
                        {variant.image ? (
                          <img
                            src={variant.image}
                            alt={variant.sku}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Layers className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </td>

                    {/* Parent Product */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          variant.parentProductId &&
                          onNavigate('product-create', variant.parentProductId)
                        }
                        className="font-extrabold text-slate-900 hover:text-indigo-600 flex items-center gap-1 cursor-pointer text-left"
                      >
                        <span>{variant.parentProductName || 'Parent Product'}</span>
                        <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </button>
                    </td>

                    {/* Color / Size */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{variant.color}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                          {variant.size}
                        </span>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-900">
                      {variant.sku}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-extrabold text-emerald-600">₹{variant.price}</span>
                      {variant.originalPrice > variant.price && (
                        <span className="text-[10px] text-slate-400 line-through ml-1 font-medium">
                          ₹{variant.originalPrice}
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`font-extrabold ${
                          variant.stock > 10
                            ? 'text-slate-800'
                            : variant.stock > 0
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {variant.stock} left
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {variant.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setEditingVariant(variant);
                          setEditTitle(variant.title || `${variant.parentProductName || ''} ${variant.color || ''} ${variant.size || ''}`.trim());
                          setEditProductInfo(variant.productInfo || '');
                          setEditImage(variant.image || '');
                          setEditPrice(variant.price);
                          setEditOriginalPrice(variant.originalPrice);
                          setEditCostPrice(variant.costPrice || 0);
                          setEditStock(variant.stock);
                          setEditSku(variant.sku || '');
                          setEditBarcode(variant.barcode || '');
                          setEditStatus(variant.status || (variant.stock === 0 ? 'Out of Stock' : 'Active'));
                        }}
                        title="Edit Variant Details"
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteVariant(variant)}
                        title="Delete Variant"
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT VARIANT MODAL */}
      {editingVariant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Edit Variant Details</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {editingVariant.color} • {editingVariant.size} ({editingVariant.sku})
                </p>
              </div>
              <button
                onClick={() => setEditingVariant(null)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVariantEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold text-slate-800 uppercase tracking-wider block mb-1">
                  Variant Specific Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Custom variant title..."
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-800 uppercase tracking-wider block mb-1">
                  Variant Image
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsVariantDragOver(true);
                  }}
                  onDragLeave={() => setIsVariantDragOver(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setIsVariantDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      try {
                        const dataUrl = await compressImage(file);
                        if (dataUrl) setEditImage(dataUrl);
                      } catch (err) {
                        console.error('Failed to compress variant image:', err);
                      }
                    }
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    isVariantDragOver
                      ? 'border-slate-900 bg-slate-100 scale-99'
                      : 'border-dashed border-slate-200 bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {editImage ? (
                      <img src={editImage} alt="Variant Preview" className="w-full h-full object-cover" />
                    ) : (
                      <UploadCloud className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={editImage}
                      onChange={(e) => setEditImage(e.target.value)}
                      placeholder="Image URL or drop file here..."
                      className="w-full bg-white px-2.5 py-1 text-xs rounded-lg border border-slate-200 font-medium text-slate-900"
                    />
                    <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold cursor-pointer">
                      <UploadCloud className="w-3 h-3" />
                      <span>Upload Local Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const dataUrl = await compressImage(file);
                              if (dataUrl) setEditImage(dataUrl);
                            } catch (err) {
                              console.error('Failed to compress variant image:', err);
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-800 uppercase tracking-wider block mb-1">
                    Variant SKU *
                  </label>
                  <input
                    type="text"
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-800 uppercase tracking-wider block mb-1">
                    Barcode
                  </label>
                  <input
                    type="text"
                    value={editBarcode}
                    onChange={(e) => setEditBarcode(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-extrabold text-slate-800 uppercase tracking-wider block mb-1">
                    Sale Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-extrabold text-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-800 uppercase tracking-wider block mb-1">
                    Regular Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={editOriginalPrice}
                    onChange={(e) => setEditOriginalPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-800 uppercase tracking-wider block mb-1">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold text-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-800 uppercase tracking-wider block mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(Number(e.target.value))}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-800 uppercase tracking-wider block mb-1">
                    Variant Status *
                  </label>
                  <Select
                    value={editStatus}
                    onValueChange={(val) => setEditStatus(val as any)}
                    options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'Inactive', label: 'Inactive' },
                      { value: 'Out of Stock', label: 'Out of Stock' }
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-800 uppercase tracking-wider block mb-1">
                  Variant Specific Product Info / Description
                </label>
                <textarea
                  rows={3}
                  value={editProductInfo}
                  onChange={(e) => setEditProductInfo(e.target.value)}
                  placeholder="Custom product description for this variant..."
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVariant(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* REUSABLE DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Delete Variant Combination?"
        itemName={deleteCandidate ? `${deleteCandidate.parentProductName || 'Product'} (${deleteCandidate.color} / ${deleteCandidate.size})` : undefined}
        onConfirm={confirmDeleteVariant}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
