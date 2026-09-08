import { Router } from "express";
import { FilterController } from "../controllers/filter.controller.js";
const router = Router();
router.get("/", FilterController.getFilters);
router.post("/", FilterController.updateFilters);
export default router;
