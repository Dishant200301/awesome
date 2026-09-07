import { Request, Response } from "express";
import {
  getHeroSlidesStore,
  syncHeroSlidesStore,
  createHeroSlideStore,
  updateHeroSlideStore,
  deleteHeroSlideStore,
  getHomepageBannersStore,
  getPromoBannerStore,
  updatePromoBannerStore,
  syncPromoBannersStore,
  getContentPagesStore,
  getBlogPostsStore,
  getFaqItemsStore,
  getStoreSettingsStore,
  updateStoreSettingsStore
} from "../store/contentStore.js";
import {
  fetchHeroSlidesFromMySQL,
  syncHeroSlidesToMySQL,
  fetchPromoBannerFromMySQL,
  syncPromoBannerToMySQL
} from "../../../database/mysqlSync.js";

const setNoCache = (res: Response) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
};

// HERO SLIDES
export const getHeroSlides = async (_req: Request, res: Response) => {
  setNoCache(res);
  try {
    const mysqlSlides = await fetchHeroSlidesFromMySQL();
    if (mysqlSlides && mysqlSlides.length > 0) {
      res.json({ success: true, data: mysqlSlides });
      return;
    }
    const slides = getHeroSlidesStore();
    // Auto-seed to MySQL if empty
    syncHeroSlidesToMySQL(slides).catch(() => {});
    res.json({ success: true, data: slides });
  } catch {
    res.json({ success: true, data: getHeroSlidesStore() });
  }
};

export const syncHeroSlides = async (req: Request, res: Response) => {
  setNoCache(res);
  const slides = req.body.slides || req.body;
  const list = Array.isArray(slides) ? slides : [];
  const result = syncHeroSlidesStore(list);
  try {
    await syncHeroSlidesToMySQL(list);
  } catch (err) {
    console.error("[ContentController] Error syncing hero slides to MySQL:", err);
  }
  res.json({ success: true, message: "Hero slides synchronized successfully with database", data: result });
};

export const createHeroSlide = async (req: Request, res: Response) => {
  setNoCache(res);
  const slide = createHeroSlideStore(req.body);
  try {
    const all = getHeroSlidesStore();
    await syncHeroSlidesToMySQL(all);
  } catch (err) {
    console.error("[ContentController] Error creating hero slide in MySQL:", err);
  }
  res.status(201).json({ success: true, data: slide });
};

export const updateHeroSlide = async (req: Request, res: Response) => {
  setNoCache(res);
  const { id } = req.params;
  const updated = updateHeroSlideStore(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Slide not found" });
  }
  try {
    const all = getHeroSlidesStore();
    await syncHeroSlidesToMySQL(all);
  } catch (err) {
    console.error("[ContentController] Error updating hero slide in MySQL:", err);
  }
  res.json({ success: true, data: updated });
};

export const deleteHeroSlide = async (req: Request, res: Response) => {
  setNoCache(res);
  const { id } = req.params;
  const deleted = deleteHeroSlideStore(id);
  try {
    const all = getHeroSlidesStore();
    await syncHeroSlidesToMySQL(all);
  } catch (err) {
    console.error("[ContentController] Error deleting hero slide from MySQL:", err);
  }
  res.json({ success: deleted, message: deleted ? "Slide deleted" : "Slide not found" });
};

// PROMO BANNERS
export const getPromoBanner = async (_req: Request, res: Response) => {
  setNoCache(res);
  try {
    const mysqlBanner = await fetchPromoBannerFromMySQL();
    if (mysqlBanner) {
      res.json({ success: true, data: mysqlBanner });
      return;
    }
    const banner = getPromoBannerStore();
    syncPromoBannerToMySQL(banner).catch(() => {});
    res.json({ success: true, data: banner });
  } catch {
    res.json({ success: true, data: getPromoBannerStore() });
  }
};

export const updatePromoBanner = async (req: Request, res: Response) => {
  setNoCache(res);
  const banner = updatePromoBannerStore(req.body);
  try {
    await syncPromoBannerToMySQL(banner);
  } catch (err) {
    console.error("[ContentController] Error saving promo banner to MySQL:", err);
  }
  res.json({ success: true, message: "Promo banner updated in database", data: banner });
};

export const getHomepageBanners = (_req: Request, res: Response) => {
  setNoCache(res);
  res.json({ success: true, data: getHomepageBannersStore() });
};

export const syncHomepageBanners = (req: Request, res: Response) => {
  setNoCache(res);
  const banners = req.body.banners || req.body;
  const result = syncPromoBannersStore(Array.isArray(banners) ? banners : []);
  res.json({ success: true, message: "Banners synchronized successfully", data: result });
};

// OTHER CONTENT
export const getContentPages = (_req: Request, res: Response) => {
  setNoCache(res);
  res.json({ success: true, data: getContentPagesStore() });
};

export const getStoreSettings = (_req: Request, res: Response) => {
  setNoCache(res);
  res.json({ success: true, data: getStoreSettingsStore() });
};

export const updateStoreSettings = (req: Request, res: Response) => {
  setNoCache(res);
  const settings = updateStoreSettingsStore(req.body);
  res.json({ success: true, data: settings });
};
