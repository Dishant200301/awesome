import fs from "fs";
import path from "path";
import { Category, Subcategory, Brand, Attribute } from "../../../types/admin.js";
import {
  syncCategoryToMySQL,
  syncSubcategoryToMySQL,
  deleteCategoryFromMySQL,
  deleteSubcategoryFromMySQL,
  syncAllCategoriesToMySQL,
  fetchCategoriesFromMySQL
} from "../../../database/mysqlSync.js";

// Initial Taxonomy Seed Data (12 Master Categories)
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Gift Hamper', slug: 'gift-hamper', image: '/images/category/Gift Hamper.webp', productCount: 15, isActive: true },
  { id: 'cat-2', name: 'Choli', slug: 'choli', image: '/images/category/Choli.webp', productCount: 28, isActive: true },
  { id: 'cat-3', name: 'Krishna Outfit', slug: 'krishna-outfit', image: '/images/category/Krishna outfit.webp', productCount: 10, isActive: true },
  { id: 'cat-4', name: 'Necklace', slug: 'necklace', image: '/images/category/Necklace.webp', productCount: 22, isActive: true },
  { id: 'cat-5', name: 'Latkan', slug: 'latkan', image: '/images/category/Latkan.webp', productCount: 35, isActive: true },
  { id: 'cat-6', name: 'Tassel', slug: 'tassel', image: '/images/category/Tassel.webp', productCount: 14, isActive: true },
  { id: 'cat-7', name: 'Hair Accessories', slug: 'hair-accessories', image: '/images/category/Hair_Accessories.webp', productCount: 18, isActive: true },
  { id: 'cat-8', name: 'Watch', slug: 'watch', image: '/images/category/Watch.webp', productCount: 12, isActive: true },
  { id: 'cat-9', name: 'Bracelet', slug: 'bracelet', image: '/images/category/Bracelet.webp', productCount: 16, isActive: true },
  { id: 'cat-10', name: 'Waist Belt', slug: 'waist-belt', image: '/images/category/Waist Belt.webp', productCount: 9, isActive: true },
  { id: 'cat-11', name: 'Earrings', slug: 'earrings', image: '/images/category/Earrings.webp', productCount: 30, isActive: true },
  { id: 'cat-12', name: 'Anklet', slug: 'anklet', image: '/images/category/Anklet.webp', productCount: 8, isActive: true }
];

const DEFAULT_SUBCATEGORIES: Subcategory[] = [
  { id: 'sub-1', categoryId: 'cat-1', categoryName: 'Gift Hamper', name: 'Keychain', slug: 'keychain' },
  { id: 'sub-2', categoryId: 'cat-2', categoryName: 'Choli', name: 'Kids Choli', slug: 'kids-choli' },
  { id: 'sub-3', categoryId: 'cat-2', categoryName: 'Choli', name: 'Adult Choli', slug: 'adult-choli' },
  { id: 'sub-4', categoryId: 'cat-4', categoryName: 'Necklace', name: 'Mirror Necklace', slug: 'mirror-necklace' },
  { id: 'sub-5', categoryId: 'cat-5', categoryName: 'Latkan', name: 'Mirror Latkan', slug: 'mirror-latkan' },
  { id: 'sub-6', categoryId: 'cat-5', categoryName: 'Latkan', name: 'Blouse Latkan', slug: 'blouse-latkan' },
  { id: 'sub-7', categoryId: 'cat-5', categoryName: 'Latkan', name: 'Mirror Wall Decor', slug: 'mirror-wall-decor' },
  { id: 'sub-8', categoryId: 'cat-5', categoryName: 'Latkan', name: 'Fabric Latkan', slug: 'fabric-latkan' },
  { id: 'sub-9', categoryId: 'cat-5', categoryName: 'Latkan', name: 'Golden Latkan', slug: 'golden-latkan' },
  { id: 'sub-10', categoryId: 'cat-5', categoryName: 'Latkan', name: 'Crochet Latkan', slug: 'crochet-latkan' },
  { id: 'sub-11', categoryId: 'cat-6', categoryName: 'Tassel', name: 'Long Tassels', slug: 'long-tassels' },
  { id: 'sub-12', categoryId: 'cat-7', categoryName: 'Hair Accessories', name: 'Hair Bow', slug: 'hair-bow' },
  { id: 'sub-13', categoryId: 'cat-7', categoryName: 'Hair Accessories', name: 'Hair Clip', slug: 'hair-clip' },
  { id: 'sub-14', categoryId: 'cat-7', categoryName: 'Hair Accessories', name: 'Hair Band', slug: 'hair-band' },
  { id: 'sub-15', categoryId: 'cat-8', categoryName: 'Watch', name: 'Kids Watch', slug: 'kids-watch' },
  { id: 'sub-16', categoryId: 'cat-8', categoryName: 'Watch', name: 'Traditional Watch', slug: 'traditional-watch' },
  { id: 'sub-17', categoryId: 'cat-10', categoryName: 'Waist Belt', name: 'Mirror Waist Belt', slug: 'mirror-waist-belt' },
  { id: 'sub-18', categoryId: 'cat-11', categoryName: 'Earrings', name: 'Mirror Earrings', slug: 'mirror-earrings' },
  { id: 'sub-19', categoryId: 'cat-11', categoryName: 'Earrings', name: 'Hoop Earrings', slug: 'hoop-earrings' }
];

const DB_FILE_PATH = path.join(process.cwd(), "taxonomies_db.json");

let categories: Category[] = [...DEFAULT_CATEGORIES];
let subcategories: Subcategory[] = [...DEFAULT_SUBCATEGORIES];

export const loadFromDisk = () => {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
        categories = parsed.categories;
      } else {
        categories = [...DEFAULT_CATEGORIES];
      }
      if (parsed && Array.isArray(parsed.subcategories) && parsed.subcategories.length > 0) {
        subcategories = parsed.subcategories;
      } else {
        subcategories = [...DEFAULT_SUBCATEGORIES];
      }
    } else {
      categories = [...DEFAULT_CATEGORIES];
      subcategories = [...DEFAULT_SUBCATEGORIES];
    }
  } catch (e) {
    console.warn("[TaxonomyStore] Could not read taxonomies_db.json");
    categories = [...DEFAULT_CATEGORIES];
    subcategories = [...DEFAULT_SUBCATEGORIES];
  }
};

export const saveToDisk = () => {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify({ categories, subcategories }, null, 2), "utf-8");
  } catch (e) {
    console.error("[TaxonomyStore] Failed to write taxonomies_db.json:", e);
  }
};

loadFromDisk();

export const refreshTaxonomiesFromMySQL = async (): Promise<{ categories: Category[]; subcategories: Subcategory[] }> => {
  try {
    const data = await fetchCategoriesFromMySQL();
    if (data && Array.isArray(data.categories) && data.categories.length > 0) {
      categories = data.categories;
      subcategories = data.subcategories || [];
      saveToDisk();
    }
  } catch (err) {
    console.warn("[TaxonomyStore] MySQL read fallback to cached:", (err as Error).message);
  }
  return { categories, subcategories };
};

let brands: Brand[] = [
  { id: 'b-1', name: 'AOCIND', slug: 'aocind', logo: '/images/common/logo.png' },
  { id: 'b-2', name: 'Awesome Handmade', slug: 'awesome-handmade', logo: '/images/common/logo.png' }
];

let collections: string[] = [
  'Navratri Choli Collection',
  'Mirror Latkan Studio',
  'Bridal & Festive Edit',
  'Artisan Gifts & Hampers',
  'Traditional Earrings',
  'Macrame & Wall Hangings'
];

let attributes: Attribute[] = [
  { id: 'attr-1', name: 'Color', type: 'Color', values: ['Maroon', 'Gold', 'Royal Blue', 'Emerald Green', 'Pink', 'Yellow', 'White', 'Black'], isVariant: true },
  { id: 'attr-2', name: 'Size', type: 'Select', values: ['Free Size', 'Kids (2-4 Yrs)', 'Kids (5-8 Yrs)', 'Adult S', 'Adult M', 'Adult L', 'Adult XL'], isVariant: true },
  { id: 'attr-3', name: 'Craft / Material', type: 'Select', values: ['Mirror Work', 'Silk & Zari', 'Pure Cotton', 'Macrame Knotting', 'Kundan & Beads', 'Brass & Metal'], isVariant: false }
];

export const getCategoriesStore = (): Category[] => categories;
export const getSubcategoriesStore = (): Subcategory[] => subcategories;
export const getBrandsStore = (): Brand[] => brands;
export const getCollectionsStore = (): string[] => collections;
export const getAttributesStore = (): Attribute[] => attributes;

export const syncAllCategoriesStore = async (rawList: any[]): Promise<{ categories: Category[]; subcategories: Subcategory[] }> => {
  if (Array.isArray(rawList) && rawList.length > 0) {
    const parents: Category[] = [];
    const subs: Subcategory[] = [];

    rawList.forEach((item) => {
      if (item.type === 'sub' || item.parentId) {
        subs.push({
          id: item.id || `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          categoryId: item.parentId || item.categoryId || '',
          categoryName: item.parentName || item.categoryName || '',
          name: item.name || '',
          slug: item.slug || (item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
          image: item.image || item.imageUrl || '',
          bannerImage: item.bannerImage || '',
          description: item.description || '',
          metaTitle: item.metaTitle || '',
          metaDescription: item.metaDescription || '',
          metaKeywords: item.metaKeywords || '',
          isActive: item.isActive !== false
        } as any);
      } else {
        parents.push({
          id: item.id || `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: item.name || '',
          slug: item.slug || (item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
          image: item.image || item.imageUrl || '/images/category/Latkan.webp',
          bannerImage: item.bannerImage || '',
          description: item.description || '',
          metaTitle: item.metaTitle || '',
          metaDescription: item.metaDescription || '',
          metaKeywords: item.metaKeywords || '',
          productCount: Number(item.productCount) || 0,
          isActive: item.isActive !== false
        } as any);
      }
    });

    categories = parents;
    subcategories = subs;
    saveToDisk();

    // Persist cleanly to MySQL
    await syncAllCategoriesToMySQL(parents, subs);
  }
  return { categories, subcategories };
};

export const createCategoryStore = async (data: Partial<Category>): Promise<Category> => {
  const newCat: Category = {
    id: data.id || `cat-${Date.now()}`,
    name: data.name || 'New Category',
    slug: data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'new-category'),
    image: data.image || (data as any).imageUrl || '/images/category/Latkan.webp',
    bannerImage: (data as any).bannerImage || '',
    description: (data as any).description || '',
    metaTitle: (data as any).metaTitle || '',
    metaDescription: (data as any).metaDescription || '',
    metaKeywords: (data as any).metaKeywords || '',
    productCount: 0,
    isActive: data.isActive !== undefined ? data.isActive : true
  } as any;

  categories.push(newCat);
  saveToDisk();
  await syncCategoryToMySQL(newCat);
  return newCat;
};

export const updateCategoryStore = async (id: string, data: Partial<Category>): Promise<Category | null> => {
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  categories[idx] = { ...categories[idx], ...data };
  saveToDisk();
  await syncCategoryToMySQL(categories[idx]);
  return categories[idx];
};

export const deleteCategoryStore = async (id: string): Promise<boolean> => {
  const initialLen = categories.length;
  categories = categories.filter((c) => c.id !== id);
  subcategories = subcategories.filter((s) => s.categoryId !== id);
  saveToDisk();
  await deleteCategoryFromMySQL(id);
  return categories.length < initialLen;
};

export const createSubcategoryStore = async (data: Partial<Subcategory>): Promise<Subcategory> => {
  const parentCat = categories.find((c) => c.id === (data.categoryId || (data as any).parentId)) || categories[0];
  const newSub: Subcategory = {
    id: data.id || `sub-${Date.now()}`,
    categoryId: parentCat?.id || '',
    categoryName: parentCat?.name || '',
    name: data.name || 'New Subcategory',
    slug: data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'new-subcategory'),
    image: data.image || (data as any).imageUrl || '',
    bannerImage: (data as any).bannerImage || '',
    description: (data as any).description || '',
    metaTitle: (data as any).metaTitle || '',
    metaDescription: (data as any).metaDescription || '',
    metaKeywords: (data as any).metaKeywords || '',
    isActive: (data as any).isActive !== false
  } as any;

  subcategories.push(newSub);
  saveToDisk();
  await syncSubcategoryToMySQL(newSub);
  return newSub;
};

export const updateSubcategoryStore = async (id: string, data: Partial<Subcategory>): Promise<Subcategory | null> => {
  const idx = subcategories.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  subcategories[idx] = { ...subcategories[idx], ...data };
  saveToDisk();
  await syncSubcategoryToMySQL(subcategories[idx]);
  return subcategories[idx];
};

export const deleteSubcategoryStore = async (id: string): Promise<boolean> => {
  const initialLen = subcategories.length;
  subcategories = subcategories.filter((s) => s.id !== id);
  saveToDisk();
  await deleteSubcategoryFromMySQL(id);
  return subcategories.length < initialLen;
};

export const createBrandStore = (data: Partial<Brand>): Brand => {
  const newBrand: Brand = {
    id: `b-${Date.now()}`,
    name: data.name || 'New Brand',
    slug: data.slug || (data.name ? data.name.toLowerCase().replace(/\s+/g, '-') : 'new-brand'),
    logo: data.logo || 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=100'
  };
  brands.push(newBrand);
  return newBrand;
};

export const createAttributeStore = (data: Partial<Attribute>): Attribute => {
  const newAttr: Attribute = {
    id: `attr-${Date.now()}`,
    name: data.name || 'New Attribute',
    type: data.type || 'Select',
    values: data.values || [],
    isVariant: data.isVariant !== undefined ? data.isVariant : true
  };
  attributes.push(newAttr);
  return newAttr;
};

export const addAttributeValueStore = (attrId: string, val: any): Attribute | null => {
  const attr = attributes.find((a) => a.id === attrId);
  if (!attr) return null;
  attr.values.push(val);
  return attr;
};
