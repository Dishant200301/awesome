import { Router } from "express";
import { SizeGuideController } from "../controllers/sizeGuide.controller.js";
const router = Router();
router.get("/", SizeGuideController.getAllSizeGuides);
router.get("/:id", SizeGuideController.getSizeGuideById);
router.post("/", SizeGuideController.createSizeGuide);
router.put("/:id", SizeGuideController.updateSizeGuide);
router.delete("/:id", SizeGuideController.deleteSizeGuide);
export default router;
