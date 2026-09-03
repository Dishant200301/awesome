import { Router } from "express";
import { AttributeController } from "../controllers/attribute.controller.js";
import { authenticateAdmin } from "../../auth/middleware/auth.middleware.js";

const router = Router();

// Public Read Endpoints
router.get("/", AttributeController.getAllAttributes);
router.get("/:id", AttributeController.getAttributeById);
router.get("/:id/values", AttributeController.getAttributeValues);

// Protected Admin Mutation Endpoints
router.post("/", authenticateAdmin, AttributeController.createAttribute);
router.put("/:id", authenticateAdmin, AttributeController.updateAttribute);
router.patch("/:id/status", authenticateAdmin, AttributeController.updateAttributeStatus);
router.delete("/:id", authenticateAdmin, AttributeController.deleteAttribute);

// Attribute Values Mutation Endpoints
router.post("/:id/values", authenticateAdmin, AttributeController.addAttributeValue);
router.put("/:id/values/:valueId", authenticateAdmin, AttributeController.updateAttributeValue);
router.delete("/:id/values/:valueId", authenticateAdmin, AttributeController.deleteAttributeValue);

export default router;
