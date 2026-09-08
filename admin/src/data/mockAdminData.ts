import { Product, Order, Category, Subcategory, Attribute, Customer, ContactMessage, Brand, Variant, HeroSlide, HomepageBanner } from '../types/admin';
import { getAdminApiBase, getAdminAuthHeaders } from '../utils/authHeaders';

export const MOCK_BRANDS: Brand[] = [];
export const MOCK_CATEGORIES: Category[] = [];
export const MOCK_SUBCATEGORIES: Subcategory[] = [];
export const MOCK_COLLECTIONS: string[] = [];
export const MOCK_TAGS: string[] = [];


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

const STORAGE_KEY = 'awesome_admin_products';

export const loadStoredProducts = (): Product[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeProducts(parsed);
        }
      }
    }
  } catch (e) {}
  return [];
};

export const saveStoredProducts = (list: Product[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch (e) {}
};

export const MOCK_PRODUCTS: Product[] = loadStoredProducts();

export const getAdminProducts = (): Product[] => {
  if (MOCK_PRODUCTS.length === 0) {
    const fromStorage = loadStoredProducts();
    if (fromStorage.length > 0) {
      MOCK_PRODUCTS.push(...fromStorage);
    }
  }
  return MOCK_PRODUCTS;
};

export const getGlobalVariantsList = (): Variant[] => {
  const globalList: Variant[] = [];
  getAdminProducts().forEach((prod: any) => {
    if (prod.variants && Array.isArray(prod.variants) && prod.variants.length > 0) {
      prod.variants.forEach((v: any) => {
        globalList.push({
          ...v,
          parentProductId: prod.id,
          parentProductName: prod.name
        });
      });
    } else if (prod.colorVariants && Array.isArray(prod.colorVariants) && prod.colorVariants.length > 0) {
      prod.colorVariants.forEach((cv: any, idx: number) => {
        globalList.push({
          id: `${prod.id}-col-${idx}`,
          color: cv.color,
          colorHex: cv.colorCode || cv.colorHex || '#000000',
          size: 'Standard',
          sku: `${prod.sku || prod.defaultSku || 'SKU'}-${(cv.color || 'COL').toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
          price: prod.price || 0,
          originalPrice: prod.originalPrice || prod.regularPrice || prod.price || 0,
          stock: prod.stock || 0,
          image: cv.defaultImage || (cv.images && cv.images[0]) || prod.mainImage || prod.image,
          parentProductId: prod.id,
          parentProductName: prod.name
        });
      });
    }
  });
  return globalList;
};

const BACKEND_API_URL = `${getAdminApiBase()}/products`;

export const fetchProductsFromBackend = async (): Promise<Product[]> => {
  try {
    const res = await fetch(`${BACKEND_API_URL}?admin=true`, {
      cache: 'no-store',
      headers: getAdminAuthHeaders()
    });
    if (res.ok) {
      const json = await res.json();
      const list = json.data?.items || json.data || json.items || json.products;
      if (Array.isArray(list)) {
        const cleanList = sanitizeProducts(list);
        MOCK_PRODUCTS.length = 0;
        MOCK_PRODUCTS.push(...cleanList);
        return MOCK_PRODUCTS;
      }
    }
  } catch (e) {
    console.warn('[Backend Network API] Unable to fetch live backend products on load:', e);
  }

  return MOCK_PRODUCTS;
};

export const syncProductToBackend = async (product: Product, isEdit: boolean = false) => {
  try {
    const url = isEdit ? `${BACKEND_API_URL}/${product.id}` : BACKEND_API_URL;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: getAdminAuthHeaders(),
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

export const getDeletedProductIds = (): Set<string> => deletedProductIds;

export const deleteAdminProduct = async (productId: string) => {
  const strId = String(productId);
  deletedProductIds.add(strId);

  const idx = MOCK_PRODUCTS.findIndex((p) => String(p.id) === strId);
  if (idx !== -1) {
    MOCK_PRODUCTS.splice(idx, 1);
  }

  try {
    await fetch(`${BACKEND_API_URL}/${productId}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders()
    });
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
    saveStoredProducts(MOCK_PRODUCTS);
  }

  // 1. BroadcastChannel
  try {
    const channel = new BroadcastChannel('awesome_product_sync');
    channel.postMessage({
      type: 'PRODUCT_UPDATED',
      timestamp: Date.now(),
      product: updatedProduct
    });
    channel.close();
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('awesome_product_sync'));
  }
};

export const MOCK_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: 'cm-101',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98251 34098',
    subject: 'Custom Bridal Choli Enquiry',
    message: 'Hi Awesome Handmade team, I love your handcrafted Navratri collection! Can you customize the mirror work on the royal blue Choli with gold Latkans for my wedding function next month?',
    status: 'New',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'cm-102',
    name: 'Ananya Patel',
    email: 'ananya.patel@gmail.com',
    phone: '+91 94260 88123',
    subject: 'Bulk Order for Wedding Tassels & Latkans',
    message: 'Hello! We are looking to order around 50 pairs of Handcrafted Royal Mirror Latkans as wedding favors for our sangeet ceremony. Is there a bulk discount available?',
    status: 'New',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'cm-103',
    name: 'Neha Mehta',
    email: 'neha.mehta@yahoo.com',
    phone: '+91 97245 11980',
    subject: 'Delivery Timeline to Ahmedabad',
    message: 'I want to place an order for the handmade necklace set and latkan pair. Could you please confirm if express delivery to Ahmedabad within 3 days is possible?',
    status: 'Read',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'cm-104',
    name: 'Ritu Verma',
    email: 'ritu.verma@outlook.com',
    phone: '+91 99099 44321',
    subject: 'Matching Accessories for Choli Set',
    message: 'Thank you for the quick shipping! Just wanted to ask if you have matching hair accessories or tassels available for the maroon designer choli?',
    status: 'Replied',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    replyText: 'Hi Ritu, yes! We have matching hair tassels and latkans in maroon velvet and mirror work. We have sent the catalog to your email.'
  }
];

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
  const mainCats = MOCK_CATEGORIES.map((c) => ({ ...c, type: 'parent' as const }));
  const subCats = MOCK_SUBCATEGORIES.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    type: 'sub' as const,
    parentId: s.categoryId,
    parentName: s.categoryName,
    categoryId: s.categoryId,
    categoryName: s.categoryName
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
    link: "/shop?category=Choli",
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
    link: "/shop?category=Latkan",
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
    link: "/shop?category=Necklace",
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
    link: "/shop?category=Choli&sub=Kids%20Choli",
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
    link: "/shop?category=Choli&sub=Kids%20Choli",
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
