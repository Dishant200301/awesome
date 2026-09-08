import { getContactMessagesStore, createContactMessageStore, updateContactMessageStatusStore, deleteContactMessageStore } from "../store/contactStore.js";
export const getContactMessages = (req, res) => {
    const { status, search } = req.query;
    const messages = getContactMessagesStore(status, search);
    res.json({ success: true, data: messages });
};
export const createContactMessage = (req, res) => {
    const msg = createContactMessageStore(req.body);
    res.status(201).json({ success: true, data: msg });
};
export const updateContactMessageStatus = (req, res) => {
    const { id } = req.params;
    const { status, replyText } = req.body;
    const updated = updateContactMessageStatusStore(id, status, replyText);
    if (!updated) {
        return res.status(404).json({ success: false, message: "Contact message not found" });
    }
    res.json({ success: true, data: updated });
};
export const deleteContactMessage = (req, res) => {
    const { id } = req.params;
    const deleted = deleteContactMessageStore(id);
    res.json({ success: deleted, message: deleted ? "Message deleted" : "Message not found" });
};
