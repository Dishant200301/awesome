import { fetchHeroSlidesFromMySQL, syncHeroSlidesToMySQL, fetchPromoBannerFromMySQL, syncPromoBannerToMySQL } from "../../../database/mysqlSync.js";
let heroSlides = [];
const DEFAULT_PROMO_BANNER = {
    id: "promo-banner-main",
    image: "/images/home/hero/hero-2.webp",
    link: "/shop?category=Latkan",
    status: "Active",
    tagline: "Limited Time Festive Offer",
    title: "Special Festive Collection",
    subtitle: "Up to 30% off on authentic handcrafted mirror latkans and jewellery.",
    badgeText: "Festive Special",
    buttonText: "Explore Collection",
    buttonLink: "/shop?category=Latkan",
    imageUrl: "/images/home/hero/hero-2.webp",
    mobileImageUrl: "/images/home/hero/mobile-2.webp",
    bgColor: "#7A1C2E",
    isActive: true
};
let homepageBanners = [{ ...DEFAULT_PROMO_BANNER }];
let contentPages = [];
let blogPosts = [];
let faqItems = [];
let storeSettings = {
    storeName: "Awesome Handmade",
    supportEmail: "contact@awesomehandwork.com",
    supportPhone: "+91 98765 43210",
    address: "Surat, Gujarat, India",
    currency: "INR",
    currencySymbol: "₹",
    freeShippingThreshold: 999,
    flatShippingRate: 49,
    enableCod: true,
    enableReviews: true,
    autoApproveReviews: false,
    maintenanceMode: false
};
// Initial sync from MySQL on startup
export const refreshContentFromMySQL = async () => {
    try {
        const slidesFromDb = await fetchHeroSlidesFromMySQL();
        if (Array.isArray(slidesFromDb) && slidesFromDb.length > 0) {
            heroSlides = slidesFromDb;
        }
        const promoFromDb = await fetchPromoBannerFromMySQL();
        if (promoFromDb) {
            homepageBanners = [promoFromDb];
        }
    }
    catch (err) {
        console.warn("[ContentStore] MySQL content refresh warning:", err.message);
    }
};
refreshContentFromMySQL();
// HERO SLIDES CRUD (Direct MySQL)
export const getHeroSlidesStore = async () => {
    try {
        const slides = await fetchHeroSlidesFromMySQL();
        if (Array.isArray(slides) && slides.length > 0) {
            heroSlides = slides;
        }
    }
    catch { }
    return heroSlides;
};
export const syncHeroSlidesStore = async (slides) => {
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
        await syncHeroSlidesToMySQL(heroSlides);
    }
    return heroSlides;
};
export const createHeroSlideStore = async (data) => {
    const newSlide = {
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
    await syncHeroSlidesToMySQL(heroSlides);
    return newSlide;
};
export const updateHeroSlideStore = async (id, data) => {
    const idx = heroSlides.findIndex((s) => s.id === id);
    if (idx === -1)
        return null;
    heroSlides[idx] = { ...heroSlides[idx], ...data };
    await syncHeroSlidesToMySQL(heroSlides);
    return heroSlides[idx];
};
export const deleteHeroSlideStore = async (id) => {
    const initialLen = heroSlides.length;
    heroSlides = heroSlides.filter((s) => s.id !== id);
    if (heroSlides.length < initialLen) {
        await syncHeroSlidesToMySQL(heroSlides);
        return true;
    }
    return false;
};
// HOMEPAGE & PROMO BANNERS CRUD (Direct MySQL)
export const getHomepageBannersStore = async () => {
    try {
        const promo = await fetchPromoBannerFromMySQL();
        if (promo)
            homepageBanners = [promo];
    }
    catch { }
    return homepageBanners;
};
export const getPromoBannerStore = async () => {
    try {
        const promo = await fetchPromoBannerFromMySQL();
        if (promo)
            return promo;
    }
    catch { }
    return homepageBanners[0] || DEFAULT_PROMO_BANNER;
};
export const syncPromoBannersStore = async (banners) => {
    if (Array.isArray(banners) && banners.length > 0) {
        homepageBanners = banners;
        await syncPromoBannerToMySQL(banners[0]);
    }
    return homepageBanners;
};
export const updatePromoBannerStore = async (data) => {
    const current = homepageBanners[0] || DEFAULT_PROMO_BANNER;
    const updated = {
        ...current,
        ...data,
        id: current.id || "promo-banner-main"
    };
    homepageBanners[0] = updated;
    await syncPromoBannerToMySQL(updated);
    return updated;
};
export const getContentPagesStore = () => contentPages;
export const getBlogPostsStore = () => blogPosts;
export const getFaqItemsStore = () => faqItems;
export const getStoreSettingsStore = () => storeSettings;
export const updateStoreSettingsStore = (settings) => {
    storeSettings = { ...storeSettings, ...settings };
    return storeSettings;
};
