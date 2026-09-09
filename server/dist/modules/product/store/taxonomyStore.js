import { syncCategoryToMySQL, syncSubcategoryToMySQL, deleteCategoryFromMySQL, deleteSubcategoryFromMySQL, syncAllCategoriesToMySQL, fetchCategoriesFromMySQL } from "../../../database/mysqlSync.js";
// Initial Taxonomy Seed Data (12 Master Categories)
const DEFAULT_CATEGORIES = [
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
const DEFAULT_SUBCATEGORIES = [
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
    { id: 'sub-15', categoryId: 'cat-8', categoryName: 'Watch', name: 'Kids Watch', slug: 'kids-watch' }
];
let categories = [];
let subcategories = [];
export const refreshTaxonomiesFromMySQL = async () => {
    try {
        const data = await fetchCategoriesFromMySQL();
        if (data && Array.isArray(data.categories)) {
            categories = data.categories;
            subcategories = data.subcategories || [];
        }
    }
    catch (err) {
        console.warn("[TaxonomyStore] MySQL read error:", err.message);
    }
    return { categories, subcategories };
};
// Initial load on server startup
refreshTaxonomiesFromMySQL();
let brands = [
    { id: 'b-1', name: 'Awesome Handmade', slug: 'awesome-handmade', logo: '/images/common/logo.png' }
];
let collections = [
    'Navratri Choli Collection',
    'Mirror Latkan Studio',
    'Bridal & Festive Edit',
    'Artisan Gifts & Hampers',
    'Traditional Earrings'
];
let attributes = [
    { id: 'attr-1', name: 'Color', type: 'Color', values: ['Maroon', 'Gold', 'Royal Blue', 'Emerald Green', 'Pink', 'Yellow', 'White', 'Black'], isVariant: true },
    { id: 'attr-2', name: 'Size', type: 'Select', values: ['Free Size', 'Kids (2-4 Yrs)', 'Kids (5-8 Yrs)', 'Adult S', 'Adult M', 'Adult L', 'Adult XL'], isVariant: true },
    { id: 'attr-3', name: 'Craft / Material', type: 'Select', values: ['Mirror Work', 'Silk & Zari', 'Pure Cotton', 'Macrame Knotting', 'Kundan & Beads'], isVariant: false }
];
export const getCategoriesStore = () => categories;
export const getSubcategoriesStore = () => subcategories;
export const getBrandsStore = () => brands;
export const getCollectionsStore = () => collections;
export const getAttributesStore = () => attributes;
export const syncAllCategoriesStore = async (rawList) => {
    if (Array.isArray(rawList) && rawList.length > 0) {
        const parents = [];
        const subs = [];
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
                });
            }
            else {
                parents.push({
                    id: item.id || `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                    name: item.name || '',
                    slug: item.slug || (item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
                    image: item.image || item.imageUrl || '',
                    bannerImage: item.bannerImage || '',
                    description: item.description || '',
                    metaTitle: item.metaTitle || '',
                    metaDescription: item.metaDescription || '',
                    metaKeywords: item.metaKeywords || '',
                    productCount: Number(item.productCount) || 0,
                    isActive: item.isActive !== false
                });
            }
        });
        // Persist cleanly directly to MySQL
        await syncAllCategoriesToMySQL(parents, subs);
        await refreshTaxonomiesFromMySQL();
    }
    return { categories, subcategories };
};
export const createCategoryStore = async (data) => {
    const newCat = {
        id: data.id || `cat-${Date.now()}`,
        name: data.name || 'New Category',
        slug: data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'new-category'),
        image: data.image || data.imageUrl || '',
        bannerImage: data.bannerImage || '',
        description: data.description || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        metaKeywords: data.metaKeywords || '',
        productCount: 0,
        isActive: data.isActive !== undefined ? data.isActive : true
    };
    await syncCategoryToMySQL(newCat);
    await refreshTaxonomiesFromMySQL();
    return newCat;
};
export const updateCategoryStore = async (id, data) => {
    const existing = categories.find((c) => c.id === id);
    const merged = { ...(existing || { id }), ...data };
    await syncCategoryToMySQL(merged);
    await refreshTaxonomiesFromMySQL();
    return categories.find((c) => c.id === id) || merged;
};
export const deleteCategoryStore = async (id) => {
    await deleteCategoryFromMySQL(id);
    await refreshTaxonomiesFromMySQL();
    return true;
};
export const createSubcategoryStore = async (data) => {
    const parentCat = categories.find((c) => c.id === (data.categoryId || data.parentId)) || categories[0];
    const newSub = {
        id: data.id || `sub-${Date.now()}`,
        categoryId: parentCat?.id || '',
        categoryName: parentCat?.name || '',
        name: data.name || 'New Subcategory',
        slug: data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'new-subcategory'),
        image: data.image || data.imageUrl || '',
        bannerImage: data.bannerImage || '',
        description: data.description || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        metaKeywords: data.metaKeywords || '',
        isActive: data.isActive !== undefined ? data.isActive : true
    };
    await syncSubcategoryToMySQL(newSub);
    await refreshTaxonomiesFromMySQL();
    return newSub;
};
export const updateSubcategoryStore = async (id, data) => {
    const existing = subcategories.find((s) => s.id === id);
    const merged = { ...(existing || { id }), ...data };
    await syncSubcategoryToMySQL(merged);
    await refreshTaxonomiesFromMySQL();
    return subcategories.find((s) => s.id === id) || merged;
};
export const deleteSubcategoryStore = async (id) => {
    await deleteSubcategoryFromMySQL(id);
    await refreshTaxonomiesFromMySQL();
    return true;
};
export const createBrandStore = (data) => {
    const newBrand = {
        id: `b-${Date.now()}`,
        name: data.name || 'New Brand',
        slug: data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'new-brand'),
        logo: data.logo || '/images/common/logo.png',
        isActive: true
    };
    brands.push(newBrand);
    return newBrand;
};
export const createAttributeStore = (data) => {
    const newAttr = {
        id: `attr-${Date.now()}`,
        name: data.name || 'New Attribute',
        type: data.type || 'Select',
        values: data.values || [],
        isVariant: data.isVariant !== undefined ? data.isVariant : false
    };
    attributes.push(newAttr);
    return newAttr;
};
export const addAttributeValueStore = (attributeId, value) => {
    const attr = attributes.find((a) => a.id === attributeId);
    if (!attr)
        return null;
    if (!attr.values.includes(value)) {
        attr.values.push(value);
    }
    return attr;
};
