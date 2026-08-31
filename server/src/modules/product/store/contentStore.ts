import fs from "fs";
import path from "path";
import { HeroSlide, HomepageBanner, ContentPageItem, BlogPost, FaqItem, StoreSettings } from "../../../types/admin.js";

const DB_FILE_PATH = path.join(process.cwd(), "content_db.json");

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
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

const DEFAULT_PROMO_BANNER: HomepageBanner = {
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

let heroSlides: HeroSlide[] = [...DEFAULT_HERO_SLIDES];
let homepageBanners: HomepageBanner[] = [DEFAULT_PROMO_BANNER];
let contentPages: ContentPageItem[] = [
  {
    id: "page-1",
    title: "About Awesome Handmade",
    slug: "about-us",
    content: "Awesome Handmade is India's premier artisanal handcrafted fashion and accessories brand crafted with love and authentic craftsmanship in Surat, Gujarat.",
    metaTitle: "About Us - Awesome Handmade",
    metaDescription: "Learn about Awesome Handmade's story, artisan roots, and authentic handcrafting.",
    status: "Published",
    updatedAt: "2026-08-01"
  }
];
let blogPosts: BlogPost[] = [];
let faqItems: FaqItem[] = [];
let storeSettings: StoreSettings = {
  storeName: "Awesome Handmade",
  storeLogo: "/images/common/logo.png",
  email: "care@awesomehandmade.com",
  phone: "+91 98243 02072",
  address: "Surat, Gujarat, India",
  currency: "₹ (INR)",
  taxRate: 18,
  shippingFee: 99,
  freeShippingThreshold: 999,
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  twitterUrl: "https://twitter.com",
  metaTitle: "Awesome Handmade - Indian Craft & Latkans",
  metaDescription: "Shop authentic handcrafted Indian latkans, Navratri cholis, jewellery, and decor."
};

const loadFromDisk = () => {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.heroSlides) && parsed.heroSlides.length > 0) {
        heroSlides = parsed.heroSlides;
      }
      if (parsed && Array.isArray(parsed.homepageBanners) && parsed.homepageBanners.length > 0) {
        homepageBanners = parsed.homepageBanners;
      }
      if (parsed && Array.isArray(parsed.contentPages)) {
        contentPages = parsed.contentPages;
      }
    }
  } catch (e) {
    console.warn("[ContentStore] Could not read content_db.json, using defaults.");
  }
};

const saveToDisk = () => {
  try {
    fs.writeFileSync(
      DB_FILE_PATH,
      JSON.stringify({ heroSlides, homepageBanners, contentPages, blogPosts, faqItems, storeSettings }, null, 2),
      "utf-8"
    );
  } catch (e) {
    console.error("[ContentStore] Failed to write content_db.json:", e);
  }
};

loadFromDisk();

// HERO SLIDES CRUD
export const getHeroSlidesStore = (): HeroSlide[] => heroSlides;

export const syncHeroSlidesStore = (slides: HeroSlide[]): HeroSlide[] => {
  if (Array.isArray(slides)) {
    heroSlides = slides.map((s, index) => ({
      id: s.id || `slide-${Date.now()}-${index}`,
      tag: s.tag || "",
      title: s.title || "New Slide",
      subtitle: s.subtitle || "",
      image: s.image || "/images/home/hero/hero-1.webp",
      mobileImage: s.mobileImage || s.image || "/images/home/hero/mobile-1.webp",
      buttonText: s.buttonText || "Shop Collection",
      link: s.link || "#categories",
      theme: s.theme || "gold",
      align: s.align || "left",
      status: s.status || "Active",
      sortOrder: Number(s.sortOrder) || index + 1
    }));
    saveToDisk();
  }
  return heroSlides;
};

export const createHeroSlideStore = (data: Partial<HeroSlide>): HeroSlide => {
  const newSlide: HeroSlide = {
    id: data.id || `slide-${Date.now()}`,
    tag: data.tag || "",
    title: data.title || "Handcrafted Heritage",
    subtitle: data.subtitle || "Authentic Indian artisan craft",
    image: data.image || "/images/home/hero/hero-1.webp",
    mobileImage: data.mobileImage || data.image || "/images/home/hero/mobile-1.webp",
    buttonText: data.buttonText || "Shop Collection",
    link: data.link || "#categories",
    theme: data.theme || "gold",
    align: data.align || "left",
    status: data.status || "Active",
    sortOrder: heroSlides.length + 1
  };
  heroSlides.push(newSlide);
  saveToDisk();
  return newSlide;
};

export const updateHeroSlideStore = (id: string, data: Partial<HeroSlide>): HeroSlide | null => {
  const idx = heroSlides.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  heroSlides[idx] = { ...heroSlides[idx], ...data };
  saveToDisk();
  return heroSlides[idx];
};

export const deleteHeroSlideStore = (id: string): boolean => {
  const initialLen = heroSlides.length;
  heroSlides = heroSlides.filter((s) => s.id !== id);
  saveToDisk();
  return heroSlides.length < initialLen;
};

// HOMEPAGE & PROMO BANNERS CRUD
export const getHomepageBannersStore = (): HomepageBanner[] => homepageBanners;

export const getPromoBannerStore = (): HomepageBanner => {
  return homepageBanners[0] || DEFAULT_PROMO_BANNER;
};

export const syncPromoBannersStore = (banners: HomepageBanner[]): HomepageBanner[] => {
  if (Array.isArray(banners)) {
    homepageBanners = banners;
    saveToDisk();
  }
  return homepageBanners;
};

export const updatePromoBannerStore = (data: Partial<HomepageBanner>): HomepageBanner => {
  const current = homepageBanners[0] || DEFAULT_PROMO_BANNER;
  const updated: HomepageBanner = {
    ...current,
    ...data,
    id: current.id || "promo-banner-main"
  };
  homepageBanners[0] = updated;
  saveToDisk();
  return updated;
};

export const getContentPagesStore = () => contentPages;
export const getBlogPostsStore = () => blogPosts;
export const getFaqItemsStore = () => faqItems;
export const getStoreSettingsStore = () => storeSettings;

export const updateStoreSettingsStore = (settings: Partial<StoreSettings>) => {
  storeSettings = { ...storeSettings, ...settings };
  saveToDisk();
  return storeSettings;
};
