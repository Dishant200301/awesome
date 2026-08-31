import { Router } from "express";
import {
  getHeroSlides,
  syncHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  getPromoBanner,
  updatePromoBanner,
  getHomepageBanners,
  syncHomepageBanners,
  getContentPages,
  getStoreSettings,
  updateStoreSettings
} from "../controllers/content.controller.js";

const router = Router();

// Hero Slides Endpoints
router.get("/hero-slides", getHeroSlides);
router.post("/hero-slides/sync", syncHeroSlides);
router.post("/hero-slides", createHeroSlide);
router.put("/hero-slides/:id", updateHeroSlide);
router.delete("/hero-slides/:id", deleteHeroSlide);

// Promo Banner Endpoints
router.get("/promo-banner", getPromoBanner);
router.put("/promo-banner", updatePromoBanner);
router.post("/promo-banner", updatePromoBanner);

// Homepage Banners Endpoints
router.get("/banners", getHomepageBanners);
router.post("/banners/sync", syncHomepageBanners);

// Pages & Settings
router.get("/pages", getContentPages);
router.get("/settings", getStoreSettings);
router.put("/settings", updateStoreSettings);

export default router;
