import { Request, Response } from "express";
import {
  getContactMessagesStore,
  createContactMessageStore,
  updateContactMessageStatusStore,
  deleteContactMessageStore
} from "../store/contactStore.js";

export const getContactMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const messages = await getContactMessagesStore(status as string, search as string);
    res.status(200).json({ success: true, data: messages });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const msg = await createContactMessageStore(req.body);
    res.status(201).json({ success: true, data: msg });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateContactMessageStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, replyText } = req.body;
    const updated = await updateContactMessageStatusStore(id, status, replyText);
    if (!updated) {
      res.status(404).json({ success: false, message: "Contact message not found" });
      return;
    }
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deleteContactMessageStore(id);
    res.status(200).json({ success: deleted, message: deleted ? "Message deleted" : "Message not found" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
