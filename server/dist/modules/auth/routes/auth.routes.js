import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";
const router = Router();
// Admin Authentication Endpoints
router.post("/admin/signup", AuthController.adminSignUp);
router.post("/admin/signin", AuthController.adminSignIn);
router.get("/admin/me", authenticateAdmin, AuthController.adminMe);
export default router;
