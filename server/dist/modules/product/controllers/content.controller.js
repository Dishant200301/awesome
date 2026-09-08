import { getHeroSlidesStore, syncHeroSlidesStore, createHeroSlideStore, updateHeroSlideStore, deleteHeroSlideStore, getHomepageBannersStore, getPromoBannerStore, updatePromoBannerStore, syncPromoBannersStore, getContentPagesStore, getStoreSettingsStore, updateStoreSettingsStore } from "../store/contentStore.js";
import { fetchHeroSlidesFromMySQL, fetchPromoBannerFromMySQL } from "../../../database/mysqlSync.js";
const setNoCache = (res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
};
// HERO SLIDES
export const getHeroSlides = async (_req, res) => {
    setNoCache(res);
    try {
        const mysqlSlides = await fetchHeroSlidesFromMySQL();
        if (mysqlSlides && mysqlSlides.length > 0) {
            res.json({ success: true, data: mysqlSlides });
            return;
        }
        const slides = await getHeroSlidesStore();
        res.json({ success: true, data: slides });
    }
    catch {
        res.json({ success: true, data: await getHeroSlidesStore() });
    }
};
export const syncHeroSlides = async (req, res) => {
    setNoCache(res);
    const slides = req.body.slides || req.body;
    const list = Array.isArray(slides) ? slides : [];
    const result = await syncHeroSlidesStore(list);
    res.json({ success: true, message: "Hero slides synchronized successfully with database", data: result });
};
export const createHeroSlide = async (req, res) => {
    setNoCache(res);
    const slide = await createHeroSlideStore(req.body);
    res.status(201).json({ success: true, data: slide });
};
export const updateHeroSlide = async (req, res) => {
    setNoCache(res);
    const { id } = req.params;
    const updated = await updateHeroSlideStore(id, req.body);
    if (!updated) {
        return res.status(404).json({ success: false, message: "Slide not found" });
    }
    res.json({ success: true, data: updated });
};
export const deleteHeroSlide = async (req, res) => {
    setNoCache(res);
    const { id } = req.params;
    const deleted = await deleteHeroSlideStore(id);
    res.json({ success: deleted, message: deleted ? "Slide deleted" : "Slide not found" });
};
// PROMO BANNERS
export const getPromoBanner = async (_req, res) => {
    setNoCache(res);
    try {
        const mysqlBanner = await fetchPromoBannerFromMySQL();
        if (mysqlBanner) {
            res.json({ success: true, data: mysqlBanner });
            return;
        }
        const banner = await getPromoBannerStore();
        res.json({ success: true, data: banner });
    }
    catch {
        res.json({ success: true, data: await getPromoBannerStore() });
    }
};
export const updatePromoBanner = async (req, res) => {
    setNoCache(res);
    const banner = await updatePromoBannerStore(req.body);
    res.json({ success: true, message: "Promo banner updated in database", data: banner });
};
export const getHomepageBanners = async (_req, res) => {
    setNoCache(res);
    res.json({ success: true, data: await getHomepageBannersStore() });
};
export const syncHomepageBanners = async (req, res) => {
    setNoCache(res);
    const banners = req.body.banners || req.body;
    const result = await syncPromoBannersStore(Array.isArray(banners) ? banners : []);
    res.json({ success: true, message: "Banners synchronized successfully", data: result });
};
// OTHER CONTENT
export const getContentPages = (_req, res) => {
    setNoCache(res);
    res.json({ success: true, data: getContentPagesStore() });
};
export const getStoreSettings = (_req, res) => {
    setNoCache(res);
    res.json({ success: true, data: getStoreSettingsStore() });
};
export const updateStoreSettings = (req, res) => {
    setNoCache(res);
    const settings = updateStoreSettingsStore(req.body);
    res.json({ success: true, data: settings });
};
