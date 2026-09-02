import React, { useState } from 'react';
import { ProductAttributeAssignment, ProductVariantConfig } from '../types/attribute.types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Badge } from './ui/badge';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  RefreshCw,
  Sparkles,
  X,
  Upload,
  UploadCloud,
  Star,
  Eye,
  Percent,
  Palette,
  Image as ImageIcon
} from 'lucide-react';

interface VariantGeneratorSectionProps {
  productAttributes: ProductAttributeAssignment[];
  variants: ProductVariantConfig[];
  onChangeVariants: (variants: ProductVariantConfig[]) => void;
  baseSku?: string;
  defaultPrice?: number;
  defaultMrp?: number;
  defaultStock?: number;
}

export const VariantGeneratorSection: React.FC<VariantGeneratorSectionProps> = ({
  productAttributes = [],
  variants = [],
  onChangeVariants,
  baseSku = 'AAR-SKU',
  defaultPrice = 799,
  defaultMrp = 1299,
  defaultStock = 50
}) => {
  const [skuError, setSkuError] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [editingVariantConfig, setEditingVariantConfig] = useState<ProductVariantConfig | null>(null);
  const [newVariantGalleryUrl, setNewVariantGalleryUrl] = useState('');
  const [isDraggingVariantMain, setIsDraggingVariantMain] = useState(false);
  const [isDraggingVariantGallery, setIsDraggingVariantGallery] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // Manual new variant state
  const [manualSku, setManualSku] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualPrice, setManualPrice] = useState(defaultPrice);
  const [manualMrp, setManualMrp] = useState(defaultMrp);
  const [manualStock, setManualStock] = useState(defaultStock);
  const [manualAttrValues, setManualAttrValues] = useState<Record<string, string>>({});

  // Filter product attributes marked `useForVariants: true` and have selectedValues
  const variantDefiningAttrs = productAttributes.filter(
    (pa) => pa.useForVariants && pa.selectedValues && pa.selectedValues.length > 0
  );

  // Generate Cartesian Product of selected values
  const handleGenerateVariants = () => {
    setSkuError(null);
    setDuplicateError(null);

    if (variantDefiningAttrs.length === 0) {
      alert('No product attributes are marked "Use for Variants". Please toggle "Use for Variants" on at least one attribute above (e.g. Color or Size).');
      return;
    }

    // Helper for Cartesian Product
    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])),
        [[]]
      );
    };

    const valueArrays = variantDefiningAttrs.map((pa) => pa.selectedValues);
    const combinations = cartesian(valueArrays);

    const generated: ProductVariantConfig[] = [];
    const usedSkus = new Set<string>();

    combinations.forEach((combo, idx) => {
      const attrMap: Record<string, string> = {};
      variantDefiningAttrs.forEach((pa, i) => {
        attrMap[pa.attributeName] = combo[i];
      });

      // Find existing matching variant to retain custom price/stock/SKU if already set
      const existing = variants.find((v) => {
        if (!v.attributeValues) return false;
        return variantDefiningAttrs.every((pa) => v.attributeValues[pa.attributeName] === attrMap[pa.attributeName]);
      });

      if (existing) {
        generated.push(existing);
        usedSkus.add(existing.sku);
      } else {
        const skuSuffix = combo.map((c) => c.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '')).join('-');
        let genSku = `${baseSku || 'AAR'}-${skuSuffix}`;
        if (usedSkus.has(genSku)) {
          genSku = `${genSku}-${idx + 1}`;
        }
        usedSkus.add(genSku);

        const colorName = attrMap['Color'] || combo[0] || '';
        const sizeName = attrMap['Size'] || combo[1] || '';
        const generatedTitle = `${combo.join(' / ')}`;
        const calcDiscount = defaultMrp > 0 ? Math.round(((defaultMrp - defaultPrice) / defaultMrp) * 100) : 0;

        generated.push({
          id: `var-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
          sku: genSku,
          title: generatedTitle,
          productInfo: '',
          colorName,
          sizeName,
          price: defaultPrice,
          originalPrice: defaultMrp,
          comparePrice: defaultMrp,
          discountPercentage: calcDiscount,
          stock: defaultStock,
          status: 'Active',
          galleryImages: [],
          attributeValues: attrMap
        });
      }
    });

    onChangeVariants(generated);
  };

  // Add Manual Variant
  const handleAddManualVariant = (e: React.FormEvent) => {
    e.preventDefault();
    setSkuError(null);
    setDuplicateError(null);

    const trimmedSku = manualSku.trim();
    if (!trimmedSku) {
      setSkuError('Please enter a SKU.');
      return;
    }

    // Check SKU uniqueness
    if (variants.some((v) => v.sku.toLowerCase() === trimmedSku.toLowerCase())) {
      setSkuError('SKU already exists. Please use a unique SKU.');
      return;
    }

    // Check variant combination uniqueness
    const isDuplicateCombo = variants.some((v) => {
      if (!v.attributeValues) return false;
      return Object.keys(manualAttrValues).length > 0 &&
        Object.keys(manualAttrValues).every((k) => v.attributeValues[k] === manualAttrValues[k]);
    });

    if (isDuplicateCombo) {
      setDuplicateError('Duplicate variant combination is not allowed. A variant with these exact attribute values already exists.');
      return;
    }

    const calcDiscount = Number(manualMrp) > 0 ? Math.round(((Number(manualMrp) - Number(manualPrice)) / Number(manualMrp)) * 100) : 0;

    const newVar: ProductVariantConfig = {
      id: `var-manual-${Date.now()}`,
      sku: trimmedSku,
      title: manualTitle.trim() || Object.values(manualAttrValues).join(' / '),
      productInfo: '',
      colorName: manualAttrValues['Color'] || '',
      sizeName: manualAttrValues['Size'] || '',
      price: Number(manualPrice) || defaultPrice,
      originalPrice: Number(manualMrp) || defaultMrp,
      comparePrice: Number(manualMrp) || defaultMrp,
      discountPercentage: calcDiscount,
      stock: Number(manualStock) || defaultStock,
      status: 'Active',
      galleryImages: [],
      attributeValues: manualAttrValues
    };

    onChangeVariants([...variants, newVar]);
    setShowAddVariantModal(false);
    setManualSku('');
    setManualTitle('');
  };

  // Delete Variant
  const handleDeleteVariant = (id: string) => {
    onChangeVariants(variants.filter((v) => v.id !== id));
  };

  // Duplicate Variant
  const handleDuplicateVariant = (source: ProductVariantConfig) => {
    const newSku = `${source.sku}-COPY-${Math.floor(100 + Math.random() * 900)}`;
    const copy: ProductVariantConfig = {
      ...source,
      id: `var-copy-${Date.now()}`,
      sku: newSku,
      title: `${source.title || 'Variant'} (Copy)`,
      galleryImages: source.galleryImages ? [...source.galleryImages] : []
    };
    onChangeVariants([...variants, copy]);
  };

  // Update Individual Variant Field
  const handleUpdateVariantField = (id: string, field: keyof ProductVariantConfig, val: any) => {
    setSkuError(null);
    if (field === 'sku') {
      const trimmed = String(val).trim();
      const duplicateSku = variants.some((v) => v.id !== id && v.sku.toLowerCase() === trimmed.toLowerCase());
      if (duplicateSku) {
        setSkuError(`SKU "${trimmed}" already exists. Please use a unique SKU.`);
      }
    }

    onChangeVariants(
      variants.map((v) => {
        if (v.id !== id) return v;
        const updated = { ...v, [field]: val };
        // Recalculate discount if price or comparePrice changes
        if (field === 'price' || field === 'comparePrice' || field === 'originalPrice') {
          const mrp = updated.comparePrice || updated.originalPrice || defaultMrp;
          const pr = updated.price;
          if (mrp > 0) {
            updated.discountPercentage = Math.round(((mrp - pr) / mrp) * 100);
          }
        }
        return updated;
      })
    );
  };

  // Save Editing Variant Drawer Modal
  const handleSaveVariantModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariantConfig) return;

    onChangeVariants(
      variants.map((v) => (v.id === editingVariantConfig.id ? editingVariantConfig : v))
    );
    setEditingVariantConfig(null);
  };

  // Switch a gallery image to become the variant's main image
  const handleSetVariantMainFromGallery = (galleryImgUrl: string, galleryIndex: number) => {
    if (!editingVariantConfig) return;
    const oldMain = editingVariantConfig.image;
    let nextGal = [...(editingVariantConfig.galleryImages || [])];
    nextGal.splice(galleryIndex, 1);
    if (oldMain && oldMain.trim() && !nextGal.includes(oldMain)) {
      nextGal.unshift(oldMain);
    }
    setEditingVariantConfig({
      ...editingVariantConfig,
      image: galleryImgUrl,
      galleryImages: nextGal
    });
  };

  return (
    <Card className="p-6 sm:p-8 bg-white border border-neutral-200 shadow-2xs rounded-xl space-y-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-purple-600 shrink-0" />
            <h2 className="text-sm font-bold text-black tracking-tight uppercase">Variant Matrix &amp; Customization Center</h2>
          </div>
          <p className="text-xs text-neutral-500 font-normal mt-0.5">
            Each variant manages its own independent <strong>Title, Description, Color, Price, MRP &amp; Discount, SKU, Main Image, and Gallery Images</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleGenerateVariants}
            className="bg-black hover:bg-neutral-800 text-white font-semibold text-xs px-4 py-2 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate Variants</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddVariantModal(!showAddVariantModal)}
            className="text-xs font-semibold text-black border-neutral-200 hover:bg-neutral-50 h-9"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Manual Variant</span>
          </Button>
        </div>
      </div>

      {/* VALIDATION ERRORS BANNER */}
      {(skuError || duplicateError) && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{skuError || duplicateError}</span>
        </div>
      )}

      {/* VARIANT-DEFINING ATTRIBUTES SUMMARY */}
      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
        <span className="text-xs font-bold text-black uppercase tracking-wider block">
          Variant-Defining Attributes ({variantDefiningAttrs.length})
        </span>
        {variantDefiningAttrs.length === 0 ? (
          <p className="text-xs text-neutral-500 italic">
            No attributes marked with "Use for Variants". Please select values for Color or Size above.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {variantDefiningAttrs.map((pa) => (
              <Badge key={pa.attributeId} variant="outline" className="bg-white border-neutral-300 text-black text-xs py-1 px-2.5">
                <span className="font-bold">{pa.attributeName}:</span>&nbsp;{pa.selectedValues.join(', ')}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: ADD MANUAL VARIANT */}
      {showAddVariantModal && (
        <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <h4 className="text-xs font-bold text-black uppercase">Add Single Variant Manually</h4>
            <button type="button" onClick={() => setShowAddVariantModal(false)} className="text-neutral-400 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddManualVariant} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Variant Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Royal Maroon - Standard"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">SKU *</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. AAR-MRN-STD"
                  value={manualSku}
                  onChange={(e) => setManualSku(e.target.value)}
                  className="bg-white text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Sale Price (₹)</label>
                <Input
                  type="number"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(Number(e.target.value))}
                  className="bg-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Regular MRP (₹)</label>
                <Input
                  type="number"
                  value={manualMrp}
                  onChange={(e) => setManualMrp(Number(e.target.value))}
                  className="bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Stock</label>
                <Input
                  type="number"
                  value={manualStock}
                  onChange={(e) => setManualStock(Number(e.target.value))}
                  className="bg-white text-xs font-bold"
                />
              </div>

              {variantDefiningAttrs.map((pa) => (
                <div key={pa.attributeId}>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">{pa.attributeName} *</label>
                  <Select
                    value={manualAttrValues[pa.attributeName] || ''}
                    onValueChange={(val) => setManualAttrValues({ ...manualAttrValues, [pa.attributeName]: val })}
                    options={pa.selectedValues.map((v) => ({ value: v, label: v }))}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddVariantModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-black hover:bg-neutral-800 text-white text-xs font-bold">
                Add Variant
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 COMPREHENSIVE EDIT VARIANT MODAL                                      */}
      {/* ========================================================================= */}
      {editingVariantConfig && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-sm font-black text-black">
                    Edit Variant: {editingVariantConfig.title || editingVariantConfig.sku}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Independent variant configuration (Title, Color, Price, MRP, Discount, SKU, Main &amp; Gallery Photos, Description).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingVariantConfig(null)}
                className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-200 transition-colors rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <form onSubmit={handleSaveVariantModal} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* 1. VARIANT TITLE & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8 space-y-1.5">
                  <label className="block text-xs font-bold text-black uppercase tracking-wider">
                    Variant Title *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Royal Blue Mirror Latkan - Handcrafted Free Size"
                    value={editingVariantConfig.title || ''}
                    onChange={(e) => setEditingVariantConfig({ ...editingVariantConfig, title: e.target.value })}
                    className="bg-white border-neutral-300 text-xs font-bold text-black"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1.5">
                  <label className="block text-xs font-bold text-black uppercase tracking-wider">
                    Variant SKU *
                  </label>
                  <Input
                    type="text"
                    required
                    value={editingVariantConfig.sku}
                    onChange={(e) => setEditingVariantConfig({ ...editingVariantConfig, sku: e.target.value })}
                    className="bg-white border-neutral-300 text-xs font-mono font-bold text-black"
                  />
                </div>
              </div>

              {/* 2. VARIANT COLOR & ATTRIBUTES */}
              <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-200 space-y-3">
                <span className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-600" />
                  <span>Variant Color &amp; Attribute Configuration</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Color Name</label>
                    <Input
                      type="text"
                      placeholder="e.g. Royal Blue"
                      value={editingVariantConfig.colorName || editingVariantConfig.attributeValues?.['Color'] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingVariantConfig({
                          ...editingVariantConfig,
                          colorName: val,
                          attributeValues: { ...(editingVariantConfig.attributeValues || {}), Color: val }
                        });
                      }}
                      className="bg-white text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Color Swatch Code</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editingVariantConfig.colorHex || '#1A3B8B'}
                        onChange={(e) => setEditingVariantConfig({ ...editingVariantConfig, colorHex: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
                      />
                      <Input
                        type="text"
                        placeholder="#1A3B8B"
                        value={editingVariantConfig.colorHex || '#1A3B8B'}
                        onChange={(e) => setEditingVariantConfig({ ...editingVariantConfig, colorHex: e.target.value })}
                        className="bg-white text-xs font-mono flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Size / Option</label>
                    <Input
                      type="text"
                      placeholder="e.g. Free Size / Standard"
                      value={editingVariantConfig.sizeName || editingVariantConfig.attributeValues?.['Size'] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingVariantConfig({
                          ...editingVariantConfig,
                          sizeName: val,
                          attributeValues: { ...(editingVariantConfig.attributeValues || {}), Size: val }
                        });
                      }}
                      className="bg-white text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* 3. PRICING, MRP, DISCOUNT & STOCK */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-black uppercase tracking-wider">
                    Sale Price (₹) *
                  </label>
                  <Input
                    type="number"
                    value={editingVariantConfig.price}
                    onChange={(e) => {
                      const newPrice = Number(e.target.value);
                      const mrp = editingVariantConfig.comparePrice || editingVariantConfig.originalPrice || defaultMrp;
                      const disc = mrp > 0 ? Math.round(((mrp - newPrice) / mrp) * 100) : 0;
                      setEditingVariantConfig({
                        ...editingVariantConfig,
                        price: newPrice,
                        discountPercentage: disc
                      });
                    }}
                    className="bg-white border-neutral-300 text-xs font-bold text-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-black uppercase tracking-wider">
                    Compare MRP (₹)
                  </label>
                  <Input
                    type="number"
                    value={editingVariantConfig.comparePrice || editingVariantConfig.originalPrice || defaultMrp}
                    onChange={(e) => {
                      const newMrp = Number(e.target.value);
                      const pr = editingVariantConfig.price;
                      const disc = newMrp > 0 ? Math.round(((newMrp - pr) / newMrp) * 100) : 0;
                      setEditingVariantConfig({
                        ...editingVariantConfig,
                        comparePrice: newMrp,
                        originalPrice: newMrp,
                        discountPercentage: disc
                      });
                    }}
                    className="bg-white border-neutral-300 text-xs text-neutral-700 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-black uppercase tracking-wider flex items-center justify-between">
                    <span>Discount (%)</span>
                    {editingVariantConfig.discountPercentage !== undefined && editingVariantConfig.discountPercentage > 0 && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 rounded">
                        {editingVariantConfig.discountPercentage}% OFF
                      </span>
                    )}
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 35"
                    value={editingVariantConfig.discountPercentage ?? ''}
                    onChange={(e) => {
                      const disc = Number(e.target.value);
                      const mrp = editingVariantConfig.comparePrice || editingVariantConfig.originalPrice || defaultMrp;
                      const calculatedPrice = mrp > 0 ? Math.round(mrp * (1 - disc / 100)) : editingVariantConfig.price;
                      setEditingVariantConfig({
                        ...editingVariantConfig,
                        discountPercentage: disc,
                        price: calculatedPrice
                      });
                    }}
                    className="bg-white border-neutral-300 text-xs font-bold text-emerald-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-black uppercase tracking-wider">
                    Stock Quantity *
                  </label>
                  <Input
                    type="number"
                    value={editingVariantConfig.stock}
                    onChange={(e) => setEditingVariantConfig({ ...editingVariantConfig, stock: Number(e.target.value) })}
                    className="bg-white border-neutral-300 text-xs font-bold text-black"
                  />
                </div>
              </div>

              {/* 4. VARIANT MAIN COVER PHOTO & GALLERY IMAGES */}
              <div className="space-y-4 pt-2 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-black" />
                    <span>Variant Media &amp; Gallery Photos</span>
                  </span>
                  <span className="text-[11px] text-neutral-500 font-medium">
                    {editingVariantConfig.image ? '1 Main Photo' : 'No Main Photo'} • {editingVariantConfig.galleryImages?.length || 0} Gallery Photos
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                  {/* Left: Main Cover Photo */}
                  <div className="sm:col-span-5 space-y-1.5">
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                      Variant Main Cover Photo
                    </label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingVariantMain(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingVariantMain(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingVariantMain(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setEditingVariantConfig({ ...editingVariantConfig, image: reader.result });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center group shadow-xs ${
                        isDraggingVariantMain
                          ? 'border-amber-600 bg-amber-100 ring-4 ring-amber-400/20 scale-[1.02]'
                          : 'border-amber-300 bg-[#FAF7F2]'
                      }`}
                    >
                      {isDraggingVariantMain && (
                        <div className="absolute inset-0 z-30 bg-amber-600/90 text-white flex flex-col items-center justify-center gap-1 pointer-events-none animate-in fade-in">
                          <UploadCloud className="w-8 h-8 animate-bounce" />
                          <span className="text-xs font-bold uppercase">Drop Main Cover</span>
                        </div>
                      )}

                      {editingVariantConfig.image ? (
                        <>
                          <img
                            src={editingVariantConfig.image}
                            alt="Variant Cover"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>Variant Main</span>
                          </div>

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                            <label className="px-3 py-1.5 bg-white text-black text-[11px] font-bold rounded-lg shadow-sm cursor-pointer hover:bg-neutral-100 transition-all flex items-center gap-1.5">
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Change Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      if (typeof reader.result === 'string') {
                                        setEditingVariantConfig({ ...editingVariantConfig, image: reader.result });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setEditingVariantConfig({ ...editingVariantConfig, image: '' })}
                              className="text-[11px] text-red-300 hover:text-red-100 underline cursor-pointer"
                            >
                              Remove Cover
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-amber-100/50 transition-colors p-4 text-center">
                          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-neutral-800">Upload Variant Cover</span>
                          <span className="text-[10px] text-neutral-500 mt-0.5">Drag &amp; drop PNG, JPG</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    setEditingVariantConfig({ ...editingVariantConfig, image: reader.result });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Right: Additional Variant Gallery Photos */}
                  <div className="sm:col-span-7 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                        Variant Gallery Photos ({editingVariantConfig.galleryImages?.length || 0})
                      </label>
                      <label className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-black text-[10px] font-bold rounded-md cursor-pointer transition-colors flex items-center gap-1">
                        <Plus className="w-3 h-3" />
                        <span>Add Photos</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (!files || files.length === 0) return;
                            const readPromises = Array.from(files).map((file) => {
                              return new Promise<string>((resolve) => {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') resolve(reader.result);
                                };
                                reader.readAsDataURL(file);
                              });
                            });
                            const dataUrls = await Promise.all(readPromises);
                            if (dataUrls.length > 0) {
                              const cur = editingVariantConfig.galleryImages || [];
                              setEditingVariantConfig({ ...editingVariantConfig, galleryImages: [...cur, ...dataUrls] });
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingVariantGallery(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingVariantGallery(false);
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingVariantGallery(false);
                        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
                        if (files.length === 0) return;
                        const readPromises = files.map((file) => {
                          return new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') resolve(reader.result);
                            };
                            reader.readAsDataURL(file);
                          });
                        });
                        const dataUrls = await Promise.all(readPromises);
                        if (dataUrls.length > 0) {
                          const cur = editingVariantConfig.galleryImages || [];
                          setEditingVariantConfig({ ...editingVariantConfig, galleryImages: [...cur, ...dataUrls] });
                        }
                      }}
                      className={`relative grid grid-cols-3 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl border transition-all min-h-[140px] items-start ${
                        isDraggingVariantGallery
                          ? 'border-black border-dashed bg-neutral-100 ring-4 ring-black/10'
                          : 'border-neutral-200 bg-neutral-50/60'
                      }`}
                    >
                      {isDraggingVariantGallery && (
                        <div className="absolute inset-0 z-30 bg-black/80 rounded-2xl text-white flex flex-col items-center justify-center gap-1 pointer-events-none animate-in fade-in">
                          <UploadCloud className="w-6 h-6 text-amber-300 animate-bounce" />
                          <span className="text-[10px] font-bold uppercase">Drop to Add to Variant Gallery</span>
                        </div>
                      )}

                      {(editingVariantConfig.galleryImages || []).map((imgUrl, gIdx) => (
                        <div key={gIdx} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 group bg-white shadow-2xs">
                          <img src={imgUrl} alt={`Variant Gallery ${gIdx + 1}`} className="w-full h-full object-cover" />
                          
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                            <button
                              type="button"
                              onClick={() => handleSetVariantMainFromGallery(imgUrl, gIdx)}
                              className="px-1.5 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-[9px] font-bold uppercase flex items-center gap-0.5 cursor-pointer shadow-xs"
                              title="Set as Main Cover"
                            >
                              <Star className="w-2.5 h-2.5 fill-white" />
                              <span>Main</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const nextGal = (editingVariantConfig.galleryImages || []).filter((_, idx) => idx !== gIdx);
                                setEditingVariantConfig({ ...editingVariantConfig, galleryImages: nextGal });
                              }}
                              className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer"
                              title="Delete Photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Drop / Add photo box */}
                      <label className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 hover:border-black bg-white flex flex-col items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors group shadow-2xs">
                        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-bold mt-0.5 text-neutral-500">Add / Drop</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (!files || files.length === 0) return;
                            const readPromises = Array.from(files).map((file) => {
                              return new Promise<string>((resolve) => {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') resolve(reader.result);
                                };
                                reader.readAsDataURL(file);
                              });
                            });
                            const dataUrls = await Promise.all(readPromises);
                            if (dataUrls.length > 0) {
                              const cur = editingVariantConfig.galleryImages || [];
                              setEditingVariantConfig({ ...editingVariantConfig, galleryImages: [...cur, ...dataUrls] });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. VARIANT SPECIFIC DESCRIPTION & NOTES */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-200">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">
                  Variant Specific Description &amp; Craft Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter specific features, fabric details, embellishment notes, or care instructions for this particular variant..."
                  value={editingVariantConfig.productInfo || ''}
                  onChange={(e) => setEditingVariantConfig({ ...editingVariantConfig, productInfo: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 p-3 text-xs text-black focus:border-black focus:outline-none bg-white font-medium shadow-2xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingVariantConfig(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-6 py-2 rounded-xl shadow-md cursor-pointer active:scale-95"
                >
                  Save Variant Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VARIANT MATRIX TABLE                                                     */}
      {/* ========================================================================= */}
      {variants.length === 0 ? (
        <div className="p-8 text-center bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
          <Layers className="w-8 h-8 text-neutral-400 mx-auto" />
          <h4 className="text-xs font-bold text-black">No Variants Generated</h4>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Click "Generate Variants" above to compute purchasable combinations or click "Add Manual Variant".
          </p>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-2xs bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 font-bold uppercase text-[11px] text-neutral-700">
                  <th className="p-3 w-16">Photo</th>
                  <th className="p-3 min-w-[200px]">Variant Title &amp; Combination</th>
                  <th className="p-3 min-w-[120px]">Color</th>
                  <th className="p-3 min-w-[140px]">SKU Code</th>
                  <th className="p-3 min-w-[120px]">Price &amp; MRP</th>
                  <th className="p-3 min-w-[90px]">Discount</th>
                  <th className="p-3 min-w-[80px]">Gallery</th>
                  <th className="p-3 min-w-[80px]">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {variants.map((v, idx) => {
                  const comboStr = v.attributeValues
                    ? Object.entries(v.attributeValues).map(([_, val]) => `${val}`).join(' / ')
                    : `${v.colorName || ''} ${v.sizeName || ''}`.trim() || 'Standard';

                  const mrp = v.comparePrice || v.originalPrice || defaultMrp;
                  const disc = mrp > 0 && mrp > v.price ? Math.round(((mrp - v.price) / mrp) * 100) : (v.discountPercentage || 0);

                  return (
                    <tr key={v.id || idx} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Photo Thumbnail */}
                      <td className="p-3">
                        <div
                          onClick={() => setEditingVariantConfig(v)}
                          className="relative w-11 h-11 rounded-lg border border-neutral-200 bg-neutral-100 overflow-hidden cursor-pointer group shrink-0"
                          title="Click to edit photo"
                        >
                          {v.image ? (
                            <img src={v.image} alt={v.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Edit2 className="w-3 h-3" />
                          </div>
                        </div>
                      </td>

                      {/* Variant Title & Combination */}
                      <td className="p-3">
                        <div className="space-y-1">
                          <input
                            type="text"
                            placeholder="Variant Title..."
                            value={v.title || comboStr}
                            onChange={(e) => handleUpdateVariantField(v.id, 'title', e.target.value)}
                            className="w-full bg-white border border-neutral-200 rounded px-2 py-1 text-xs font-bold text-black focus:outline-none focus:border-black block"
                          />
                          <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-900 border-purple-200">
                            {comboStr}
                          </Badge>
                        </div>
                      </td>

                      {/* Color */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-neutral-300 shrink-0 shadow-2xs"
                            style={{ backgroundColor: v.colorHex || '#1A3B8B' }}
                          />
                          <span className="font-semibold text-neutral-800 text-xs">{v.colorName || v.attributeValues?.['Color'] || 'Standard'}</span>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => handleUpdateVariantField(v.id, 'sku', e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded px-2 py-1 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
                        />
                      </td>

                      {/* Price & MRP */}
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-neutral-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) => handleUpdateVariantField(v.id, 'price', Number(e.target.value))}
                              className="w-20 bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-xs font-bold text-black"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-neutral-400">MRP:</span>
                            <input
                              type="number"
                              value={mrp}
                              onChange={(e) => {
                                handleUpdateVariantField(v.id, 'comparePrice', Number(e.target.value));
                                handleUpdateVariantField(v.id, 'originalPrice', Number(e.target.value));
                              }}
                              className="w-20 bg-neutral-50 border border-neutral-200 rounded px-1.5 py-0.5 text-[11px] text-neutral-500"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Discount % */}
                      <td className="p-3">
                        {disc > 0 ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block">
                            {disc}% OFF
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-400 italic">0%</span>
                        )}
                      </td>

                      {/* Gallery count */}
                      <td className="p-3">
                        <Badge variant="outline" className="bg-neutral-50 text-neutral-700 text-[10px] font-semibold">
                          📷 {v.galleryImages?.length || 0}
                        </Badge>
                      </td>

                      {/* Stock */}
                      <td className="p-3">
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => handleUpdateVariantField(v.id, 'stock', Number(e.target.value))}
                          className="w-16 bg-white border border-neutral-200 rounded px-1.5 py-1 text-xs font-bold text-black"
                        />
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingVariantConfig(v)}
                            className="text-[11px] font-bold text-black border-neutral-300 hover:bg-neutral-100 h-8 px-2.5"
                            title="Edit Full Variant Details (Images, Description, Pricing)"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            <span>Edit</span>
                          </Button>

                          <button
                            type="button"
                            onClick={() => handleDuplicateVariant(v)}
                            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                            title="Duplicate Variant"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(v.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete Variant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
    </Card>
  );
};

export default VariantGeneratorSection;
