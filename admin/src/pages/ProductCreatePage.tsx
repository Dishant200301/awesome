import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  UploadCloud,
  X,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  Save,
  Package,
  Layers,
  Palette,
  Sliders,
  ChevronDown,
  Search,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import {
  getAdminCategoriesAndSubcategories,
  broadcastAdminProductChange
} from '../data/mockAdminData';
import {
  Product,
  ProductOptionItem,
  ProductVariantDetail,
  ProductAddonOption
} from '../types/admin';
import { AttributeMaster } from '../types/attribute.types';
import { AttributeService } from '../services/attributeService';
import { AdminApiService } from '../services/adminApi';
import { RichTextEditor } from '../components/RichTextEditor';
import { Button } from '../components/ui/button';
import { getClosestColorName, findHexByColorName } from '../utils/colorMatcher';

interface ProductCreatePageProps {
  onNavigate?: (tab: string, productId?: string) => void;
  editingProductId?: string;
}

interface SpecItem {
  id: string;
  key: string;
  value: string;
}

const DEFAULT_COLOR_PALETTES = [
  { name: 'Maroon', hex: '#800000' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Royal Blue', hex: '#4169E1' },
  { name: 'Emerald Green', hex: '#50C878' },
  { name: 'Pink', hex: '#FF69B4' },
  { name: 'Yellow', hex: '#FFD700' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#18181B' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Turquoise', hex: '#06B6D4' }
];

export const ProductCreatePage: React.FC<ProductCreatePageProps> = ({ onNavigate, editingProductId }) => {
  const params = useParams<{ id?: string }>();
  const routerNavigate = useNavigate();
  const effectiveProductId = editingProductId || params.id;
  const isEditMode = Boolean(effectiveProductId);

  const navigateBack = () => {
    if (onNavigate) {
      onNavigate('all-products');
    } else {
      routerNavigate('/products');
    }
  };

  // Loading & Saving States
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(isEditMode);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);
  const [showFinalPreviewModal, setShowFinalPreviewModal] = useState<boolean>(false);

  // Dynamic Categories from Store & Backend
  const [categoriesData, setCategoriesData] = useState(() => getAdminCategoriesAndSubcategories());
  const mainCategories = categoriesData.mainCategories || [];
  const allSubcategories = categoriesData.subcategories || [];

  // Live Color Picker State
  const [activePickerHex, setActivePickerHex] = useState<string>('#50C878');
  const [activePickerName, setActivePickerName] = useState<string>('Emerald Green');

  const handleColorPickerChange = (hex: string) => {
    setActivePickerHex(hex);
    const closest = getClosestColorName(hex);
    setActivePickerName(closest.name);
  };

  // Dynamic Master Attributes
  const [masterAttributes, setMasterAttributes] = useState<AttributeMaster[]>([]);
  const [openValueDropdownId, setOpenValueDropdownId] = useState<string | null>(null);
  const [valueSearchQueries, setValueSearchQueries] = useState<{ [optionId: string]: string }>({});

  useEffect(() => {
    AttributeService.getAttributes().then((attrs) => {
      setMasterAttributes(attrs || []);
    });

    const handleAttrSync = () => {
      AttributeService.getAttributes().then((attrs) => {
        setMasterAttributes(attrs || []);
      });
    };
    window.addEventListener('awesome_attribute_sync', handleAttrSync);
    return () => {
      window.removeEventListener('awesome_attribute_sync', handleAttrSync);
    };
  }, []);

  useEffect(() => {
    const handleTaxonomySync = () => {
      setCategoriesData(getAdminCategoriesAndSubcategories());
    };
    window.addEventListener('awesome_category_sync', handleTaxonomySync);
    window.addEventListener('aocind_category_sync', handleTaxonomySync);
    return () => {
      window.removeEventListener('awesome_category_sync', handleTaxonomySync);
      window.removeEventListener('aocind_category_sync', handleTaxonomySync);
    };
  }, []);

  // 1. BASIC DETAILS & CLASSIFICATION (Merged inside Product Details)
  const [name, setName] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(false);
  const [category, setCategory] = useState<string>(mainCategories[0]?.name || 'Latkan');
  const [subcategory, setSubcategory] = useState<string>('');
  const [brand, setBrand] = useState<string>('Awesome Handmade');
  const [defaultKey, setDefaultKey] = useState<string>('Artisan Special');
  const [status, setStatus] = useState<'Active' | 'Draft'>('Active');

  // Available subcategories filtered by selected category
  const filteredSubcategories = useMemo(() => {
    const parentCat = mainCategories.find(
      (c) => c.name.toLowerCase() === category.toLowerCase() || c.id === category
    );
    if (!parentCat) return [];
    return allSubcategories.filter(
      (s) =>
        s.categoryId === parentCat.id ||
        s.parentId === parentCat.id ||
        (s.categoryName && s.categoryName.toLowerCase() === parentCat.name.toLowerCase()) ||
        (s.parentName && s.parentName.toLowerCase() === parentCat.name.toLowerCase())
    );
  }, [category, mainCategories, allSubcategories]);

  // Set subcategory default when category changes
  useEffect(() => {
    if (filteredSubcategories.length > 0 && !filteredSubcategories.some((s) => s.name === subcategory)) {
      setSubcategory(filteredSubcategories[0].name);
    }
  }, [filteredSubcategories, category]);

  // 2. PRODUCT TYPE (Simple vs Variable)
  const [productType, setProductType] = useState<'Simple' | 'Variable'>('Simple');

  // 3. PRICING & INVENTORY (For Simple Product)
  const [regularPrice, setRegularPrice] = useState<number>(1299);
  const [salePrice, setSalePrice] = useState<number>(799);
  const [sku, setSku] = useState<string>('AH-PROD-001');
  const [stock, setStock] = useState<number>(50);

  // 4. MEDIA (For Simple Product)
  const [mainImage, setMainImage] = useState<string>('/images/category/Latkan.webp');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isMainDragOver, setIsMainDragOver] = useState(false);
  const [isGalleryDragOver, setIsGalleryDragOver] = useState(false);

  // Drag over states for variants
  const [activeVarDragMain, setActiveVarDragMain] = useState<number | null>(null);
  const [activeVarDragGal, setActiveVarDragGal] = useState<number | null>(null);

  // Focus target for paste
  const [activePasteTarget, setActivePasteTarget] = useState<
    'root_main' | 'root_gallery' | { type: 'var_main' | 'var_gallery'; index: number }
  >('root_main');

  // 5. DESCRIPTIONS
  const [shortDescription, setShortDescription] = useState<string>('');
  const [longDescription, setLongDescription] = useState<string>('');

  // 6. ADDITIONAL INFORMATION / SPECIFICATIONS (Dynamic Key-Value Pairs)
  const [specifications, setSpecifications] = useState<SpecItem[]>([
    { id: 'spec-1', key: 'Primary Material', value: 'Silk & Zari, Pure Cotton' },
    { id: 'spec-2', key: 'Craft Technique', value: 'Handmade Mirror Work & Knotting' },
    { id: 'spec-3', key: 'Origin / Made In', value: 'Surat, Gujarat, India' },
    { id: 'spec-4', key: 'Care Instructions', value: 'Spot Clean Only / Dry in Shade' },
    { id: 'spec-5', key: 'Package Contains', value: '1 Pair (2 Pieces)' }
  ]);

  // 7. VARIABLE PRODUCT: OPTIONS & VARIANTS
  const [options, setOptions] = useState<ProductOptionItem[]>([
    {
      id: 'opt-color',
      name: 'Color',
      values: []
    }
  ]);
  const [newOptionValueInputs, setNewOptionValueInputs] = useState<{ [optionId: string]: string }>({});

  const [variants, setVariants] = useState<ProductVariantDetail[]>([]);

  // 8. ADDONS (Optional props)
  const [addons] = useState<ProductAddonOption[]>([]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!isSlugManuallyEdited && name) {
      const generated = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  }, [name, isSlugManuallyEdited]);

  // Auto-generate SKU when title or category changes
  useEffect(() => {
    if (!isEditMode && name && (!sku || sku === 'AH-PROD-001')) {
      const catCode = category ? category.slice(0, 3).toUpperCase() : 'PRD';
      const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
      setSku(`AH-${catCode}-${cleanName || '001'}`);
    }
  }, [name, category, isEditMode]);

  // Global Clipboard Paste (Ctrl + V) Handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result) {
                const dataUrl = reader.result as string;

                if (activePasteTarget === 'root_main' || activePasteTarget === 'root_gallery') {
                  handleSimpleAddImages([dataUrl]);
                  showToast('Product photo pasted from clipboard!');
                } else if (typeof activePasteTarget === 'object') {
                  const { type, index } = activePasteTarget;
                  if (type === 'var_main' || type === 'var_gallery') {
                    handleVariantAddImages(index, [dataUrl]);
                    showToast(`Variant ${variants[index]?.optionValue || index + 1} photo pasted from clipboard!`);
                  }
                }
                setIsDirty(true);
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activePasteTarget, variants, mainImage]);

  // Fetch Existing Product in Edit Mode
  useEffect(() => {
    if (!effectiveProductId) return;

    let isMounted = true;
    const loadProduct = async () => {
      setIsInitialLoading(true);
      try {
        const prod = await AdminApiService.getProductById(effectiveProductId);
        if (!prod || !isMounted) return;

        setName(prod.name || '');
        setDisplayName(prod.displayName || prod.name || '');
        setSlug(prod.slug || '');
        setIsSlugManuallyEdited(true);
        setCategory(prod.category || mainCategories[0]?.name || 'Latkan');
        setSubcategory(prod.subcategory || prod.subCategory || '');
        setBrand(prod.brand || 'Awesome Handmade');
        setDefaultKey(prod.defaultKey || 'Artisan Special');
        setShortDescription(prod.shortDescription || prod.subtitle || '');
        setLongDescription(prod.fullDescription || prod.longDescription || '');
        setStatus(prod.status === 'Draft' ? 'Draft' : 'Active');
        setProductType(prod.type === 'Variable' ? 'Variable' : 'Simple');

        setRegularPrice(prod.regularPrice || prod.originalPrice || prod.price || 1299);
        setSalePrice(prod.price || 799);
        setSku(prod.sku || prod.defaultSku || 'AH-PROD-001');
        setStock(prod.stock !== undefined ? prod.stock : 50);

        if (prod.mainImage || prod.image) {
          setMainImage(prod.mainImage || prod.image || '/images/category/Latkan.webp');
        }
        if (Array.isArray(prod.galleryImages) && prod.galleryImages.length > 0) {
          setGalleryImages(prod.galleryImages.filter((g: any) => typeof g === 'string'));
        } else if (Array.isArray(prod.images) && prod.images.length > 1) {
          setGalleryImages(prod.images.slice(1).map((g: any) => (typeof g === 'string' ? g : g.url)));
        }

        // Load specifications
        if (Array.isArray(prod.specifications) && prod.specifications.length > 0) {
          setSpecifications(
            prod.specifications.map((s, idx) => ({
              id: `spec-${idx}`,
              key: s.key,
              value: s.value
            }))
          );
        }

        // Load options & variants
        if (prod.productOptions && prod.productOptions.length > 0) {
          setOptions(prod.productOptions);
        }

        if (prod.variantDetails && prod.variantDetails.length > 0) {
          setVariants(prod.variantDetails);
        } else if (prod.variants && prod.variants.length > 0) {
          const mapped: ProductVariantDetail[] = prod.variants.map((v, i) => {
            const vMain = v.image || (v.galleryImages && v.galleryImages[0]) || prod.mainImage || '/images/category/Latkan.webp';
            const vGal = v.galleryImages && v.galleryImages.length > 0 ? v.galleryImages : [];
            return {
              id: v.id || `var-${i}`,
              name: `Variant: ${v.colorName || v.title || v.sku}`,
              optionValue: v.colorName || v.title || `Variant ${i + 1}`,
              price: v.price || prod.price || 799,
              salePrice: v.originalPrice || prod.originalPrice || 1299,
              quantity: v.stock !== undefined ? v.stock : 15,
              sku: v.sku || `AH-VAR-${i + 1}`,
              colorHex: (v as any).colorHex || DEFAULT_COLOR_PALETTES[i % DEFAULT_COLOR_PALETTES.length].hex,
              mainImage: vMain,
              galleryImages: vGal,
              images: vGal.length > 0 ? [vMain, ...vGal] : [vMain]
            };
          });
          setVariants(mapped);
        }
      } catch (err) {
        console.error('Failed to load product for editing:', err);
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    };

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [effectiveProductId]);

  // Toast Helper
  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  // Image Upload Handlers for Simple Product
  const handleProcessMainImageFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setMainImage(reader.result as string);
        setIsDirty(true);
        showToast('Main product image updated');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProcessGalleryFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setGalleryImages((prev) => [...prev, reader.result as string]);
          setIsDirty(true);
        }
      };
      reader.readAsDataURL(file);
    });
    showToast('Gallery image(s) uploaded');
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  // Specification Handlers
  const handleAddSpecRow = () => {
    setSpecifications((prev) => [
      ...prev,
      { id: `spec-${Date.now()}`, key: 'New Attribute', value: 'Details' }
    ]);
    setIsDirty(true);
  };

  const handleUpdateSpecRow = (idx: number, field: 'key' | 'value', val: string) => {
    setSpecifications((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
    setIsDirty(true);
  };

  const handleRemoveSpecRow = (idx: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  // Sync Variants when Options change
  const syncVariantsFromOptions = (newOpts: ProductOptionItem[]) => {
    if (newOpts.length === 0) {
      setVariants([]);
      return;
    }

    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])),
        [[]]
      );
    };

    const validOpts = newOpts.filter((o) => o.values && o.values.length > 0);
    if (validOpts.length === 0) {
      setVariants([]);
      return;
    }

    const valueCombos = cartesian(validOpts.map((o) => o.values));

    const updatedVariants: ProductVariantDetail[] = valueCombos.map((combo, idx) => {
      const comboName = combo.join(' / ');
      const existing = variants.find((v) => v.optionValue === comboName || v.name.includes(comboName));

      const skuSuffix = combo
        .map((s) => s.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase())
        .join('-');

      const variantColorHex = findHexByColorName(combo[0] || '');

      const vMainImg = existing?.mainImage || existing?.images?.[0] || mainImage || '/images/category/Latkan.webp';
      const vGals = existing?.galleryImages || [];

      return (
        existing || {
          id: `var-${Date.now()}-${idx}`,
          name: `Variant: ${comboName}`,
          optionValue: comboName,
          price: salePrice || 799,
          salePrice: regularPrice || 1299,
          quantity: 20,
          sku: `${sku}-${skuSuffix || idx + 1}`,
          colorHex: variantColorHex,
          mainImage: vMainImg,
          galleryImages: vGals,
          images: [vMainImg, ...vGals]
        }
      );
    });

    setVariants(updatedVariants);
  };

  // Option Handlers
  const handleAddOption = () => {
    const newId = `opt-${Date.now()}`;
    const updated = [
      ...options,
      {
        id: newId,
        name: `Option ${options.length + 1}`,
        values: []
      }
    ];
    setOptions(updated);
    setIsDirty(true);
  };

  const handleAddOptionFromMaster = (attr: AttributeMaster) => {
    const existing = options.find(
      (o) => o.name.toLowerCase() === attr.name.toLowerCase()
    );
    if (existing) {
      showToast(`Attribute "${attr.name}" already added`);
      return;
    }
    const newId = `opt-${Date.now()}`;
    const updated = [
      ...options,
      {
        id: newId,
        name: attr.name,
        values: []
      }
    ];
    setOptions(updated);
    setIsDirty(true);
    showToast(`Added attribute "${attr.name}"`);
  };

  const handleAddAllValuesFromMaster = (optionId: string, attr: AttributeMaster) => {
    if (!attr.values || attr.values.length === 0) return;
    const toAdd = attr.values.map((v) => (v.label || v.value).trim()).filter(Boolean);
    const updated = options.map((opt) => {
      if (opt.id === optionId) {
        const set = new Set([...opt.values, ...toAdd]);
        return {
          ...opt,
          values: Array.from(set)
        };
      }
      return opt;
    });
    setOptions(updated);
    syncVariantsFromOptions(updated);
    setIsDirty(true);
  };

  const handleRemoveOption = (index: number) => {
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
    syncVariantsFromOptions(updated);
    setIsDirty(true);
  };

  const handleOptionNameChange = (index: number, newName: string) => {
    const updated = [...options];
    updated[index].name = newName;
    setOptions(updated);
    setIsDirty(true);
  };

  const getColorHex = (nameOrVal: string): string => {
    return findHexByColorName(nameOrVal);
  };

  const handleAddOptionValue = (optionId: string, customVal?: string) => {
    const rawVal = (customVal !== undefined ? customVal : newOptionValueInputs[optionId])?.trim();
    if (!rawVal) return;

    const updated = options.map((opt) => {
      if (opt.id === optionId) {
        if (opt.values.includes(rawVal)) return opt;
        return {
          ...opt,
          values: [...opt.values, rawVal]
        };
      }
      return opt;
    });

    setOptions(updated);
    setNewOptionValueInputs((prev) => ({ ...prev, [optionId]: '' }));
    syncVariantsFromOptions(updated);
    setIsDirty(true);
  };

  const handleRemoveOptionValue = (optionId: string, valIndex: number) => {
    const updated = options.map((opt) => {
      if (opt.id === optionId) {
        return {
          ...opt,
          values: opt.values.filter((_, i) => i !== valIndex)
        };
      }
      return opt;
    });

    setOptions(updated);
    syncVariantsFromOptions(updated);
    setIsDirty(true);
  };

  // Variant Field & Image Handlers
  const handleUpdateVariantField = (
    variantIndex: number,
    field: keyof ProductVariantDetail,
    value: any
  ) => {
    const updated = [...variants];
    updated[variantIndex] = {
      ...updated[variantIndex],
      [field]: value
    };
    setVariants(updated);
    setIsDirty(true);
  };

  // Simple Product Media Handlers
  const handleSimpleAddImages = (newImgs: string[]) => {
    const existing = [mainImage, ...galleryImages].filter(Boolean);
    const combined = Array.from(new Set([...existing, ...newImgs].filter(Boolean))) as string[];
    setMainImage(combined[0] || '');
    setGalleryImages(combined.slice(1));
    setIsDirty(true);
  };

  const handleSimpleRemoveImage = (imgIndex: number) => {
    const existing = [mainImage, ...galleryImages].filter(Boolean);
    const filtered = existing.filter((_, idx) => idx !== imgIndex) as string[];
    setMainImage(filtered[0] || '');
    setGalleryImages(filtered.slice(1));
    setIsDirty(true);
  };

  const handleSimpleSetMainImage = (imgIndex: number) => {
    const existing = [mainImage, ...galleryImages].filter(Boolean);
    if (imgIndex < 0 || imgIndex >= existing.length) return;
    const selected = existing.splice(imgIndex, 1)[0];
    const reordered = [selected, ...existing] as string[];
    setMainImage(reordered[0] || '');
    setGalleryImages(reordered.slice(1));
    setIsDirty(true);
    showToast('Main cover image updated');
  };

  const handleSimpleGalleryFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const dataUrl = reader.result as string;
          handleSimpleAddImages([dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });

    showToast('Product photos updated');
  };

  const handleVariantAddImages = (variantIndex: number, newImgs: string[]) => {
    setVariants((prev) => {
      const next = [...prev];
      const target = next[variantIndex];
      const existing = (target.images && target.images.length > 0)
        ? target.images
        : ([target.mainImage, ...(target.galleryImages || [])].filter(Boolean) as string[]);
      const combined = Array.from(new Set([...existing, ...newImgs].filter(Boolean))) as string[];
      next[variantIndex] = {
        ...target,
        mainImage: combined[0] || '',
        galleryImages: combined.slice(1),
        images: combined
      };
      return next;
    });
    setIsDirty(true);
  };

  const handleVariantRemoveImage = (variantIndex: number, imgIndex: number) => {
    setVariants((prev) => {
      const next = [...prev];
      const target = next[variantIndex];
      const existing = (target.images && target.images.length > 0)
        ? target.images
        : ([target.mainImage, ...(target.galleryImages || [])].filter(Boolean) as string[]);
      const filtered = existing.filter((_, idx) => idx !== imgIndex) as string[];
      next[variantIndex] = {
        ...target,
        mainImage: filtered[0] || '',
        galleryImages: filtered.slice(1),
        images: filtered
      };
      return next;
    });
    setIsDirty(true);
  };

  const handleVariantSetMainImage = (variantIndex: number, imgIndex: number) => {
    setVariants((prev) => {
      const next = [...prev];
      const target = next[variantIndex];
      const existing = (target.images && target.images.length > 0)
        ? [...target.images]
        : ([target.mainImage, ...(target.galleryImages || [])].filter(Boolean) as string[]);
      if (imgIndex < 0 || imgIndex >= existing.length) return prev;
      const selected = existing.splice(imgIndex, 1)[0];
      const reordered = [selected, ...existing] as string[];
      next[variantIndex] = {
        ...target,
        mainImage: reordered[0] || '',
        galleryImages: reordered.slice(1),
        images: reordered
      };
      return next;
    });
    setIsDirty(true);
    showToast('Variant cover photo updated');
  };

  const handleVariantGalleryFiles = (variantIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const dataUrl = reader.result as string;
          handleVariantAddImages(variantIndex, [dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });

    showToast(`Variant ${variants[variantIndex]?.optionValue || variantIndex + 1} photos updated`);
  };

  // Validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!name.trim()) errors.name = 'Product Title / Name is required.';
    if (!category.trim()) errors.category = 'Please select a Category.';

    if (productType === 'Simple') {
      if (!salePrice || salePrice <= 0) errors.price = 'Please enter a valid selling price.';
      if (!mainImage) errors.mainImage = 'Please upload or provide a Main Product Image.';
    } else {
      if (variants.length === 0) {
        errors.variants = 'At least one variant must be configured for a Variable Product.';
      }
      const hasAnyImage = variants.some((v) => v.mainImage || (v.images && v.images.length > 0)) || Boolean(mainImage);
      if (!hasAnyImage) {
        errors.mainImage = 'Please add a Main Image for at least one variant.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit & Save
  const handleSaveProduct = async (statusOverride?: 'Draft' | 'Active') => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    const finalStatus = statusOverride || status;
    const isLive = finalStatus === 'Active';

    // In Variable mode, derive root main image and galleries from first variant if not explicitly set
    const effectiveMainImage =
      productType === 'Variable' && variants.length > 0
        ? variants[0].mainImage || variants[0].images?.[0] || mainImage
        : mainImage;

    const effectiveGalleryImages =
      productType === 'Variable' && variants.length > 0
        ? variants.flatMap((v) => v.galleryImages || [])
        : galleryImages;

    const allRootImages = Array.from(new Set([effectiveMainImage, ...effectiveGalleryImages].filter(Boolean)));

    // Calculate effective selling and regular price
    const finalSellingPrice =
      productType === 'Variable' && variants.length > 0
        ? Math.min(...variants.map((v) => Number(v.price) || salePrice))
        : Number(salePrice) || 799;

    const finalOriginalPrice =
      productType === 'Variable' && variants.length > 0
        ? Math.max(...variants.map((v) => Number(v.salePrice || v.price) || regularPrice))
        : Number(regularPrice) || 1299;

    const totalStock =
      productType === 'Variable' && variants.length > 0
        ? variants.reduce((acc, v) => acc + (Number(v.quantity) || 0), 0)
        : Number(stock) || 50;

    const cleanSpecs = specifications
      .filter((s) => s.key.trim() && s.value.trim())
      .map((s) => ({ key: s.key.trim(), value: s.value.trim() }));

    // Generate colors list for storefront color swatches
    const formattedColors =
      productType === 'Variable'
        ? variants.map((v, i) => {
            const vMain = v.mainImage || v.images?.[0] || effectiveMainImage;
            const vGals = v.galleryImages && v.galleryImages.length > 0 ? v.galleryImages : allRootImages;
            return {
              id: `col-${v.id || i}`,
              colorName: v.optionValue || v.name || `Color ${i + 1}`,
              colorHex: (v as any).colorHex || DEFAULT_COLOR_PALETTES[i % DEFAULT_COLOR_PALETTES.length].hex,
              displayImage: vMain,
              mainImage: vMain,
              galleryImages: vGals,
              sizes: ['Free Size', 'Standard Pair']
            };
          })
        : [
            {
              id: 'col-main',
              colorName: 'Standard',
              colorHex: '#C89B3C',
              displayImage: effectiveMainImage,
              mainImage: effectiveMainImage,
              galleryImages: effectiveGalleryImages,
              sizes: ['Free Size', 'Standard Pair']
            }
          ];

    // Generate formatted variations
    const formattedVariations =
      productType === 'Variable'
        ? variants.map((v, i) => {
            const vMain = v.mainImage || v.images?.[0] || effectiveMainImage;
            const vGals = v.galleryImages && v.galleryImages.length > 0 ? v.galleryImages : allRootImages;
            const vImagesAll = Array.from(new Set([vMain, ...vGals].filter(Boolean)));

            return {
              id: v.id || `var-${i}`,
              colorName: v.optionValue || v.name,
              colorHex: (v as any).colorHex || DEFAULT_COLOR_PALETTES[i % DEFAULT_COLOR_PALETTES.length].hex,
              size: 'Free Size',
              sizeName: 'Free Size',
              price: Number(v.price),
              originalPrice: Number(v.salePrice || v.price),
              discountPercentage: Math.round(
                (((Number(v.salePrice || v.price) - Number(v.price)) / Number(v.salePrice || v.price)) * 100) || 0
              ),
              sku: v.sku || `${sku}-${i + 1}`,
              stock: Number(v.quantity),
              thumbnail: vMain,
              status: Number(v.quantity) > 0 ? ('Active' as const) : ('Out of Stock' as const),
              images: vImagesAll.map((url, idx) => ({
                id: `img-var-${i}-${idx}`,
                url,
                alt: `${name} - ${v.optionValue}`
              }))
            };
          })
        : [];

    const payload: Partial<Product> = {
      name: name.trim(),
      displayName: (displayName || name).trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      defaultKey: defaultKey.trim() || 'Artisan Special',
      sku: sku.trim() || 'AH-PROD-001',
      defaultSku: sku.trim() || 'AH-PROD-001',
      category: category.trim(),
      categories: [category.trim()],
      subcategory: (subcategory || '').trim(),
      subCategory: (subcategory || '').trim(),
      brand: brand.trim() || 'Awesome Handmade',
      shortDescription: shortDescription.trim(),
      subtitle: shortDescription.trim(),
      fullDescription: longDescription.trim(),
      longDescription: longDescription.trim(),
      status: isLive ? 'Active' : 'Draft',
      isPublished: isLive,
      type: productType,
      price: finalSellingPrice,
      originalPrice: finalOriginalPrice,
      regularPrice: finalOriginalPrice,
      discountPercentage: Math.round((((finalOriginalPrice - finalSellingPrice) / finalOriginalPrice) * 100) || 0),
      stock: totalStock,
      stockStatus: totalStock > 0 ? 'in_stock' : 'out_of_stock',
      image: effectiveMainImage,
      mainImage: effectiveMainImage,
      galleryImages: effectiveGalleryImages,
      images: allRootImages,
      specifications: cleanSpecs,
      attributes: options.filter(o => o.name && o.values && o.values.length > 0).map(o => ({ name: o.name, values: o.values })),
      customAttributes: [
        ...cleanSpecs.map((s) => ({ name: s.key, values: [s.value] })),
        ...options.filter(o => o.name && o.values && o.values.length > 0).map(o => ({ name: o.name, values: o.values }))
      ],
      productOptions: productType === 'Variable' ? options : [],
      variantDetails: productType === 'Variable' ? variants : [],
      addonOptions: addons,
      colors: formattedColors,
      variations: formattedVariations,
      availableSizes: (options.find(o => o.name.toLowerCase().includes('size'))?.values) || ['Free Size', 'Standard Pair'],
      rating: 4.9,
      reviewCount: 14
    };

    try {
      let savedProduct: Product | null = null;
      if (isEditMode && effectiveProductId) {
        savedProduct = await AdminApiService.updateProduct(effectiveProductId, payload);
        showToast('Product updated successfully!');
      } else {
        savedProduct = await AdminApiService.createProduct(payload);
        showToast('Product created and published successfully!');
      }

      broadcastAdminProductChange(savedProduct || (payload as Product));
      setIsDirty(false);

      setTimeout(() => {
        navigateBack();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to save product:', err);
      alert('Error saving product: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-neutral-800 mx-auto" />
          <p className="text-xs text-neutral-500 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-neutral-900 bg-[#fbfbfc] min-h-screen pb-24">
      {/* SUCCESS TOAST */}
      {saveSuccessMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-neutral-950 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-neutral-800 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* TOP STICKY BAR */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-2xs px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isDirty) setShowDiscardModal(true);
              else navigateBack();
            }}
            className="h-8 w-8 p-0 rounded-lg border-neutral-200 hover:bg-neutral-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-700" />
          </Button>

          <div>
            <h1 className="text-sm sm:text-base font-bold text-neutral-950 tracking-tight">
              {isEditMode ? `Edit Product: ${name || 'Untitled'}` : 'Add New Product'}
            </h1>
            <p className="text-[11px] text-neutral-400">
              Configure product details, category, pricing, media gallery, and variations.
            </p>
          </div>
        </div>
      </div>

      {/* VALIDATION ERRORS BANNER */}
      {Object.keys(formErrors).length > 0 && (
        <div className="max-w-6xl mx-auto mt-6 px-4">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Please fix the following before saving:</span>
              <ul className="list-disc list-inside space-y-0.5 text-rose-700">
                {Object.values(formErrors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MAIN FORM CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* 1. PRODUCT DETAILS (INCLUDING CATEGORY, SUBCATEGORY & BRAND) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start border-b border-neutral-200/80 pb-10">
          <div className="lg:col-span-3 space-y-1">
            <h2 className="text-sm font-bold text-neutral-900 tracking-tight">Product Details</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Define the title, category classification, display subtitle, and storefront visibility status
            </p>
          </div>

          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs p-6 space-y-5">
              
              {/* Product Title / Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  Product Title / Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Royal Mirror Latkan Pair with Golden Tassels"
                  className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950 transition-all font-medium"
                />
              </div>

              {/* Category & Subcategory Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Main Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950 transition-all cursor-pointer font-medium"
                  >
                    {mainCategories.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    Subcategory
                  </label>
                  <select
                    value={subcategory}
                    onChange={(e) => {
                      setSubcategory(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950 transition-all cursor-pointer font-medium"
                  >
                    <option value="">None / General</option>
                    {filteredSubcategories.map((s) => (
                      <option key={s.id || s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* URL Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsSlugManuallyEdited(true);
                      setIsDirty(true);
                    }}
                    placeholder="royal-mirror-latkan-pair"
                    className="w-full pl-3.5 pr-8 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950 transition-all font-mono"
                  />
                  {slug && (
                    <button
                      type="button"
                      onClick={() => {
                        setSlug('');
                        setIsSlugManuallyEdited(true);
                        setIsDirty(true);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                      title="Clear slug"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* STOREFRONT VISIBILITY TOGGLE SWITCH */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-neutral-900 block">
                    Storefront Visibility
                  </label>
                  <p className="text-[11px] text-neutral-400">
                    {status === 'Active'
                      ? 'Product is Active and visible on the website store'
                      : 'Product is saved as Draft and hidden from the website store'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold ${
                      status === 'Active' ? 'text-emerald-700' : 'text-neutral-500'
                    }`}
                  >
                    {status === 'Active' ? 'Active (Live)' : 'Draft (Hidden)'}
                  </span>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={status === 'Active'}
                    onClick={() => {
                      setStatus(status === 'Active' ? 'Draft' : 'Active');
                      setIsDirty(true);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      status === 'Active' ? 'bg-emerald-600' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        status === 'Active' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 2. PRODUCT TYPE & MEDIA / PRICING CONFIGURATION (SIMPLE vs VARIABLE) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start border-b border-neutral-200/80 pb-10">
          <div className="lg:col-span-3 space-y-1">
            <h2 className="text-sm font-bold text-neutral-900 tracking-tight">Type &amp; Configuration</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Choose between a Simple Product (Single item with media) or Variable Product (Multiple color/size variations with photos)
            </p>
          </div>

          <div className="lg:col-span-9 space-y-6">
            <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs p-6 space-y-6">
              
              {/* TYPE SWITCHER */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider block">
                  Product Classification Type
                </label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-neutral-100 rounded-xl border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => {
                      setProductType('Simple');
                      setIsDirty(true);
                    }}
                    className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      productType === 'Simple'
                        ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/80'
                        : 'text-neutral-600 hover:text-neutral-950'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>Simple Product (Single Item)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProductType('Variable');
                      setIsDirty(true);
                    }}
                    className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      productType === 'Variable'
                        ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/80'
                        : 'text-neutral-600 hover:text-neutral-950'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Variable Product (With Variations)</span>
                  </button>
                </div>
              </div>

              {/* ============================================================ */}
              {/* A. SIMPLE PRODUCT SECTION (Pricing + Inventory + Media) */}
              {/* ============================================================ */}
              {productType === 'Simple' && (
                <div className="space-y-6 pt-2">
                  
                  {/* Pricing & Inventory */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Pricing &amp; Inventory Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Sale Price */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-700">
                          Selling Price (₹) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={salePrice}
                          onChange={(e) => {
                            setSalePrice(Number(e.target.value));
                            setIsDirty(true);
                          }}
                          className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950 font-semibold"
                        />
                      </div>

                      {/* Regular / M.R.P. Price */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-700">
                          Regular / M.R.P. (₹)
                        </label>
                        <input
                          type="number"
                          value={regularPrice}
                          onChange={(e) => {
                            setRegularPrice(Number(e.target.value));
                            setIsDirty(true);
                          }}
                          className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950"
                        />
                      </div>

                      {/* SKU */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-700">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={sku}
                          onChange={(e) => {
                            setSku(e.target.value);
                            setIsDirty(true);
                          }}
                          className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950 font-mono"
                        />
                      </div>

                      {/* Stock Quantity */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-700">
                          Stock Quantity
                        </label>
                        <input
                          type="number"
                          value={stock}
                          onChange={(e) => {
                            setStock(Number(e.target.value));
                            setIsDirty(true);
                          }}
                          className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Simple Product Photos & Gallery (Unified Uploader: 1st image is Main Cover Image) */}
                  {(() => {
                    const allSimpleImages = [mainImage, ...galleryImages].filter(Boolean);
                    const [simpleUrlInput, setSimpleUrlInput] = [
                      newOptionValueInputs['simple-url'] || '',
                      (val: string) => setNewOptionValueInputs((prev) => ({ ...prev, 'simple-url': val }))
                    ];

                    return (
                      <div className="space-y-4 pt-4 border-t border-neutral-100">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 uppercase tracking-wider">
                              <ImageIcon className="w-4 h-4 text-neutral-700" />
                              <span>Product Photos &amp; Gallery ({allSimpleImages.length})</span>
                              <span className="text-rose-500">*</span>
                            </label>
                            <p className="text-[11px] text-neutral-500">
                              First photo is automatically used as the <strong>Main Display Thumbnail</strong> on the store.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all">
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Upload Photos</span>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleSimpleGalleryFiles(e.target.files)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {/* URL Input & Paste Row */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Paste image URL here or press Ctrl + V..."
                            value={simpleUrlInput}
                            onFocus={() => setActivePasteTarget('root_gallery')}
                            onChange={(e) => setSimpleUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (simpleUrlInput.trim()) {
                                  handleSimpleAddImages([simpleUrlInput.trim()]);
                                  setSimpleUrlInput('');
                                }
                              }
                            }}
                            className="flex-1 h-8 text-xs bg-white px-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-medium"
                          />
                          {simpleUrlInput.trim() && (
                            <button
                              type="button"
                              onClick={() => {
                                handleSimpleAddImages([simpleUrlInput.trim()]);
                                setSimpleUrlInput('');
                              }}
                              className="h-8 px-3 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer shrink-0"
                            >
                              Add URL
                            </button>
                          )}
                        </div>

                        {/* Drag & Drop Zone */}
                        <div
                          tabIndex={0}
                          onFocus={() => setActivePasteTarget('root_gallery')}
                          onClick={() => setActivePasteTarget('root_gallery')}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsGalleryDragOver(true);
                          }}
                          onDragLeave={() => setIsGalleryDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsGalleryDragOver(false);
                            if (e.dataTransfer.files) handleSimpleGalleryFiles(e.dataTransfer.files);
                          }}
                          className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer outline-none bg-white ${
                            isGalleryDragOver
                              ? 'border-neutral-900 bg-neutral-100'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <p className="text-xs text-neutral-500 font-medium">
                            Drag &amp; drop multiple product photos here, click "Upload Photos" or press <span className="font-mono bg-neutral-100 px-1 py-0.5 rounded border">Ctrl + V</span>
                          </p>
                        </div>

                        {/* Uploaded Photos Grid */}
                        {allSimpleImages.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-3 pt-1">
                            {allSimpleImages.map((img, imgIdx) => (
                              <div
                                key={imgIdx}
                                className={`relative aspect-square rounded-xl border-2 overflow-hidden bg-neutral-100 group shadow-2xs ${
                                  imgIdx === 0 ? 'border-neutral-900 ring-2 ring-neutral-900/20' : 'border-neutral-200'
                                }`}
                              >
                                <img
                                  src={img}
                                  alt={`Product Image ${imgIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />

                                {/* First Image Main Badge */}
                                {imgIdx === 0 && (
                                  <div className="absolute top-1 left-1 bg-neutral-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                    ★ Main Cover
                                  </div>
                                )}

                                {/* Hover Actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                  {imgIdx !== 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleSimpleSetMainImage(imgIdx)}
                                      className="text-[9px] bg-white text-black font-bold px-1.5 py-0.5 rounded hover:bg-neutral-100 cursor-pointer w-full text-center"
                                    >
                                      Set as Main
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleSimpleRemoveImage(imgIdx)}
                                    className="text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded hover:bg-rose-700 cursor-pointer w-full text-center"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                </div>
              )}

              {/* ============================================================ */}
              {/* B. VARIABLE PRODUCT SECTION (Options + Variants with Media) */}
              {/* ============================================================ */}
              {productType === 'Variable' && (
                <div className="space-y-6 pt-2">
                  <div className="bg-[#eff6ff] border border-[#dbeafe] text-[#2563eb] rounded-xl p-4 flex items-center gap-3 text-xs font-medium shadow-2xs">
                    <Info className="w-4 h-4 shrink-0 text-[#2563eb]" />
                    <span>
                      Variable Product Mode: Configure options and variants below. Each variation has its own Main Photo, Gallery Photos (Drag &amp; Drop / Ctrl + V), Color Swatch, Price, SKU, and Stock.
                    </span>
                  </div>

                  {/* Variation Options Editor */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        VARIATION ATTRIBUTES
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Custom Option</span>
                      </button>
                    </div>

                    {/* Quick Add from Master Attributes */}
                    {masterAttributes.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap p-3 bg-white border border-neutral-200 rounded-xl">
                        <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider flex items-center gap-1 shrink-0">
                          <Sliders className="w-3.5 h-3.5 text-neutral-500" /> Pre-built Attributes:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {masterAttributes.map((attr) => {
                            const isAdded = options.some(
                              (o) => o.name.toLowerCase() === attr.name.toLowerCase()
                            );
                            return (
                              <button
                                key={attr.id}
                                type="button"
                                onClick={() => handleAddOptionFromMaster(attr)}
                                disabled={isAdded}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                                  isAdded
                                    ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                                    : 'bg-[#FAF8F4] text-neutral-800 border-neutral-200 hover:border-black hover:bg-neutral-100 shadow-2xs'
                                }`}
                              >
                                <Plus className="w-3 h-3 text-neutral-500" />
                                <span>{attr.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Options List */}
                    {options.map((opt, optIdx) => {
                      const matchedMasterAttr = masterAttributes.find(
                        (ma) => ma.name.toLowerCase() === opt.name.toLowerCase()
                      );

                      const isDropdownOpen = openValueDropdownId === opt.id;
                      const searchQuery = (valueSearchQueries[opt.id] || '').toLowerCase();
                      const availableMasterValues = matchedMasterAttr?.values || [];
                      const filteredMasterValues = availableMasterValues.filter((v) =>
                        (v.label || v.value).toLowerCase().includes(searchQuery)
                      );

                      return (
                        <div
                          key={opt.id}
                          className="bg-neutral-50/90 border border-neutral-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs"
                        >
                          <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
                            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                              Option {optIdx + 1}
                            </span>
                            {options.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(optIdx)}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove Option</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                            {/* Attribute Name* Dropdown */}
                            <div className="md:col-span-4 space-y-1.5">
                              <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                                <span>Attribute Name*</span>
                              </label>
                              
                              <div className="space-y-2">
                                <select
                                  value={
                                    masterAttributes.some((ma) => ma.name.toLowerCase() === opt.name.toLowerCase())
                                      ? masterAttributes.find((ma) => ma.name.toLowerCase() === opt.name.toLowerCase())?.name
                                      : '__custom__'
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '__custom__') {
                                      handleOptionNameChange(optIdx, 'Custom Attribute');
                                    } else {
                                      handleOptionNameChange(optIdx, val);
                                    }
                                  }}
                                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-medium cursor-pointer shadow-2xs"
                                >
                                  <option value="" disabled>Select Attribute Name...</option>
                                  {masterAttributes.map((ma) => (
                                    <option key={ma.id} value={ma.name}>
                                      {ma.name}
                                    </option>
                                  ))}
                                  <option value="__custom__">+ Custom Attribute...</option>
                                </select>

                                {!masterAttributes.some((ma) => ma.name.toLowerCase() === opt.name.toLowerCase()) && (
                                  <input
                                    type="text"
                                    value={opt.name}
                                    onChange={(e) => handleOptionNameChange(optIdx, e.target.value)}
                                    placeholder="Enter custom attribute name..."
                                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                                  />
                                )}
                              </div>
                            </div>

                            {/* Attribute Value* Searchable Multi-Select Dropdown */}
                            <div className="md:col-span-8 space-y-1.5 relative">
                              <label className="text-xs font-bold text-neutral-800 flex items-center justify-between">
                                <span>Attribute Value*</span>
                                {opt.values.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = options.map((o) =>
                                        o.id === opt.id ? { ...o, values: [] } : o
                                      );
                                      setOptions(updated);
                                      syncVariantsFromOptions(updated);
                                      setIsDirty(true);
                                    }}
                                    className="text-[10px] text-neutral-500 hover:text-rose-600 font-semibold cursor-pointer"
                                  >
                                    Clear all ({opt.values.length})
                                  </button>
                                )}
                              </label>

                              {/* Multi-Select Input Trigger Box */}
                              <div
                                onClick={() => setOpenValueDropdownId(isDropdownOpen ? null : opt.id)}
                                className="min-h-[38px] p-2 bg-white border border-neutral-300 rounded-lg cursor-pointer flex items-center justify-between gap-2 flex-wrap shadow-2xs hover:border-neutral-400 transition-colors"
                              >
                                {opt.values.length === 0 ? (
                                  <span className="text-xs text-neutral-400 select-none pl-1">Select...</span>
                                ) : (
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {opt.values.map((val, valIdx) => (
                                      <span
                                        key={valIdx}
                                        className="inline-flex items-center gap-1.5 bg-neutral-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-2xs"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {opt.name.toLowerCase().includes('color') && (
                                          <span
                                            className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-xs shrink-0 inline-block"
                                            style={{ backgroundColor: getColorHex(val) }}
                                          />
                                        )}
                                        <span>{val}</span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveOptionValue(opt.id, valIdx);
                                          }}
                                          className="hover:bg-neutral-700 rounded-full p-0.5 cursor-pointer ml-0.5"
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                              </div>

                              {/* Dropdown Menu Popover */}
                              {isDropdownOpen && (
                                <div
                                  className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-neutral-200 rounded-xl shadow-xl p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* Search & Actions Bar */}
                                  <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                                      <input
                                        type="text"
                                        placeholder="Search or type value..."
                                        value={valueSearchQueries[opt.id] || ''}
                                        onChange={(e) =>
                                          setValueSearchQueries((prev) => ({
                                            ...prev,
                                            [opt.id]: e.target.value
                                          }))
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const v = (valueSearchQueries[opt.id] || '').trim();
                                            if (v) {
                                              handleAddOptionValue(opt.id, v);
                                              setValueSearchQueries((prev) => ({ ...prev, [opt.id]: '' }));
                                            }
                                          }
                                        }}
                                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-black font-medium"
                                        autoFocus
                                      />
                                    </div>
                                    {(valueSearchQueries[opt.id] || '').trim() && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const v = (valueSearchQueries[opt.id] || '').trim();
                                          if (v) {
                                            handleAddOptionValue(opt.id, v);
                                            setValueSearchQueries((prev) => ({ ...prev, [opt.id]: '' }));
                                          }
                                        }}
                                        className="text-xs bg-neutral-900 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer shrink-0"
                                      >
                                        + Add
                                      </button>
                                    )}
                                  </div>

                                  {/* Quick Select All from Master */}
                                  {matchedMasterAttr && matchedMasterAttr.values && matchedMasterAttr.values.length > 0 && (
                                    <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5 text-[11px]">
                                      <span className="text-neutral-500 font-medium">
                                        Available from {matchedMasterAttr.name}:
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAddAllValuesFromMaster(opt.id, matchedMasterAttr)}
                                        className="text-neutral-900 font-bold hover:underline cursor-pointer"
                                      >
                                        + Select All
                                      </button>
                                    </div>
                                  )}

                                  {/* Values List */}
                                  <div className="max-h-52 overflow-y-auto space-y-1 divide-y divide-neutral-100 pr-1">
                                    {filteredMasterValues.length > 0 ? (
                                      filteredMasterValues.map((v) => {
                                        const valStr = (v.label || v.value).trim();
                                        const isSelected = opt.values.includes(valStr);

                                        return (
                                          <div
                                            key={v.id || valStr}
                                            onClick={() => {
                                              if (isSelected) {
                                                const idx = opt.values.indexOf(valStr);
                                                if (idx !== -1) handleRemoveOptionValue(opt.id, idx);
                                              } else {
                                                handleAddOptionValue(opt.id, valStr);
                                              }
                                            }}
                                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                                              isSelected
                                                ? 'bg-neutral-900 text-white'
                                                : 'hover:bg-neutral-100 text-neutral-800'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              {v.colorCode ? (
                                                <span
                                                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                                                  style={{ backgroundColor: v.colorCode }}
                                                />
                                              ) : opt.name.toLowerCase().includes('color') ? (
                                                <span
                                                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                                                  style={{ backgroundColor: getColorHex(valStr) }}
                                                />
                                              ) : null}
                                              <span>{valStr}</span>
                                            </div>
                                            {isSelected && <Check className="w-3.5 h-3.5" />}
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <div className="p-3 text-center text-xs text-neutral-400">
                                        No matching values. Press "Enter" to add custom value.
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-end pt-1 border-t border-neutral-100">
                                    <button
                                      type="button"
                                      onClick={() => setOpenValueDropdownId(null)}
                                      className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold px-3 py-1 rounded-md cursor-pointer"
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Live Color Picker for Color Attribute */}
                          {opt.name.toLowerCase().includes('color') && (
                            <div className="bg-white border border-neutral-200/90 rounded-xl p-3.5 space-y-3 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                                  <Palette className="w-4 h-4 text-brand-maroon" />
                                  <span>Color Code Picker &amp; Live Name Detection</span>
                                </span>
                                <span className="text-[11px] text-neutral-400">
                                  Pick any color — name will detect automatically
                                </span>
                              </div>

                              <div className="flex items-center gap-3 flex-wrap bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/80">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={activePickerHex}
                                    onChange={(e) => handleColorPickerChange(e.target.value)}
                                    className="w-9 h-9 rounded-lg border border-neutral-300 cursor-pointer p-0.5 bg-white shadow-2xs shrink-0"
                                    title="Click to open color spectrum picker"
                                  />
                                  <input
                                    type="text"
                                    value={activePickerHex}
                                    onChange={(e) => handleColorPickerChange(e.target.value)}
                                    placeholder="#000000"
                                    className="w-24 px-2.5 py-1.5 text-xs font-mono font-semibold bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-black"
                                  />
                                </div>

                                <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                                  <span className="text-[11px] font-semibold text-neutral-500 shrink-0">
                                    Color Name:
                                  </span>
                                  <input
                                    type="text"
                                    value={activePickerName}
                                    onChange={(e) => setActivePickerName(e.target.value)}
                                    placeholder="Color name"
                                    className="w-full px-3 py-1.5 text-xs font-bold text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-black"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const nameToAdd = (activePickerName || '').trim() || getClosestColorName(activePickerHex).name;
                                    handleAddOptionValue(opt.id, nameToAdd);
                                  }}
                                  className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-lg shadow-2xs transition-all cursor-pointer shrink-0"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Color</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add an option Button (Styled as in user screenshot) */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add an option</span>
                      </button>
                    </div>
                  </div>

                  {/* Configured Variants Matrix */}
                  <div className="border-t border-dashed border-neutral-300 pt-6 space-y-6">
                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      CONFIGURED VARIANTS ({variants.length})
                    </h4>

                    <div className="space-y-6">
                      {variants.map((v, vIdx) => {
                        const vMainImg = v.mainImage || v.images?.[0] || mainImage || '/images/category/Latkan.webp';
                        const vGals = v.galleryImages || [];

                        return (
                          <div
                            key={v.id || vIdx}
                            className="border border-neutral-200 rounded-xl p-5 space-y-5 bg-neutral-50/60 shadow-2xs"
                          >
                            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className="w-4 h-4 rounded-full border border-neutral-300 shadow-2xs shrink-0"
                                  style={{ backgroundColor: (v as any).colorHex || '#800000' }}
                                />
                                <h5 className="text-xs font-bold text-neutral-900">
                                  {v.name || v.optionValue}
                                </h5>
                              </div>
                            </div>

                            {/* 4-Column Pricing & Inventory */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                              {/* Variant Selling Price */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-neutral-700">
                                  Selling Price (₹) *
                                </label>
                                <input
                                  type="number"
                                  value={v.price}
                                  onChange={(e) =>
                                    handleUpdateVariantField(vIdx, 'price', Number(e.target.value))
                                  }
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-black font-semibold"
                                />
                              </div>

                              {/* Variant Regular Price */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-neutral-700">
                                  Regular Price (₹)
                                </label>
                                <input
                                  type="number"
                                  value={v.salePrice || ''}
                                  onChange={(e) =>
                                    handleUpdateVariantField(
                                      vIdx,
                                      'salePrice',
                                      e.target.value ? Number(e.target.value) : undefined
                                    )
                                  }
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-black"
                                />
                              </div>

                              {/* Variant SKU */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-neutral-700">
                                  SKU
                                </label>
                                <input
                                  type="text"
                                  value={v.sku}
                                  onChange={(e) =>
                                    handleUpdateVariantField(vIdx, 'sku', e.target.value)
                                  }
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-black font-mono"
                                />
                              </div>

                              {/* Variant Stock */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-neutral-700">
                                  Stock Qty *
                                </label>
                                <input
                                  type="number"
                                  value={v.quantity}
                                  onChange={(e) =>
                                    handleUpdateVariantField(vIdx, 'quantity', Number(e.target.value))
                                  }
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-black"
                                />
                              </div>
                            </div>

                            {/* VARIANT GALLERY & PHOTOS (Unified Uploader: 1st image is Main Image) */}
                            {(() => {
                              const variantImages = (v.images && v.images.length > 0)
                                ? v.images
                                : [v.mainImage, ...(v.galleryImages || [])].filter(Boolean);
                              const [varUrlInput, setVarUrlInput] = [newOptionValueInputs[`var-url-${vIdx}`] || '', (val: string) => setNewOptionValueInputs((prev) => ({ ...prev, [`var-url-${vIdx}`]: val }))];

                              return (
                                <div className="space-y-3 pt-3 border-t border-neutral-200/80">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div>
                                      <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 uppercase tracking-wider">
                                        <ImageIcon className="w-4 h-4 text-neutral-700" />
                                        <span>Variant Photos &amp; Gallery ({variantImages.length})</span>
                                      </label>
                                      <p className="text-[11px] text-neutral-500">
                                        First photo is automatically used as the <strong>Main Product Image</strong> for this variant.
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <label className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all">
                                        <UploadCloud className="w-3.5 h-3.5" />
                                        <span>Upload Variant Photos</span>
                                        <input
                                          type="file"
                                          multiple
                                          accept="image/*"
                                          onChange={(e) => handleVariantGalleryFiles(vIdx, e.target.files)}
                                          className="hidden"
                                        />
                                      </label>
                                    </div>
                                  </div>

                                  {/* URL Input & Paste Row */}
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder="Paste image URL here or press Ctrl + V..."
                                      value={varUrlInput}
                                      onFocus={() => setActivePasteTarget({ type: 'var_gallery', index: vIdx })}
                                      onChange={(e) => setVarUrlInput(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          if (varUrlInput.trim()) {
                                            handleVariantAddImages(vIdx, [varUrlInput.trim()]);
                                            setVarUrlInput('');
                                          }
                                        }
                                      }}
                                      className="flex-1 h-8 text-xs bg-white px-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                                    />
                                    {varUrlInput.trim() && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleVariantAddImages(vIdx, [varUrlInput.trim()]);
                                          setVarUrlInput('');
                                        }}
                                        className="h-8 px-3 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer shrink-0"
                                      >
                                        Add URL
                                      </button>
                                    )}
                                  </div>

                                  {/* Drag & Drop Zone */}
                                  <div
                                    tabIndex={0}
                                    onFocus={() => setActivePasteTarget({ type: 'var_gallery', index: vIdx })}
                                    onClick={() => setActivePasteTarget({ type: 'var_gallery', index: vIdx })}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      setActiveVarDragGal(vIdx);
                                    }}
                                    onDragLeave={() => setActiveVarDragGal(null)}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      setActiveVarDragGal(null);
                                      if (e.dataTransfer.files) handleVariantGalleryFiles(vIdx, e.dataTransfer.files);
                                    }}
                                    className={`border-2 border-dashed rounded-xl p-3 text-center transition-colors cursor-pointer outline-none bg-white ${
                                      activeVarDragGal === vIdx
                                        ? 'border-neutral-900 bg-neutral-100'
                                        : 'border-neutral-200 hover:border-neutral-300'
                                    }`}
                                  >
                                    <p className="text-[11px] text-neutral-500">
                                      Drag &amp; drop photos here, or click to activate clipboard <span className="font-mono bg-neutral-100 px-1 py-0.5 rounded border">Ctrl + V</span>
                                    </p>
                                  </div>

                                  {/* Uploaded Photos Grid */}
                                  {variantImages.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2.5 pt-1">
                                      {variantImages.map((img, imgIdx) => (
                                        <div
                                          key={imgIdx}
                                          className={`relative aspect-square rounded-xl border-2 overflow-hidden bg-neutral-100 group shadow-2xs ${
                                            imgIdx === 0 ? 'border-neutral-900 ring-2 ring-neutral-900/20' : 'border-neutral-200'
                                          }`}
                                        >
                                          <img
                                            src={img}
                                            alt={`Variant ${v.optionValue} image ${imgIdx + 1}`}
                                            className="w-full h-full object-cover"
                                          />

                                          {/* First Image Main Badge */}
                                          {imgIdx === 0 && (
                                            <div className="absolute top-1 left-1 bg-neutral-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                              ★ Main Cover
                                            </div>
                                          )}

                                          {/* Hover Actions */}
                                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                            {imgIdx !== 0 && (
                                              <button
                                                type="button"
                                                onClick={() => handleVariantSetMainImage(vIdx, imgIdx)}
                                                className="text-[9px] bg-white text-black font-bold px-1.5 py-0.5 rounded hover:bg-neutral-100 cursor-pointer w-full text-center"
                                              >
                                                Set as Main
                                              </button>
                                            )}
                                            <button
                                              type="button"
                                              onClick={() => handleVariantRemoveImage(vIdx, imgIdx)}
                                              className="text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded hover:bg-rose-700 cursor-pointer w-full text-center"
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>

        {/* 3. DESCRIPTIONS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start border-b border-neutral-200/80 pb-10">
          <div className="lg:col-span-3 space-y-1">
            <h2 className="text-sm font-bold text-neutral-900 tracking-tight">Descriptions</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Write engaging overview text and detailed rich product specifications for customer education
            </p>
          </div>

          <div className="lg:col-span-9 space-y-6">
            <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs p-6 space-y-5">
              
              {/* Short Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  Short Description / Overview Summary
                </label>
                <textarea
                  rows={3}
                  value={shortDescription}
                  onChange={(e) => {
                    setShortDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Concise 1-2 sentence overview shown near the Buy buttons..."
                  className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950 font-normal leading-relaxed"
                />
              </div>

              {/* Rich Product Description */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-neutral-700">
                  Full Product Description (Detailed Content Tab)
                </label>
                <RichTextEditor
                  value={longDescription}
                  onChange={(val) => {
                    setLongDescription(val);
                    setIsDirty(true);
                  }}
                  minHeight="200px"
                  placeholder="Write complete product specifications, materials, highlights, and care details..."
                />
              </div>

            </div>
          </div>
        </div>

        {/* 4. ADDITIONAL INFORMATION / SPECIFICATIONS TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-10">
          <div className="lg:col-span-3 space-y-1">
            <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
              Additional Information
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Define custom attribute rows (Material, Dimensions, Weight, Craft Type, Care Instructions) displayed in the website's Additional Information table
            </p>
          </div>

          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  SPECIFICATIONS &amp; ATTRIBUTES TABLE ({specifications.length})
                </h4>
                <button
                  type="button"
                  onClick={handleAddSpecRow}
                  className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Attribute Row</span>
                </button>
              </div>

              <div className="space-y-2.5 pt-2">
                {specifications.map((spec, sIdx) => (
                  <div key={spec.id || sIdx} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleUpdateSpecRow(sIdx, 'key', e.target.value)}
                      placeholder="Attribute (e.g. Material, Dimensions)"
                      className="w-1/3 px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg font-semibold text-neutral-800 focus:outline-none focus:border-black"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleUpdateSpecRow(sIdx, 'value', e.target.value)}
                      placeholder="Value (e.g. Pure Silk, 15x10 cm)"
                      className="flex-1 px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecRow(sIdx)}
                      className="text-neutral-400 hover:text-rose-600 p-2 cursor-pointer transition-colors"
                      title="Delete row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* STICKY BOTTOM ACTION FOOTER */}
      <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-6 py-4 shadow-lg flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (isDirty) setShowDiscardModal(true);
            else navigateBack();
          }}
          className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-1.5 px-4 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSaveProduct('Draft')}
            disabled={isSaving}
            className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 px-4 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSaveProduct('Active')}
            disabled={isSaving}
            className="text-xs font-semibold bg-neutral-950 hover:bg-black text-white px-6 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditMode ? 'Update Product' : 'Publish Product'}</span>
            )}
          </button>
        </div>
      </div>

      {/* DISCARD CONFIRMATION MODAL */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-900">Discard unsaved changes?</h3>
            <p className="text-xs text-neutral-500">
              You have unsaved changes on this product. Are you sure you want to leave without saving?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="text-xs px-3 py-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardModal(false);
                  navigateBack();
                }}
                className="text-xs px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Discard &amp; Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE PREVIEW MODAL */}
      {showFinalPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-neutral-800" />
                <h3 className="text-sm font-bold text-neutral-900">Product Live Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFinalPreviewModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-xl border border-neutral-200 overflow-hidden bg-neutral-100 shrink-0">
                  <img
                    src={productType === 'Variable' ? variants[0]?.mainImage || variants[0]?.images?.[0] || mainImage : mainImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                    {category} {subcategory ? `› ${subcategory}` : ''}
                  </span>
                  <h4 className="text-sm font-bold text-neutral-900">{name || 'Untitled Product'}</h4>
                  <p className="text-xs text-neutral-500 font-mono">SKU: {sku}</p>
                  <p className="text-sm font-bold text-neutral-950">
                    ₹{productType === 'Variable' ? variants[0]?.price || salePrice : salePrice}{' '}
                    {regularPrice > salePrice && (
                      <span className="text-xs text-neutral-400 line-through font-normal">
                        ₹{regularPrice}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Short description preview */}
              {shortDescription && (
                <div className="p-3 bg-neutral-50 rounded-lg text-xs text-neutral-700">
                  <p>{shortDescription}</p>
                </div>
              )}

              {/* Specifications preview */}
              {specifications.length > 0 && (
                <div className="space-y-2 border-t border-neutral-100 pt-3">
                  <h5 className="text-xs font-bold text-neutral-800">Additional Information Table</h5>
                  <div className="border border-neutral-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left divide-y divide-neutral-200">
                      <tbody>
                        {specifications.map((s, i) => (
                          <tr key={i} className="divide-x divide-neutral-200">
                            <td className="p-2 bg-neutral-50 font-semibold text-neutral-700 w-1/3">{s.key}</td>
                            <td className="p-2 text-neutral-800">{s.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Full description preview */}
              {longDescription && (
                <div className="border-t border-neutral-100 pt-3">
                  <h5 className="text-xs font-bold text-neutral-800 mb-2">Full Description</h5>
                  <div
                    className="text-xs text-neutral-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: longDescription }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end border-t border-neutral-100 pt-3">
              <button
                type="button"
                onClick={() => setShowFinalPreviewModal(false)}
                className="text-xs px-4 py-2 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-black cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCreatePage;
