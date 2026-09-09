import { sequelize } from "../../../database/index.js";
let cachedContactMessages = [];
let isTableInitialized = false;
export async function refreshContactMessagesFromMySQL() {
    try {
        // 1. Ensure table exists
        if (!isTableInitialized) {
            await sequelize.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          email VARCHAR(150) NOT NULL,
          phone VARCHAR(50),
          subject VARCHAR(255),
          message TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'New',
          reply_text TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);
            isTableInitialized = true;
        }
        // 2. Fetch real dynamic rows from MySQL
        const [rows] = await sequelize.query(`SELECT * FROM contact_messages ORDER BY created_at DESC`);
        if (Array.isArray(rows)) {
            cachedContactMessages = rows.map((r) => ({
                id: String(r.id),
                name: r.name || "Customer",
                email: r.email || "",
                phone: r.phone || "",
                subject: r.subject || "General Inquiry",
                message: r.message || "",
                status: (r.status || "New"),
                date: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
                replyText: r.reply_text || undefined
            }));
            return cachedContactMessages;
        }
        cachedContactMessages = [];
        return cachedContactMessages;
    }
    catch (err) {
        console.error("[ContactStore] Unable to load contact messages from MySQL:", err.message);
        throw err;
    }
}
// Immediately trigger background refresh
refreshContactMessagesFromMySQL().catch(() => { });
export const getContactMessagesStore = async (filterStatus, search) => {
    const all = await refreshContactMessagesFromMySQL();
    let list = [...all];
    if (filterStatus && filterStatus.toUpperCase() !== 'ALL') {
        const targetStatus = filterStatus.trim().toLowerCase();
        list = list.filter((m) => m.status.toLowerCase() === targetStatus);
    }
    if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        list = list.filter((m) => m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.subject.toLowerCase().includes(q) ||
            m.message.toLowerCase().includes(q));
    }
    return list;
};
// Synchronous getter for analytics store
export const getContactMessagesSync = () => {
    return cachedContactMessages;
};
export const createContactMessageStore = async (data) => {
    const newMsg = {
        id: `cm-${Date.now()}`,
        name: (data.name || "Customer").trim(),
        email: (data.email || "customer@example.com").trim(),
        phone: (data.phone || "").trim(),
        subject: (data.subject || "General Inquiry").trim(),
        message: (data.message || "").trim(),
        status: "New",
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString()
    };
    await sequelize.query(`
    INSERT INTO contact_messages (id, name, email, phone, subject, message, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'New', NOW())
  `, {
        replacements: [
            newMsg.id,
            newMsg.name,
            newMsg.email,
            newMsg.phone || null,
            newMsg.subject,
            newMsg.message
        ]
    });
    cachedContactMessages.unshift(newMsg);
    return newMsg;
};
export const updateContactMessageStatusStore = async (id, status, replyText) => {
    await sequelize.query(`
    UPDATE contact_messages SET status = ?, reply_text = ? WHERE id = ?
  `, {
        replacements: [status, replyText || null, id]
    });
    const msg = cachedContactMessages.find((m) => m.id === id);
    if (msg) {
        msg.status = status;
        if (replyText) {
            msg.replyText = replyText;
        }
    }
    return msg || null;
};
export const deleteContactMessageStore = async (id) => {
    await sequelize.query(`DELETE FROM contact_messages WHERE id = ?`, {
        replacements: [id]
    });
    const len = cachedContactMessages.length;
    cachedContactMessages = cachedContactMessages.filter((m) => m.id !== id);
    return cachedContactMessages.length < len;
};
