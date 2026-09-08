import { Router } from "express";
import { getContactMessages, createContactMessage, updateContactMessageStatus, deleteContactMessage } from "../controllers/contact.controller.js";
const router = Router();
router.get("/", getContactMessages);
router.post("/", createContactMessage);
router.put("/:id/status", updateContactMessageStatus);
router.delete("/:id", deleteContactMessage);
export default router;
