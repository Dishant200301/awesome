import { Product, Order, Category, Subcategory, Attribute, Customer, ContactMessage, Brand, Variant, HeroSlide, HomepageBanner } from '../types/admin';
import { idbGet, idbSet } from './idbStorage';

export const MOCK_BRANDS: Brand[] = [
  { id: 'b-1', name: 'AOCIND', slug: 'aocind', logo: '/images/common/logo.png' },
  { id: 'b-2', name: 'Awesome Handmade', slug: 'awesome-handmade', logo: '/images/common/logo.png' }
];

export const MOCK_CATEGORIES: Category[] = [
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

export const MOCK_SUBCATEGORIES: Subcategory[] = [
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

export const MOCK_COLLECTIONS = [
  'Navratri Choli Collection',
  'Mirror Latkan Studio',
  'Bridal & Festive Edit',
  'Artisan Gifts & Hampers',
  'Traditional Earrings',
  'Macrame & Wall Hangings'
];

export const MOCK_TAGS = [
  'Handmade',
  'Traditional',
  'Mirror Work',
  'Festive',
  'Bridal',
  'Gujarati Craft',
  'Cotton Macrame',
  'Artisan Special'
];

export const sanitizeProducts = (list: any[]): Product[] => {
  if (!Array.isArray(list)) return [];
  return list.filter(
    (p) =>
      p &&
      p.name &&
      !p.name.toLowerCase().includes("bralette") &&
      !p.name.toLowerCase().includes("contour seamless bra") &&
      !p.name.toLowerCase().includes("nipple covers")
  );
};

export const MOCK_PRODUCTS: Product[] = [];

// Load products from IndexedDB & LocalStorage on startup
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('awesome_admin_sync') || localStorage.getItem('aaramly_admin_sync');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed.products)) {
        const clean = sanitizeProducts(parsed.products);
        MOCK_PRODUCTS.push(...clean);
      }
    }
  } catch (e) {}

  // Async load from IndexedDB (handles large Base64 images without quota limits)
  idbGet<any>('awesome_admin_sync').then((stored) => {
    if (stored && Array.isArray(stored.products) && stored.products.length > 0) {
      const clean = sanitizeProducts(stored.products);
      MOCK_PRODUCTS.length = 0;
      MOCK_PRODUCTS.push(...clean);
      window.dispatchEvent(new Event('awesome_product_sync'));
      window.dispatchEvent(new Event('aaramly_product_sync'));
    }
  }).catch(() => {});
}

export const getAdminProducts = (): Product[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('awesome_admin_sync') || localStorage.getItem('aaramly_admin_sync');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.products) && parsed.products.length > 0) {
          const clean = sanitizeProducts(parsed.products);
          MOCK_PRODUCTS.length = 0;
          MOCK_PRODUCTS.push(...clean);
        }
      }
    } catch (e) {}
  }
  return MOCK_PRODUCTS;
};

export const getGlobalVariantsList = (): Variant[] => {
  const globalList: Variant[] = [];
  getAdminProducts().forEach((prod) => {
    if (prod.variants && prod.variants.length > 0) {
      prod.variants.forEach((v) => {
        globalList.push({
          ...v,
          parentProductId: prod.id,
          parentProductName: prod.name
        });
      });
    }
  });
  return globalList;
};

const BACKEND_API_URL = `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1')}/products`;

export const fetchProductsFromBackend = async (): Promise<Product[]> => {
  // 1. Sync from IndexedDB first (contains all newly added and edited admin products)
  if (typeof window !== 'undefined') {
    try {
      const stored = await idbGet<any>('awesome_admin_sync');
      if (stored && Array.isArray(stored.products) && stored.products.length > 0) {
        const clean = sanitizeProducts(stored.products);
        clean.forEach((p) => {
          if (!deletedProductIds.has(String(p.id))) {
            const idx = MOCK_PRODUCTS.findIndex((m) => String(m.id) === String(p.id));
            if (idx !== -1) {
              MOCK_PRODUCTS[idx] = p;
            } else {
              MOCK_PRODUCTS.unshift(p);
            }
          }
        });
      }
    } catch (e) {}
  }

  // 2. Fetch from backend API
  try {
    const res = await fetch(`${BACKEND_API_URL}?admin=true`);
    if (res.ok) {
      const json = await res.json();
      const list = json.data || json.items || json.products;
      if (json.success && Array.isArray(list)) {
        const cleanList = sanitizeProducts(list);
        cleanList.forEach((backendProd) => {
          if (!deletedProductIds.has(String(backendProd.id))) {
            const idx = MOCK_PRODUCTS.findIndex((m) => String(m.id) === String(backendProd.id));
            if (idx === -1) {
              MOCK_PRODUCTS.push(backendProd);
            }
          }
        });
      }
    }
  } catch (e) {
    console.warn('[Backend Network API] Unable to fetch live backend products on load:', e);
  }

  // Filter out any deleted products
  const finalProducts = MOCK_PRODUCTS.filter((p) => !deletedProductIds.has(String(p.id)));
  MOCK_PRODUCTS.length = 0;
  MOCK_PRODUCTS.push(...finalProducts);

  if (typeof window !== 'undefined') {
    idbSet('awesome_admin_sync', {
      timestamp: Date.now(),
      products: MOCK_PRODUCTS,
      deletedIds: Array.from(deletedProductIds)
    });
  }

  return MOCK_PRODUCTS;
};

export const syncProductToBackend = async (product: Product, isEdit: boolean = false) => {
  try {
    const url = isEdit ? `${BACKEND_API_URL}/${product.id}` : BACKEND_API_URL;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`[Backend Network API] Product sync successful (${method}):`, data);
    }
  } catch (err) {
    console.warn('[Backend Network API] Express server offline or unreachable:', err);
  }
};

const deletedProductIds = new Set<string>();

if (typeof window !== 'undefined') {
  try {
    const savedDeleted = localStorage.getItem('awesome_deleted_products') || localStorage.getItem('aaramly_deleted_products');
    if (savedDeleted) {
      const parsed = JSON.parse(savedDeleted);
      if (Array.isArray(parsed)) parsed.forEach((id) => deletedProductIds.add(String(id)));
    }
  } catch (e) {}

  idbGet<string[]>('awesome_deleted_products').then((ids) => {
    if (Array.isArray(ids)) {
      ids.forEach((id) => deletedProductIds.add(String(id)));
    }
  }).catch(() => {});
}

export const getDeletedProductIds = (): Set<string> => deletedProductIds;

export const deleteAdminProduct = async (productId: string) => {
  const strId = String(productId);
  deletedProductIds.add(strId);

  const idx = MOCK_PRODUCTS.findIndex((p) => String(p.id) === strId);
  if (idx !== -1) {
    MOCK_PRODUCTS.splice(idx, 1);
  }

  idbSet('awesome_deleted_products', Array.from(deletedProductIds));
  try {
    localStorage.setItem('awesome_deleted_products', JSON.stringify(Array.from(deletedProductIds)));
  } catch (e) {}

  try {
    await fetch(`${BACKEND_API_URL}/${productId}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('[Backend Network API] Delete failed on Express backend:', e);
  }

  broadcastAdminProductChange();
};

// Real-Time Cross-Tab / API Sync Trigger for Client Website
export const broadcastAdminProductChange = (updatedProduct?: Product) => {
  if (updatedProduct) {
    const existingIdx = MOCK_PRODUCTS.findIndex((p) => p.id === updatedProduct.id);
    if (existingIdx !== -1) {
      MOCK_PRODUCTS[existingIdx] = updatedProduct;
      syncProductToBackend(updatedProduct, true);
    } else {
      MOCK_PRODUCTS.unshift(updatedProduct);
      syncProductToBackend(updatedProduct, false);
    }
  }

  // 1. Save to IndexedDB (unlimited storage for base64 images)
  idbSet('awesome_admin_sync', {
    timestamp: Date.now(),
    products: MOCK_PRODUCTS,
    deletedIds: Array.from(deletedProductIds)
  });

  // 2. BroadcastChannel
  try {
    const channel = new BroadcastChannel('awesome_product_sync');
    channel.postMessage({
      type: 'PRODUCT_UPDATED',
      timestamp: Date.now(),
      product: updatedProduct,
      products: MOCK_PRODUCTS,
      deletedIds: Array.from(deletedProductIds)
    });
    channel.close();
  } catch (e) {}

  try {
    const legacyChannel = new BroadcastChannel('aaramly_product_sync');
    legacyChannel.postMessage({
      type: 'PRODUCT_UPDATED',
      timestamp: Date.now(),
      product: updatedProduct,
      products: MOCK_PRODUCTS,
      deletedIds: Array.from(deletedProductIds)
    });
    legacyChannel.close();
  } catch (e) {}

  // 3. LocalStorage & Window Events
  try {
    localStorage.setItem('awesome_admin_sync', JSON.stringify({
      timestamp: Date.now(),
      products: MOCK_PRODUCTS,
      deletedIds: Array.from(deletedProductIds)
    }));
  } catch (e) {
    console.warn('LocalStorage write failed (quota exceeded, using IndexedDB fallback).');
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('awesome_product_sync'));
    window.dispatchEvent(new Event('aaramly_product_sync'));
  }
};

export const MOCK_CONTACT_MESSAGES: ContactMessage[] = [];

if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('awesome_contact_sync') || localStorage.getItem('aaramly_contact_sync');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
        const existingIds = new Set(MOCK_CONTACT_MESSAGES.map((m) => m.id));
        parsed.messages.forEach((msg: ContactMessage) => {
          if (!existingIds.has(msg.id)) {
            MOCK_CONTACT_MESSAGES.unshift(msg);
          }
        });
      }
    }
  } catch (e) {}
}

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: '#AOC-98214',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@example.com',
    date: '2026-07-30 14:20',
    totalAmount: 1897,
    status: 'PAID',
    paymentGateway: 'Razorpay',
    itemsCount: 2,
    items: [
      { id: 'item-1', productName: "Handcrafted Royal Mirror Latkan Pair", variantSku: 'AOC-LAT-MR-RED', price: 799, quantity: 2, image: '/images/category/Latkan.webp' },
      { id: 'item-2', productName: 'Navratri Designer Mirror Choli', variantSku: 'AOC-CHO-NAV-FREE', price: 1099, quantity: 1, image: '/images/category/Choli.webp' }
    ]
  }
];

export const MOCK_ATTRIBUTES: Attribute[] = [
  {
    id: 'attr-1',
    name: 'Color',
    displayType: 'swatch',
    values: [
      { id: 'val-1', value: 'Maroon', hexCode: '#800000' },
      { id: 'val-2', value: 'Gold', hexCode: '#D4AF37' },
      { id: 'val-3', value: 'Royal Blue', hexCode: '#4169E1' },
      { id: 'val-4', value: 'Emerald Green', hexCode: '#50C878' },
      { id: 'val-5', value: 'Pink', hexCode: '#FF69B4' },
      { id: 'val-6', value: 'Yellow', hexCode: '#FFD700' }
    ]
  },
  {
    id: 'attr-2',
    name: 'Size / Type',
    displayType: 'button',
    values: [
      { id: 'val-7', value: 'Free Size' },
      { id: 'val-8', value: 'Kids (2-4 Yrs)' },
      { id: 'val-9', value: 'Kids (5-8 Yrs)' },
      { id: 'val-10', value: 'Adult S' },
      { id: 'val-11', value: 'Adult M' },
      { id: 'val-12', value: 'Adult L' }
    ]
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '+91 98765 43210', ordersCount: 4, totalSpent: 4890, status: 'Active', joinedDate: '2026-01-15' }
];

export const getAdminCategoriesAndSubcategories = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('awesome_categories') || localStorage.getItem('aocind_categories') || localStorage.getItem('aaramly_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate if saved categories are the old Aaramly intimates categories, and if so discard them
        const hasOldCategories = Array.isArray(parsed) && parsed.some((c: any) => 
          ['Bralettes', 'Everyday Bras', 'Seamless Panties', 'Shapewear', 'bralettes'].includes(c.name || c.slug)
        );
        if (!hasOldCategories && Array.isArray(parsed) && parsed.length > 0) {
          const mainCats = parsed.filter((c: any) => c.type !== 'sub' && (c.isActive ?? true));
          const subCats = parsed.filter((c: any) => c.type === 'sub' && (c.isActive ?? true));
          return { mainCategories: mainCats, subcategories: subCats };
        } else if (hasOldCategories) {
          // Clear legacy intimates data
          localStorage.removeItem('aaramly_categories');
          localStorage.removeItem('aocind_categories');
          localStorage.removeItem('awesome_categories');
        }
      }
    } catch (e) {}
  }
  const mainCats = MOCK_CATEGORIES.map((c) => ({ ...c, type: 'parent' }));
  const subCats = MOCK_SUBCATEGORIES.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    type: 'sub',
    parentId: s.categoryId,
    parentName: s.categoryName
  }));
  return { mainCategories: mainCats, subcategories: subCats };
};

export const MOCK_HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    tag: "Grace in Every",
    title: "Thread",
    subtitle: "Timeless ethnic wear crafted with love, precision and elegance.",
    image: "/images/home/hero/hero-1.webp",
    mobileImage: "/images/home/hero/mobile-1.webp",
    buttonText: "Shop Collection",
    link: "#categories",
    theme: "gold",
    align: "left",
    status: "Active",
    sortOrder: 1
  },
  {
    id: "slide-2",
    tag: "Artisan Special",
    title: "Twirl Into Tradition",
    subtitle: "Heritage crafted for every celebration.",
    image: "/images/home/hero/hero-2.webp",
    mobileImage: "/images/home/hero/mobile-2.webp",
    buttonText: "Shop Collection",
    link: "#categories",
    theme: "gold",
    align: "left",
    status: "Active",
    sortOrder: 2
  },
  {
    id: "slide-3",
    tag: "HANDCRAFTED JEWELLERY",
    title: "Threads of Tradition",
    subtitle: "A celebration of colour, craft and culture.",
    image: "/images/home/hero/hero-3.webp",
    mobileImage: "/images/home/hero/mobile-3.webp",
    buttonText: "Shop Collection",
    link: "#categories",
    theme: "maroon",
    align: "left",
    status: "Active",
    sortOrder: 3
  },
  {
    id: "slide-4",
    tag: "COMFORT • STYLE • TRADITION",
    title: "Kids CHOLI",
    subtitle: "Soft fabric, elegant design, made with love.",
    image: "/images/home/hero/hero-4.webp",
    mobileImage: "/images/home/hero/mobile-4.webp",
    buttonText: "Shop Collection",
    link: "#categories",
    theme: "purple",
    align: "left",
    status: "Active",
    sortOrder: 4
  },
  {
    id: "slide-5",
    tag: "Kids Choli Collection",
    title: "TWIRL IN TRADITION",
    subtitle: "Little styles made for joyful celebrations",
    image: "/images/home/hero/hero-5.webp",
    mobileImage: "/images/home/hero/mobile-5.webp",
    buttonText: "Shop Collection",
    link: "#categories",
    theme: "purple",
    align: "left",
    status: "Active",
    sortOrder: 5
  }
];

export const MOCK_PROMO_BANNER: HomepageBanner = {
  id: "promo-banner-main",
  title: "Handmade Necklace",
  subtitle: "Crafted with colour, culture & love.",
  image: "/images/banner/banner.webp",
  mobileImage: "/images/banner/mobile-banner.webp",
  badge: "Festive Collection",
  buttonText: "SHOP NOW",
  link: "/shop?category=Necklace",
  gridPosition: "Main Promo Banner",
  showTextOverlay: true,
  status: "Active"
};
