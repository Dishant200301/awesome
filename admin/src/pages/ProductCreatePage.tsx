import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  UploadCloud,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  Package,
  Layers,
  ChevronDown,
  Search,
  Check,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import {
  broadcastAdminProductChange
} from '../data/mockAdminData';
import {
  Product,
  Category,
  Subcategory,
  ProductOptionItem,
  ProductVariantDetail
} from '../types/admin';
import { AttributeMaster } from '../types/attribute.types';
import { AttributeService } from '../services/attributeService';
import { AdminApiService } from '../services/adminApi';
import { RichTextEditor } from '../components/RichTextEditor';
import { Select } from '../components/ui/select';
import { findHexByColorName } from '../utils/colorMatcher';
import { generateSmartProductContent } from '../utils/productContentGenerator';

interface ProductCreatePageProps {
  onNavigate?: (tab: string, productId?: string) => void;
  editingProductId?: string;
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
  { name: 'Green', hex: '#16A34A' }
];

const STANDARD_ATTRIBUTES = [
  { name: 'Color', defaultValues: ['Green', 'Black', 'Red', 'Maroon', 'Gold', 'Blue', 'Pink', 'White'] },
  { name: 'Size', defaultValues: ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'] },
  { name: 'Material', defaultValues: ['Silk', 'Cotton', 'Velvet', 'Georgette', 'Brass'] },
  { name: 'Design', defaultValues: ['Traditional', 'Bridal', 'Floral', 'Contemporary', 'Artisan'] }
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
  const [rawExistingProduct, setRawExistingProduct] = useState<any>(null);

  // Dynamic Categories from Backend API & MySQL
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);

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

  // Fetch dynamic categories directly from backend MySQL API
  const loadDynamicCategories = async () => {
    try {
      const data = await AdminApiService.getCategories();
      if (data && Array.isArray(data.categories)) {
        setMainCategories(data.categories.filter((c) => c.isActive !== false));
        setAllSubcategories(data.subcategories ? data.subcategories.filter((s: any) => s.isActive !== false) : []);
      }
    } catch (err) {
      console.warn('Failed to load dynamic categories:', err);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadDynamicCategories();

    let catBc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        catBc = new BroadcastChannel('awesome_category_sync');
        catBc.onmessage = () => {
          loadDynamicCategories();
        };
      } catch {}
    }

    const handleTaxonomySync = () => {
      loadDynamicCategories();
    };
    window.addEventListener('awesome_category_sync', handleTaxonomySync);
    window.addEventListener('aocind_category_sync', handleTaxonomySync);

    return () => {
      if (catBc) catBc.close();
      window.removeEventListener('awesome_category_sync', handleTaxonomySync);
      window.removeEventListener('aocind_category_sync', handleTaxonomySync);
    };
  }, []);

  // 1. PRODUCT TYPE (Simple Product vs Variable Product) - Default: Simple
  const [productType, setProductType] = useState<'Simple' | 'Variable'>('Simple');

  // 2. PRODUCT DETAILS
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [sku, setSku] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // Available subcategories filtered strictly by selected category
  const filteredSubcategories = useMemo(() => {
    if (!category) return [];
    const parentCat = mainCategories.find(
      (c) => c.name.toLowerCase() === category.toLowerCase() || c.id === category
    );
    if (!parentCat) return [];
    return allSubcategories.filter(
      (s) =>
        s.categoryId === parentCat.id ||
        (s as any).parentId === parentCat.id ||
        (s.categoryName && s.categoryName.toLowerCase() === parentCat.name.toLowerCase()) ||
        ((s as any).parentName && (s as any).parentName.toLowerCase() === parentCat.name.toLowerCase())
    );
  }, [category, mainCategories, allSubcategories]);

  // Set initial category if none chosen
  useEffect(() => {
    if (!category && mainCategories.length > 0 && !isEditMode) {
      const defaultCat = mainCategories[0].name;
      setCategory(defaultCat);
      const parentCat = mainCategories[0];
      const subs = allSubcategories.filter(
        (s) =>
          s.categoryId === parentCat.id ||
          (s as any).parentId === parentCat.id ||
          (s.categoryName && s.categoryName.toLowerCase() === parentCat.name.toLowerCase()) ||
          ((s as any).parentName && (s as any).parentName.toLowerCase() === parentCat.name.toLowerCase())
      );
      if (subs.length > 0) {
        setSubcategory(subs[0].name);
      }
    }
  }, [mainCategories, category, isEditMode, allSubcategories]);

  // Handle Category Change & update Subcategory dynamically
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setIsDirty(true);
    const parentCat = mainCategories.find(
      (c) => c.name.toLowerCase() === newCat.toLowerCase() || c.id === newCat
    );
    const validSubs = parentCat
      ? allSubcategories.filter(
          (s) =>
            s.categoryId === parentCat.id ||
            (s as any).parentId === parentCat.id ||
            (s.categoryName && s.categoryName.toLowerCase() === parentCat.name.toLowerCase()) ||
            ((s as any).parentName && (s as any).parentName.toLowerCase() === parentCat.name.toLowerCase())
        )
      : [];

    if (validSubs.length > 0) {
      setSubcategory(validSubs[0].name);
    } else {
      setSubcategory('');
    }
  };

  // Synchronize category & subcategory values when categories list or selection updates
  useEffect(() => {
    if (!category || mainCategories.length === 0) return;
    const parentCat = mainCategories.find(
      (c) => c.name.toLowerCase() === category.toLowerCase() || c.id === category
    );
    if (parentCat) {
      if (category !== parentCat.name) {
        setCategory(parentCat.name);
      }
    } else if (!isEditMode && mainCategories.length > 0) {
      setCategory(mainCategories[0].name);
    }
  }, [category, mainCategories, isEditMode]);

  useEffect(() => {
    if (!category) {
      if (subcategory) setSubcategory('');
      return;
    }
    if (filteredSubcategories.length === 0) {
      if (subcategory) setSubcategory('');
    } else if (subcategory) {
      const match = filteredSubcategories.find(
        (s) => s.name.toLowerCase() === subcategory.toLowerCase() || s.id === subcategory
      );
      if (match) {
        if (subcategory !== match.name) {
          setSubcategory(match.name);
        }
      } else if (!isEditMode) {
        setSubcategory(filteredSubcategories[0].name);
      } else {
        setSubcategory('');
      }
    }
  }, [category, filteredSubcategories, subcategory, isEditMode]);

  // 3. PRICING & INVENTORY (For Simple Product)
  const [sellingPrice, setSellingPrice] = useState<string>('799');
  const [regularPrice, setRegularPrice] = useState<string>('999');
  const [stock, setStock] = useState<string>('25');

  // 4. PRODUCT IMAGES (Main + Gallery)
  const [images, setImages] = useState<string[]>([
    '/images/category/Latkan.webp'
  ]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // 5. DESCRIPTIONS
  const [shortDescription, setShortDescription] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // 6. VARIANT PRODUCT: ATTRIBUTES & GENERATED COMBINATIONS
  const [attributes, setAttributes] = useState<ProductOptionItem[]>([
    {
      id: 'attr-color',
      name: 'Color',
      values: ['Green', 'Black']
    },
    {
      id: 'attr-size',
      name: 'Size',
      values: ['S', 'M', 'XL']
    }
  ]);

  const [variants, setVariants] = useState<ProductVariantDetail[]>([]);
  const [activeVariantImageModal, setActiveVariantImageModal] = useState<number | null>(null);

  // Auto-generate slug and SKU
  useEffect(() => {
    if (name && !slug) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
    if (!isEditMode && name && !sku) {
      const catPrefix = category ? category.slice(0, 3).toUpperCase() : 'PRD';
      const namePart = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
      setSku(`AH-${catPrefix}-${namePart || '001'}`);
    }
  }, [name, category, isEditMode, slug, sku]);

  // Auto-generate Short & Full Descriptions when Name, Category, or Subcategory changes
  useEffect(() => {
    if (!name || name.trim().length < 2) return;
    if (isEditMode && description && shortDescription) return;

    const generated = generateSmartProductContent({
      title: name.trim(),
      category: category || '',
      subcategory: subcategory || '',
      imageNames: images,
      seed: Math.floor(Math.random() * 5000),
    });

    if (!shortDescription || shortDescription.includes('Authentically handcrafted') || shortDescription.includes('Elevate your ethnic') || shortDescription.includes('Handmade with utmost') || shortDescription.includes('A captivating') || shortDescription.includes('Exquisite artisanal')) {
      setShortDescription(generated.shortDescription);
    }

    if (!description || description.includes('PRODUCT OVERVIEW')) {
      setDescription(generated.longDescription);
    }
  }, [name, category, subcategory]);

  // Manual Trigger for Auto-Generating ONLY Short Description with unique variation per click
  const handleAutoGenerateShortDescription = () => {
    if (!name || !name.trim()) {
      showToast('Please enter a Product Name first');
      return;
    }
    const freshSeed = Date.now() + Math.floor(Math.random() * 100000);
    const generated = generateSmartProductContent({
      title: name.trim(),
      category: category || '',
      subcategory: subcategory || '',
      imageNames: images,
      seed: freshSeed,
    });
    setShortDescription(generated.shortDescription);
    setIsDirty(true);
    showToast('✨ Generated fresh Short Description!');
  };

  // Manual Trigger for Auto-Generating ONLY Full Description with unique variation per click
  const handleAutoGenerateLongDescription = () => {
    if (!name || !name.trim()) {
      showToast('Please enter a Product Name first');
      return;
    }
    const freshSeed = Date.now() + Math.floor(Math.random() * 100000);
    const generated = generateSmartProductContent({
      title: name.trim(),
      category: category || '',
      subcategory: subcategory || '',
      imageNames: images,
      seed: freshSeed,
    });
    setDescription(generated.longDescription);
    setIsDirty(true);
    showToast('✨ Generated fresh Full Description!');
  };

  // Helper to extract clean image URL from string or object
  const extractImageUrl = (item: any): string => {
    if (!item) return '';
    if (typeof item === 'string') return item.trim();
    if (typeof item === 'object') {
      return (item.url || item.src || item.image || item.mainImage || '').trim();
    }
    return '';
  };

  // Load Existing Product in Edit Mode
  useEffect(() => {
    if (!effectiveProductId) return;

    let isMounted = true;
    const loadProduct = async () => {
      setIsInitialLoading(true);
      try {
        const prod = await AdminApiService.getProductById(effectiveProductId);
        if (!prod || !isMounted) return;
        setRawExistingProduct(prod);

        // Basic Info
        setName(prod.name || prod.displayName || '');
        setSlug(prod.slug || '');
        setCategory(prod.category || (Array.isArray(prod.categories) && prod.categories[0]) || '');
        setSubcategory(prod.subcategory || prod.subCategory || '');
        setBrand(prod.brand || '');
        setTags(Array.isArray(prod.tags) ? prod.tags.join(', ') : (prod.tags || ''));
        setStatus(prod.status === 'Inactive' || prod.status === 'Draft' ? 'Inactive' : 'Active');

        // Determine if Simple or Variable
        const hasVariants =
          (Array.isArray(prod.variantDetails) && prod.variantDetails.length > 0) ||
          (Array.isArray(prod.variants) && prod.variants.length > 0) ||
          (Array.isArray(prod.variations) && prod.variations.length > 0) ||
          (Array.isArray(prod.productOptions) && prod.productOptions.length > 0);

        const isVariable =
          prod.type === 'Variable' || (prod as any).type === 'Variant' || hasVariants;
        setProductType(isVariable ? 'Variable' : 'Simple');

        // Pricing & Inventory
        setSellingPrice(String(prod.price !== undefined ? prod.price : ((prod as any).salePrice || 799)));
        setRegularPrice(String(prod.regularPrice || prod.originalPrice || prod.price || 999));
        setSku(prod.sku || prod.defaultSku || 'AH-LAT-001');
        setStock(String(prod.stock !== undefined ? prod.stock : 25));

        // Descriptions & Content
        setShortDescription(prod.shortDescription || prod.subtitle || '');
        setDescription(prod.fullDescription || prod.longDescription || (prod as any).description || '');

        // Images Collection
        const loadedImgs: string[] = [];
        const addImg = (val: any) => {
          const url = extractImageUrl(val);
          if (url && !loadedImgs.includes(url)) {
            loadedImgs.push(url);
          }
        };

        addImg(prod.mainImage);
        addImg(prod.image);
        addImg((prod as any).thumbnail);
        if (Array.isArray(prod.galleryImages)) prod.galleryImages.forEach(addImg);
        if (Array.isArray(prod.images)) prod.images.forEach(addImg);
        if (Array.isArray(prod.variations)) {
          prod.variations.forEach((v: any) => {
            addImg(v.mainImage || v.thumbnail || v.image);
            if (Array.isArray(v.images)) v.images.forEach(addImg);
            if (Array.isArray(v.galleryImages)) v.galleryImages.forEach(addImg);
          });
        }
        if (Array.isArray(prod.variants)) {
          prod.variants.forEach((v: any) => {
            addImg(v.mainImage || v.image);
            if (Array.isArray(v.images)) v.images.forEach(addImg);
            if (Array.isArray(v.galleryImages)) v.galleryImages.forEach(addImg);
          });
        }

        if (loadedImgs.length > 0) {
          setImages(loadedImgs);
        }

        // 1. Parse Attributes / Options
        let loadedAttributes: ProductOptionItem[] = [];
        if (Array.isArray(prod.productOptions) && prod.productOptions.length > 0) {
          loadedAttributes = prod.productOptions.map((opt: any, i: number) => ({
            id: opt.id || `attr-${i}`,
            name: opt.name || `Option ${i + 1}`,
            values: Array.isArray(opt.values) ? opt.values : []
          }));
        } else if (Array.isArray(prod.attributes) && prod.attributes.length > 0) {
          loadedAttributes = prod.attributes
            .filter((a: any) => a && (a.name || a.key))
            .map((a: any, i: number) => ({
              id: a.id || `attr-${i}`,
              name: a.name || a.key,
              values: Array.isArray(a.values) ? a.values : (Array.isArray(a.options) ? a.options : [])
            }));
        }

        // 2. Parse Variants
        let loadedVariants: ProductVariantDetail[] = [];
        if (Array.isArray(prod.variantDetails) && prod.variantDetails.length > 0) {
          loadedVariants = prod.variantDetails.map((v: any, i: number) => {
            const vMain = extractImageUrl(v.mainImage) || extractImageUrl(v.image) || (Array.isArray(v.images) ? extractImageUrl(v.images[0]) : '') || loadedImgs[0] || '/images/category/Latkan.webp';
            const vGals: string[] = [];
            if (Array.isArray(v.galleryImages)) v.galleryImages.forEach((g: any) => { const u = extractImageUrl(g); if (u && !vGals.includes(u)) vGals.push(u); });
            if (Array.isArray(v.images)) v.images.forEach((g: any) => { const u = extractImageUrl(g); if (u && !vGals.includes(u)) vGals.push(u); });
            const allVImgs = Array.from(new Set([vMain, ...vGals].filter(Boolean)));

            return {
              id: v.id || `var-${i}`,
              name: v.name || v.optionValue || v.title || `Variant ${i + 1}`,
              optionValue: v.optionValue || v.name || v.title || `Variant ${i + 1}`,
              price: v.price !== undefined ? Number(v.price) : (prod.price || 799),
              salePrice: v.salePrice !== undefined ? Number(v.salePrice) : (v.originalPrice !== undefined ? Number(v.originalPrice) : (prod.originalPrice || 1299)),
              quantity: v.quantity !== undefined ? Number(v.quantity) : (v.stock !== undefined ? Number(v.stock) : 25),
              sku: v.sku || `${prod.sku || 'AH-LAT'}-${i + 1}`,
              colorHex: v.colorHex || findHexByColorName(v.optionValue || v.name || ''),
              mainImage: vMain,
              galleryImages: vGals,
              images: allVImgs.length > 0 ? allVImgs : [vMain],
              status: v.status === 'Inactive' ? 'Inactive' : 'Active'
            };
          });
        } else if (Array.isArray(prod.variants) && prod.variants.length > 0) {
          loadedVariants = prod.variants.map((v: any, i: number) => {
            const vMain = extractImageUrl(v.mainImage) || extractImageUrl(v.image) || (Array.isArray(v.images) ? extractImageUrl(v.images[0]) : '') || loadedImgs[0] || '/images/category/Latkan.webp';
            const vGals: string[] = [];
            if (Array.isArray(v.galleryImages)) v.galleryImages.forEach((g: any) => { const u = extractImageUrl(g); if (u && !vGals.includes(u)) vGals.push(u); });
            if (Array.isArray(v.images)) v.images.forEach((g: any) => { const u = extractImageUrl(g); if (u && !vGals.includes(u)) vGals.push(u); });
            const allVImgs = Array.from(new Set([vMain, ...vGals].filter(Boolean)));

            return {
              id: v.id || `var-${i}`,
              name: v.title || v.name || v.colorName || `Variant ${i + 1}`,
              optionValue: v.title || v.name || v.colorName || `Variant ${i + 1}`,
              price: v.price !== undefined ? Number(v.price) : (prod.price || 799),
              salePrice: v.originalPrice !== undefined ? Number(v.originalPrice) : (v.salePrice !== undefined ? Number(v.salePrice) : (prod.originalPrice || 1299)),
              quantity: v.stock !== undefined ? Number(v.stock) : (v.quantity !== undefined ? Number(v.quantity) : 25),
              sku: v.sku || `${prod.sku || 'AH-LAT'}-${i + 1}`,
              colorHex: v.colorHex || findHexByColorName(v.colorName || v.title || ''),
              mainImage: vMain,
              galleryImages: vGals,
              images: allVImgs.length > 0 ? allVImgs : [vMain],
              status: v.status === 'Inactive' ? 'Inactive' : 'Active'
            };
          });
        } else if (Array.isArray(prod.variations) && prod.variations.length > 0) {
          loadedVariants = prod.variations.map((v: any, i: number) => {
            const vMain = extractImageUrl(v.mainImage) || extractImageUrl(v.displayImage) || extractImageUrl(v.image) || loadedImgs[0] || '/images/category/Latkan.webp';
            const vGals: string[] = [];
            if (Array.isArray(v.galleryImages)) v.galleryImages.forEach((g: any) => { const u = extractImageUrl(g); if (u && !vGals.includes(u)) vGals.push(u); });
            const allVImgs = Array.from(new Set([vMain, ...vGals].filter(Boolean)));

            return {
              id: v.id || `var-${i}`,
              name: v.colorName || v.name || `Variant ${i + 1}`,
              optionValue: v.colorName || v.name || `Variant ${i + 1}`,
              price: v.price !== undefined ? Number(v.price) : (prod.price || 799),
              salePrice: v.originalPrice !== undefined ? Number(v.originalPrice) : (prod.originalPrice || 1299),
              quantity: v.stock !== undefined ? Number(v.stock) : 25,
              sku: v.sku || `${prod.sku || 'AH-LAT'}-${i + 1}`,
              colorHex: v.colorHex || findHexByColorName(v.colorName || ''),
              mainImage: vMain,
              galleryImages: vGals,
              images: allVImgs.length > 0 ? allVImgs : [vMain],
              status: v.status === 'Inactive' ? 'Inactive' : 'Active'
            };
          });
        }

        // If no attributes were explicitly loaded but variants exist, reconstruct attributes
        if (loadedAttributes.length === 0 && loadedVariants.length > 0) {
          const colorSet = new Set<string>();
          const sizeSet = new Set<string>();

          loadedVariants.forEach((v) => {
            const parts = (v.optionValue || v.name).split('/').map((s) => s.trim());
            if (parts.length >= 2) {
              colorSet.add(parts[0]);
              sizeSet.add(parts[1]);
            } else if (parts.length === 1 && parts[0]) {
              colorSet.add(parts[0]);
            }
          });

          if (colorSet.size > 0) {
            loadedAttributes.push({
              id: 'attr-color-loaded',
              name: 'Color',
              values: Array.from(colorSet)
            });
          }
          if (sizeSet.size > 0) {
            loadedAttributes.push({
              id: 'attr-size-loaded',
              name: 'Size',
              values: Array.from(sizeSet)
            });
          }
        }

        if (loadedAttributes.length > 0) {
          setAttributes(loadedAttributes);
        }
        if (loadedVariants.length > 0) {
          setVariants(loadedVariants);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
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
    }, 3500);
  };

  // Image Upload Handlers
  const handleAddImages = (newUrls: string[]) => {
    const combined = Array.from(new Set([...images, ...newUrls].filter(Boolean)));
    setImages(combined);
    setIsDirty(true);
  };

  const handleRemoveImage = (index: number) => {
    const filtered = images.filter((_, i) => i !== index);
    setImages(filtered);
    setIsDirty(true);
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0 || index >= images.length) return;
    const item = images[index];
    const remaining = images.filter((_, i) => i !== index);
    setImages([item, ...remaining]);
    setIsDirty(true);
    showToast('Main display image set');
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          handleAddImages([reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    showToast('Product images uploaded');
  };

  // Global Paste Handler for Images
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
                if (activeVariantImageModal !== null) {
                  handleVariantAddImages(activeVariantImageModal, [reader.result as string]);
                  showToast('Variant image pasted from clipboard!');
                } else {
                  handleAddImages([reader.result as string]);
                  showToast('Product photo pasted from clipboard!');
                }
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
  }, [images, activeVariantImageModal]);

  // Attribute Handlers for Variant Product Flow
  const handleAddAttribute = () => {
    const available = STANDARD_ATTRIBUTES.find(
      (sa) => !attributes.some((a) => a.name.toLowerCase() === sa.name.toLowerCase())
    );
    const newName = available ? available.name : `Attribute ${attributes.length + 1}`;
    const defaultVals = available ? available.defaultValues.slice(0, 2) : [];

    setAttributes((prev) => [
      ...prev,
      {
        id: `attr-${Date.now()}`,
        name: newName,
        values: defaultVals
      }
    ]);
    setIsDirty(true);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleAttributeNameChange = (index: number, newName: string) => {
    setAttributes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name: newName };
      return next;
    });
    setIsDirty(true);
  };

  const handleAddAttributeValue = (attrId: string, val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    setAttributes((prev) =>
      prev.map((attr) => {
        if (attr.id === attrId) {
          if (attr.values.includes(trimmed)) return attr;
          return { ...attr, values: [...attr.values, trimmed] };
        }
        return attr;
      })
    );
    setValueSearchQueries((prev) => ({ ...prev, [attrId]: '' }));
    setIsDirty(true);
  };

  const handleRemoveAttributeValue = (attrId: string, valIndex: number) => {
    setAttributes((prev) =>
      prev.map((attr) => {
        if (attr.id === attrId) {
          return { ...attr, values: attr.values.filter((_, i) => i !== valIndex) };
        }
        return attr;
      })
    );
    setIsDirty(true);
  };

  // Cartesian product combination generator
  const cartesian = (arrays: string[][]): string[][] => {
    if (arrays.length === 0) return [];
    return arrays.reduce<string[][]>(
      (acc, curr) => acc.flatMap((c) => curr.map((n) => [...c, n])),
      [[]]
    );
  };

  // Generate Variants Button Handler
  const handleGenerateVariants = () => {
    const validAttrs = attributes.filter((a) => a.values && a.values.length > 0);
    if (validAttrs.length === 0) {
      showToast('Please add at least one attribute with values first');
      return;
    }

    const combinations = cartesian(validAttrs.map((a) => a.values));
    const baseSku = sku || 'AH-LAT';
    const baseSelling = Number(sellingPrice) || 399;
    const baseRegular = Number(regularPrice) || 1299;
    const baseStock = Number(stock) || 25;
    const defaultImage = images[0] || '/images/category/Latkan.webp';

    const generated: ProductVariantDetail[] = combinations.map((combo, idx) => {
      const comboName = combo.join(' / ');
      const existing = variants.find((v) => v.optionValue === comboName || v.name.includes(comboName));

      const skuParts = combo.map((part) =>
        part.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()
      );
      const variantSku = `${baseSku}-${skuParts.join('-')}`;

      // Try matching color hex from first color attribute
      const colorVal = combo.find((c) => findHexByColorName(c) !== '#D4AF37') || combo[0];
      const colorHex = findHexByColorName(colorVal || '');

      return (
        existing || {
          id: `var-${Date.now()}-${idx}`,
          name: comboName,
          optionValue: comboName,
          sku: variantSku,
          price: baseSelling,
          salePrice: baseRegular,
          quantity: baseStock,
          colorHex: colorHex,
          mainImage: defaultImage,
          galleryImages: [],
          images: [defaultImage],
          status: 'Active'
        }
      );
    });

    setVariants(generated);
    setIsDirty(true);
    showToast(`✨ Generated ${generated.length} variant combinations!`);
  };

  const handleUpdateVariantField = (
    index: number,
    field: keyof ProductVariantDetail,
    value: any
  ) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setIsDirty(true);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // Variant Image Helpers
  const handleVariantAddImages = (variantIndex: number, newImgs: string[]) => {
    setVariants((prev) => {
      const next = [...prev];
      const target = next[variantIndex];
      const existing = target.images && target.images.length > 0 ? target.images : [target.mainImage].filter(Boolean);
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
      const existing = target.images && target.images.length > 0 ? target.images : [target.mainImage].filter(Boolean);
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

  // Form Validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!name.trim()) errors.name = 'Product Name is required.';
    if (!category.trim()) errors.category = 'Please select a Category.';

    if (productType === 'Simple') {
      if (!sellingPrice || Number(sellingPrice) <= 0) errors.price = 'Please enter a valid Selling Price.';
      if (images.length === 0) errors.images = 'Please upload at least one product image.';
    } else {
      if (variants.length === 0) {
        errors.variants = 'Please click "Generate Variants" to create variant combinations.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save / Publish
  const handleSaveProduct = async (statusOverride?: 'Draft' | 'Active') => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    const finalStatus = statusOverride === 'Draft' ? 'Draft' : (status === 'Active' ? 'Active' : 'Draft');
    const isLive = finalStatus === 'Active';

    const effectiveMainImage =
      images[0] ||
      (productType === 'Variable' && variants[0]?.mainImage ? variants[0].mainImage : '/images/category/Latkan.webp');
    const effectiveGallery = images.slice(1);

    const finalSellingPrice =
      productType === 'Variable' && variants.length > 0
        ? Math.min(...variants.map((v) => Number(v.price) || 399))
        : Number(sellingPrice) || 799;

    const finalOriginalPrice =
      productType === 'Variable' && variants.length > 0
        ? Math.max(...variants.map((v) => Number(v.salePrice || v.price) || 1299))
        : Number(regularPrice) || 999;

    const totalStock =
      productType === 'Variable' && variants.length > 0
        ? variants.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0)
        : Number(stock) || 25;

    const allVariantImages =
      productType === 'Variable'
        ? variants.flatMap((v) =>
            v.images && v.images.length > 0
              ? v.images
              : [v.mainImage, ...(v.galleryImages || [])].filter(Boolean)
          )
        : images;

    const effectiveAllImages: string[] = Array.from(
      new Set([effectiveMainImage, ...effectiveGallery, ...allVariantImages].filter((img): img is string => Boolean(img)))
    );

    const payload: Partial<Product> = {
      ...(rawExistingProduct || {}),
      name: name.trim(),
      displayName: name.trim(),
      slug: (slug.trim() || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')),
      sku: sku.trim() || 'AH-LAT-001',
      defaultSku: sku.trim() || 'AH-LAT-001',
      category: category.trim(),
      categories: [category.trim()],
      subcategory: (subcategory || '').trim(),
      subCategory: (subcategory || '').trim(),
      brand: brand.trim() || 'Awesome Handmade',
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      shortDescription: shortDescription.trim(),
      subtitle: shortDescription.trim(),
      fullDescription: description.trim(),
      longDescription: description.trim(),
      description: description.trim(),
      status: finalStatus,
      isPublished: isLive,
      type: productType,
      price: finalSellingPrice,
      originalPrice: finalOriginalPrice,
      regularPrice: finalOriginalPrice,
      discountPercentage: Math.round(
        (((finalOriginalPrice - finalSellingPrice) / finalOriginalPrice) * 100) || 0
      ),
      stock: totalStock,
      stockStatus: totalStock > 0 ? 'in_stock' : 'out_of_stock',
      image: effectiveMainImage,
      mainImage: effectiveMainImage,
      galleryImages: effectiveGallery,
      images: effectiveAllImages.length > 0 ? effectiveAllImages : images,
      specifications: [],
      productOptions: productType === 'Variable' ? attributes : [],
      attributes: productType === 'Variable' ? attributes.map((a) => ({ name: a.name, values: a.values })) : [],
      variantDetails: productType === 'Variable' ? variants : [],
      variants:
        productType === 'Variable'
          ? variants.map((v, i) => ({
              id: v.id || `var-${i}`,
              title: v.name || v.optionValue,
              colorName: v.optionValue || v.name,
              colorHex: (v as any).colorHex || DEFAULT_COLOR_PALETTES[i % DEFAULT_COLOR_PALETTES.length].hex,
              price: Number(v.price),
              originalPrice: Number(v.salePrice || v.price),
              stock: Number(v.quantity),
              sku: v.sku,
              image: v.mainImage || effectiveMainImage,
              images: ((v.images && v.images.length > 0) ? v.images : (v.mainImage ? [v.mainImage] : [])).filter((img): img is string => Boolean(img)),
              status: ((v as any).status === 'Inactive' ? 'Inactive' : 'Active') as any
            }))
          : [],
      variations:
        productType === 'Variable'
          ? variants.map((v, i) => {
              const vImgList = (v.images && v.images.length > 0) ? v.images : (v.mainImage ? [v.mainImage] : [effectiveMainImage]);
              return {
                id: v.id || `var-${i}`,
                colorName: v.optionValue || v.name,
                colorHex: (v as any).colorHex || DEFAULT_COLOR_PALETTES[i % DEFAULT_COLOR_PALETTES.length].hex,
                size: 'Free Size',
                sizeName: 'Free Size',
                price: Number(v.price),
                originalPrice: Number(v.salePrice || v.price),
                sku: v.sku,
                stock: Number(v.quantity),
                thumbnail: v.mainImage || effectiveMainImage,
                images: vImgList.map((url, idx) => ({
                  id: `img-${i}-${idx}`,
                  url,
                  alt: `${name} - ${v.optionValue}`
                })),
                status: ((v as any).status === 'Inactive' ? 'Inactive' : 'Active') as any
              };
            })
          : [],
      colors:
        productType === 'Variable'
          ? variants.map((v, i) => ({
              id: `col-${i}`,
              colorName: v.optionValue || v.name,
              colorHex: (v as any).colorHex || DEFAULT_COLOR_PALETTES[i % DEFAULT_COLOR_PALETTES.length].hex,
              displayImage: v.mainImage || effectiveMainImage,
              mainImage: v.mainImage || effectiveMainImage,
              galleryImages: v.galleryImages || []
            }))
          : [
              {
                id: 'col-main',
                colorName: 'Standard',
                colorHex: '#C89B3C',
                displayImage: effectiveMainImage,
                mainImage: effectiveMainImage,
                galleryImages: effectiveGallery
              }
            ],
      rating: 4.9,
      reviewCount: 12
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
      }, 900);
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
    <div className="font-sans text-neutral-900 bg-white min-h-screen pb-24">
      {/* SUCCESS TOAST */}
      {saveSuccessMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-neutral-950 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-neutral-800 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="bg-white border-b border-neutral-200 px-6 sm:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center">
            <Package className="w-5 h-5 text-neutral-800" />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-950">
              {isEditMode ? `Edit Product: ${name || 'Untitled'}` : 'Add New Product'}
            </h1>
          </div>
        </div>
      </div>

      {/* VALIDATION ERRORS BANNER */}
      {Object.keys(formErrors).length > 0 && (
        <div className="max-w-7xl mx-auto mt-6 px-4 sm:px-8">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Please fix the following errors:</span>
              <ul className="list-disc list-inside space-y-0.5 text-rose-700">
                {Object.values(formErrors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MAIN FORM CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* 1. TYPE & CONFIGURATION */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-950">Type &amp; Configuration</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Choose between a Simple Product (single item) or Variable Product (multiple variations).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Simple Product Button */}
            <div
              onClick={() => {
                setProductType('Simple');
                setIsDirty(true);
              }}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                productType === 'Simple'
                  ? 'border-neutral-950 bg-neutral-50/50 shadow-xs ring-1 ring-neutral-950/10'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  productType === 'Simple' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-900">Simple Product</h3>
                <p className="text-[11px] text-neutral-400">Single item, no variations</p>
              </div>
            </div>

            {/* Variable Product Button */}
            <div
              onClick={() => {
                setProductType('Variable');
                setIsDirty(true);
              }}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                productType === 'Variable'
                  ? 'border-neutral-950 bg-neutral-50/50 shadow-xs ring-1 ring-neutral-950/10'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  productType === 'Variable' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-900">Variable Product</h3>
                <p className="text-[11px] text-neutral-400">Multiple variations (Color, Size, etc.)</p>
              </div>
            </div>
          </div>

          {productType === 'Variable' && (
            <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-[#2563eb]">
              <Info className="w-4 h-4 shrink-0" />
              <span>Add attributes like Color, Size etc. and generate variations automatically.</span>
            </div>
          )}
        </div>

        {/* 2. PRODUCT INFORMATION */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5">
          <div>
            <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              {productType === 'Simple' ? 'SIMPLE PRODUCT INFORMATION' : 'PRODUCT INFORMATION'}
            </h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Add basic information about your product.
            </p>
          </div>

          {/* Row 1: Name, Category, Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const val = e.target.value;
                  setName(val);
                  setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                  setIsDirty(true);
                }}
                placeholder="e.g. Royal Mirror Latkan"
                className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950 font-medium"
              />
              <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                <span>Slug:</span>
                <span className="text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded font-semibold truncate max-w-[240px]">
                  /{slug || (name ? name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'product-slug')}
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                Category <span className="text-rose-500">*</span>
              </label>
              <Select
                value={category}
                onValueChange={(val) => handleCategoryChange(val)}
                disabled={isCategoriesLoading || mainCategories.length === 0}
                placeholder={isCategoriesLoading ? 'Loading categories...' : mainCategories.length === 0 ? 'No categories found' : 'Select category'}
                options={mainCategories.map((c) => ({
                  value: c.name,
                  label: c.name
                }))}
              />
            </div>

            {/* Subcategory */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                Subcategory <span className="text-rose-500">*</span>
              </label>
              <Select
                value={subcategory}
                onValueChange={(val) => {
                  setSubcategory(val);
                  setIsDirty(true);
                }}
                disabled={!category || filteredSubcategories.length === 0}
                placeholder={
                  !category
                    ? 'Select category first'
                    : filteredSubcategories.length === 0
                    ? 'No subcategories available'
                    : 'Select subcategory'
                }
                options={filteredSubcategories.map((s) => ({
                  value: s.name,
                  label: s.name
                }))}
              />
            </div>
          </div>

          {/* Row 2: For Simple vs Variable */}
          {productType === 'Simple' ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => {
                    setSku(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. AH-LAT-W"
                  className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  Selling Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => {
                    setSellingPrice(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. 799"
                  className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Regular Price (₹)</label>
                <input
                  type="number"
                  value={regularPrice}
                  onChange={(e) => {
                    setRegularPrice(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. 999"
                  className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  Stock Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => {
                    setStock(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. 25"
                  className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => {
                    setSku(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. AH-LAT"
                  className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Brand (Optional)</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => {
                    setBrand(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Awesome Handmade"
                  className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Tags (Optional)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => {
                    setTags(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. handmade, bridal"
                  className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-950"
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. VARIANT ATTRIBUTES & GENERATION (ONLY IN VARIABLE PRODUCT MODE) */}
        {productType === 'Variable' && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
            <div>
              <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                VARIANT ATTRIBUTES
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Select attributes and their values to create product variations.
              </p>
            </div>

            {/* Attributes List */}
            <div className="space-y-4">
              {attributes.map((attr, attrIdx) => (
                <div key={attr.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                  {/* Attribute Name Select */}
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600">Attribute</label>
                    <Select
                      value={attr.name}
                      onValueChange={(val) => handleAttributeNameChange(attrIdx, val)}
                      placeholder="Select attribute"
                      options={[
                        ...STANDARD_ATTRIBUTES.map((sa) => ({ value: sa.name, label: sa.name })),
                        ...masterAttributes
                          .filter((ma) => !STANDARD_ATTRIBUTES.some((sa) => sa.name.toLowerCase() === ma.name.toLowerCase()))
                          .map((ma) => ({ value: ma.name, label: ma.name }))
                      ]}
                    />
                  </div>

                  {/* Attribute Values Multi-Select Box */}
                  <div className="sm:col-span-7 space-y-1 relative">
                    <label className="text-[11px] font-semibold text-neutral-600">Values</label>
                    <div
                      onClick={() => setOpenValueDropdownId(openValueDropdownId === attr.id ? null : attr.id)}
                      className="min-h-[38px] px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg cursor-pointer flex items-center justify-between gap-2 flex-wrap hover:border-neutral-300 transition-colors"
                    >
                      {attr.values.length === 0 ? (
                        <span className="text-xs text-neutral-400 select-none">Select or add values...</span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {attr.values.map((val, vIdx) => (
                            <span
                              key={vIdx}
                              className="inline-flex items-center gap-1 bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px] font-medium px-2 py-0.5 rounded-md"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {attr.name.toLowerCase() === 'color' && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0 inline-block"
                                  style={{ backgroundColor: findHexByColorName(val) }}
                                />
                              )}
                              <span>{val}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveAttributeValue(attr.id, vIdx);
                                }}
                                className="text-neutral-400 hover:text-rose-600 p-0.5 cursor-pointer"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    </div>

                    {/* Popover for Values */}
                    {openValueDropdownId === attr.id && (
                      <div
                        className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-neutral-200 rounded-xl shadow-lg p-3 space-y-2.5 animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Type value and press Enter..."
                            value={valueSearchQueries[attr.id] || ''}
                            onChange={(e) =>
                              setValueSearchQueries((prev) => ({ ...prev, [attr.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddAttributeValue(attr.id, valueSearchQueries[attr.id] || '');
                              }
                            }}
                            className="flex-1 px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-black font-medium"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleAddAttributeValue(attr.id, valueSearchQueries[attr.id] || '')}
                            className="px-3 py-1.5 text-xs bg-neutral-900 text-white font-bold rounded-lg cursor-pointer shrink-0"
                          >
                            + Add
                          </button>
                        </div>

                        {/* Quick Suggestions */}
                        <div className="pt-1 border-t border-neutral-100">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                            Suggestions
                          </span>
                          <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto">
                            {(STANDARD_ATTRIBUTES.find((sa) => sa.name.toLowerCase() === attr.name.toLowerCase())?.defaultValues || DEFAULT_COLOR_PALETTES.map((c) => c.name)).map((sug) => {
                              const isAdded = attr.values.includes(sug);
                              return (
                                <button
                                  key={sug}
                                  type="button"
                                  disabled={isAdded}
                                  onClick={() => handleAddAttributeValue(attr.id, sug)}
                                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                                    isAdded
                                      ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                      : 'bg-neutral-50 border border-neutral-200 text-neutral-700 hover:bg-neutral-100 cursor-pointer'
                                  }`}
                                >
                                  {attr.name.toLowerCase() === 'color' && (
                                    <span
                                      className="w-2 h-2 rounded-full shrink-0"
                                      style={{ backgroundColor: findHexByColorName(sug) }}
                                    />
                                  )}
                                  <span>{sug}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setOpenValueDropdownId(null)}
                            className="text-xs text-neutral-600 hover:text-black font-semibold cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delete Attribute */}
                  <div className="sm:col-span-1 pt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(attrIdx)}
                      className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="Remove attribute"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions: Add Attribute & Generate Variants */}
            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAddAttribute}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 px-3.5 py-2 rounded-lg transition-colors cursor-pointer border border-neutral-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Attribute</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateVariants}
                className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generate Variants</span>
              </button>
            </div>

            {/* 4. GENERATED VARIANTS COMPACT TABLE */}
            {variants.length > 0 && (
              <div className="pt-6 border-t border-neutral-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-neutral-900">
                    {variants.length} Variants Generated
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    Variants are generated automatically based on selected attributes.
                  </span>
                </div>

                <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-semibold text-[11px]">
                        <th className="py-2.5 px-3">Variant</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Selling Price (₹)</th>
                        <th className="py-2.5 px-3">Regular Price (₹)</th>
                        <th className="py-2.5 px-3">Stock</th>
                        <th className="py-2.5 px-3 text-center">Images</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {variants.map((v, vIdx) => {
                        const variantImgCount = (v.images && v.images.length > 0)
                          ? v.images.length
                          : (v.mainImage ? 1 : 0);

                        return (
                          <tr key={v.id || vIdx} className="hover:bg-neutral-50/50">
                            {/* Variant Name & Dot */}
                            <td className="py-2.5 px-3 font-semibold text-neutral-900 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0 inline-block"
                                  style={{ backgroundColor: (v as any).colorHex || '#16A34A' }}
                                />
                                <span>{v.optionValue || v.name}</span>
                              </div>
                            </td>

                            {/* SKU */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={v.sku}
                                onChange={(e) => handleUpdateVariantField(vIdx, 'sku', e.target.value)}
                                className="w-28 px-2 py-1 text-xs font-mono bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-black"
                              />
                            </td>

                            {/* Selling Price */}
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                value={v.price}
                                onChange={(e) => handleUpdateVariantField(vIdx, 'price', Number(e.target.value))}
                                className="w-20 px-2 py-1 text-xs font-semibold bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-black"
                              />
                            </td>

                            {/* Regular Price */}
                            <td className="py-2.5 px-3">
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
                                className="w-20 px-2 py-1 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-black"
                              />
                            </td>

                            {/* Stock */}
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                value={v.quantity}
                                onChange={(e) =>
                                  handleUpdateVariantField(vIdx, 'quantity', Number(e.target.value))
                                }
                                className="w-16 px-2 py-1 text-xs bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-black"
                              />
                            </td>

                            {/* Images Button */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => setActiveVariantImageModal(vIdx)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border border-neutral-200 hover:bg-neutral-100 cursor-pointer shadow-2xs"
                                title="Manage variant photos"
                              >
                                <UploadCloud className="w-3.5 h-3.5 text-neutral-600" />
                                <span>{variantImgCount}</span>
                              </button>
                            </td>

                            {/* Status */}
                            <td className="py-2.5 px-3">
                              <div className="w-24">
                                <Select
                                  value={(v as any).status || 'Active'}
                                  onValueChange={(val) => handleUpdateVariantField(vIdx, 'status', val)}
                                  className="h-8 text-xs"
                                  options={[
                                    { value: 'Active', label: 'Active' },
                                    { value: 'Inactive', label: 'Inactive' }
                                  ]}
                                />
                              </div>
                            </td>

                            {/* Action Delete */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(vIdx)}
                                className="p-1 text-neutral-400 hover:text-rose-600 rounded cursor-pointer"
                                title="Delete variant"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-neutral-500 pt-1">
                  <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>You can upload images for each variant. These images will be shown to customers.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. PRODUCT IMAGES (FOR SIMPLE PRODUCT ONLY) */}
        {productType === 'Simple' && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  PRODUCT IMAGES <span className="text-rose-500">*</span>
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Upload main product image and gallery images.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-xs font-semibold text-neutral-600 hover:text-black px-2.5 py-1.5 rounded-lg border border-neutral-200 cursor-pointer"
                >
                  + Image URL
                </button>
                <label className="inline-flex items-center gap-1.5 bg-neutral-950 hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer shadow-sm transition-all">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* URL Input Form */}
            {showUrlInput && (
              <div className="flex items-center gap-2 p-2 bg-neutral-50 border border-neutral-200 rounded-xl">
                <input
                  type="text"
                  placeholder="Paste image URL here..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (urlInput.trim()) {
                        handleAddImages([urlInput.trim()]);
                        setUrlInput('');
                        setShowUrlInput(false);
                      }
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-black font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (urlInput.trim()) {
                      handleAddImages([urlInput.trim()]);
                      setUrlInput('');
                      setShowUrlInput(false);
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-neutral-900 text-white font-bold rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>
            )}

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer bg-white ${
                isDragOver ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <UploadCloud className="w-6 h-6 text-neutral-400 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-neutral-700">
                Drag &amp; drop images here or click to upload
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                You can upload multiple images
              </p>
            </div>

            {/* Thumbnails Row */}
            {images.length > 0 && (
              <div className="flex items-center gap-3 overflow-x-auto pt-2 pb-1">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={`relative w-20 h-20 rounded-xl border-2 overflow-hidden bg-neutral-100 shrink-0 group shadow-2xs ${
                      i === 0 ? 'border-neutral-950 ring-2 ring-neutral-950/10' : 'border-neutral-200'
                    }`}
                  >
                    <img src={img} alt={`Product ${i}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute top-1 left-1 bg-neutral-950 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                        ★ Main Image
                      </div>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                      {i !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(i)}
                          className="text-[9px] bg-white text-black font-bold px-1.5 py-0.5 rounded hover:bg-neutral-100 cursor-pointer w-full text-center"
                        >
                          Set Main
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded hover:bg-rose-700 cursor-pointer w-full text-center"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add More Box */}
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-300 hover:border-neutral-400 bg-neutral-50 flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0 transition-colors">
                  <Plus className="w-4 h-4 text-neutral-500" />
                  <span className="text-[10px] font-semibold text-neutral-600">Add More</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* 6. SHORT DESCRIPTION */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                SHORT DESCRIPTION
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Short description about the product (for product page summary)
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoGenerateShortDescription}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200/80 transition-colors cursor-pointer shadow-2xs active:scale-95"
              title="Generate tailored AI short description based on product name and category"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Auto Generate Content</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={shortDescription}
              maxLength={300}
              onChange={(e) => {
                setShortDescription(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Write short description..."
              className="w-full px-3.5 py-2.5 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-950 font-normal leading-relaxed resize-none"
            />
            <span className="absolute bottom-2.5 right-3 text-[10px] text-neutral-400 font-mono">
              {shortDescription.length} / 300
            </span>
          </div>
        </div>

        {/* 7. FULL DESCRIPTION */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                DESCRIPTION
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Full description about the product
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoGenerateLongDescription}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200/80 transition-colors cursor-pointer shadow-2xs active:scale-95"
              title="Generate tailored AI full description based on product name and category"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Auto Generate Description</span>
            </button>
          </div>

          <div className="space-y-1">
            <RichTextEditor
              value={description}
              onChange={(val) => {
                setDescription(val);
                setIsDirty(true);
              }}
              minHeight="180px"
              placeholder="Write product description..."
            />
            <div className="flex justify-end pr-1">
              <span className="text-[10px] text-neutral-400 font-mono">
                {description.replace(/<[^>]*>/g, '').length} / 2000
              </span>
            </div>
          </div>
        </div>

        {/* 8. STATUS TOGGLE */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                STATUS
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Choose product status.
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={status === 'Active'}
              onClick={() => {
                setStatus(status === 'Active' ? 'Inactive' : 'Active');
                setIsDirty(true);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                status === 'Active' ? 'bg-neutral-950' : 'bg-neutral-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  status === 'Active' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${status === 'Active' ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-neutral-300'}`} />
            <div>
              <span className="text-xs font-bold text-neutral-900 block">
                {status === 'Active' ? 'Active' : 'Inactive'}
              </span>
              <span className="text-[11px] text-neutral-400">
                {status === 'Active'
                  ? 'Product will be visible to customers'
                  : 'Product will be hidden from store'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* VARIANT IMAGE MODAL */}
      {activeVariantImageModal !== null && variants[activeVariantImageModal] && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Variant Photos: {variants[activeVariantImageModal].optionValue || variants[activeVariantImageModal].name}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Upload photos specifically for this variation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveVariantImageModal(null)}
                className="p-1 text-neutral-400 hover:text-black rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Zone */}
            <label className="border-2 border-dashed border-neutral-200 hover:border-neutral-300 rounded-xl p-5 text-center block cursor-pointer bg-neutral-50/50">
              <UploadCloud className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
              <span className="text-xs font-semibold text-neutral-700 block">Click to upload photos</span>
              <span className="text-[10px] text-neutral-400">or paste from clipboard (Ctrl + V)</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    Array.from(e.target.files).forEach((file) => {
                      if (!file.type.startsWith('image/')) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (reader.result) {
                          handleVariantAddImages(activeVariantImageModal, [reader.result as string]);
                        }
                      };
                      reader.readAsDataURL(file);
                    });
                  }
                }}
                className="hidden"
              />
            </label>

            {/* Photos List */}
            {(() => {
              const v = variants[activeVariantImageModal];
              const vImages = v.images && v.images.length > 0 ? v.images : [v.mainImage].filter(Boolean);

              return (
                <div className="grid grid-cols-4 gap-2.5 max-h-48 overflow-y-auto">
                  {vImages.map((img, imgIdx) => (
                    <div key={imgIdx} className="relative aspect-square rounded-lg border border-neutral-200 overflow-hidden group">
                      <img src={img} alt="Variant" className="w-full h-full object-cover" />
                      {imgIdx === 0 && (
                        <span className="absolute top-1 left-1 bg-black text-white text-[8px] font-bold px-1 rounded">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleVariantRemoveImage(activeVariantImageModal, imgIdx)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 hover:text-rose-300 text-xs font-bold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveVariantImageModal(null)}
                className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM ACTION FOOTER */}
      <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-3 sm:px-10 py-3 flex items-center justify-between gap-2 font-sans">
        <button
          type="button"
          onClick={navigateBack}
          className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSaveProduct('Draft')}
            disabled={isSaving}
            className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 px-3 sm:px-4 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSaveProduct('Active')}
            disabled={isSaving}
            className="text-xs font-bold text-white bg-neutral-950 hover:bg-black px-3.5 sm:px-5 py-2 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 disabled:opacity-50"
          >
            {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Publish Product</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductCreatePage;
