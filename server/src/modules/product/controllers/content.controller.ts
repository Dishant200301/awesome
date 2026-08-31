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

// HERO SLIDES
export const getHeroSlides = (_req: Request, res: Response) => {
  const slides = getHeroSlidesStore();
  res.json({ success: true, data: slides });
};

export const syncHeroSlides = (req: Request, res: Response) => {
  const slides = req.body.slides || req.body;
  const result = syncHeroSlidesStore(Array.isArray(slides) ? slides : []);
  res.json({ success: true, message: "Hero slides synchronized successfully", data: result });
};

export const createHeroSlide = (req: Request, res: Response) => {
  const slide = createHeroSlideStore(req.body);
  res.status(201).json({ success: true, data: slide });
};

export const updateHeroSlide = (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = updateHeroSlideStore(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Slide not found" });
  }
  res.json({ success: true, data: updated });
};

export const deleteHeroSlide = (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = deleteHeroSlideStore(id);
  res.json({ success: deleted, message: deleted ? "Slide deleted" : "Slide not found" });
};

// PROMO BANNERS
export const getPromoBanner = (_req: Request, res: Response) => {
  const banner = getPromoBannerStore();
  res.json({ success: true, data: banner });
};

export const updatePromoBanner = (req: Request, res: Response) => {
  const banner = updatePromoBannerStore(req.body);
  res.json({ success: true, message: "Promo banner updated", data: banner });
};

export const getHomepageBanners = (_req: Request, res: Response) => {
  res.json({ success: true, data: getHomepageBannersStore() });
};

export const syncHomepageBanners = (req: Request, res: Response) => {
  const banners = req.body.banners || req.body;
  const result = syncPromoBannersStore(Array.isArray(banners) ? banners : []);
  res.json({ success: true, message: "Banners synchronized successfully", data: result });
};

// OTHER CONTENT
export const getContentPages = (_req: Request, res: Response) => {
  res.json({ success: true, data: getContentPagesStore() });
};

export const getStoreSettings = (_req: Request, res: Response) => {
  res.json({ success: true, data: getStoreSettingsStore() });
};

export const updateStoreSettings = (req: Request, res: Response) => {
  const settings = updateStoreSettingsStore(req.body);
  res.json({ success: true, data: settings });
};
