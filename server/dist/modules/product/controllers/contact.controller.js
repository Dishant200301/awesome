import { getContactMessagesStore, createContactMessageStore, updateContactMessageStatusStore, deleteContactMessageStore } from "../store/contactStore.js";
export const getContactMessages = async (req, res) => {
    try {
        const { status, search } = req.query;
        const messages = await getContactMessagesStore(status, search);
        res.status(200).json({ success: true, data: messages });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const createContactMessage = async (req, res) => {
    try {
        const msg = await createContactMessageStore(req.body);
        res.status(201).json({ success: true, data: msg });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const updateContactMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, replyText } = req.body;
        const updated = await updateContactMessageStatusStore(id, status, replyText);
        if (!updated) {
            res.status(404).json({ success: false, message: "Contact message not found" });
            return;
        }
        res.status(200).json({ success: true, data: updated });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const deleteContactMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteContactMessageStore(id);
        res.status(200).json({ success: deleted, message: deleted ? "Message deleted" : "Message not found" });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
