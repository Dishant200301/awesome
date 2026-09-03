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
import { authenticateAdmin } from "../../auth/middleware/auth.middleware.js";

const router = Router();

// Public Read Endpoints (Consumed by Storefront)
router.get("/hero-slides", getHeroSlides);
router.get("/promo-banner", getPromoBanner);
router.get("/banners", getHomepageBanners);
router.get("/pages", getContentPages);
router.get("/settings", getStoreSettings);

// Protected Admin Mutation Endpoints
router.post("/hero-slides/sync", authenticateAdmin, syncHeroSlides);
router.post("/hero-slides", authenticateAdmin, createHeroSlide);
router.put("/hero-slides/:id", authenticateAdmin, updateHeroSlide);
router.delete("/hero-slides/:id", authenticateAdmin, deleteHeroSlide);

router.put("/promo-banner", authenticateAdmin, updatePromoBanner);
router.post("/promo-banner", authenticateAdmin, updatePromoBanner);

router.post("/banners/sync", authenticateAdmin, syncHomepageBanners);
router.put("/settings", authenticateAdmin, updateStoreSettings);

export default router;
