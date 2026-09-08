let contactMessages = [];
export const getContactMessagesStore = (filterStatus, search) => {
    let list = [...contactMessages];
    if (filterStatus && filterStatus.toUpperCase() !== 'ALL') {
        list = list.filter((m) => m.status.toLowerCase() === filterStatus.toLowerCase());
    }
    if (search && search.trim() !== '') {
        const q = search.toLowerCase();
        list = list.filter((m) => m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.subject.toLowerCase().includes(q) ||
            m.message.toLowerCase().includes(q));
    }
    return list;
};
export const createContactMessageStore = (data) => {
    const newMsg = {
        id: `cm-${Date.now()}`,
        name: data.name || "Customer",
        email: data.email || "customer@example.com",
        phone: data.phone || "",
        subject: data.subject || "General Inquiry",
        message: data.message || "",
        status: "New",
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString()
    };
    contactMessages.unshift(newMsg);
    return newMsg;
};
export const updateContactMessageStatusStore = (id, status, replyText) => {
    const msg = contactMessages.find((m) => m.id === id);
    if (!msg)
        return null;
    msg.status = status;
    if (replyText) {
        msg.replyText = replyText;
    }
    return msg;
};
export const deleteContactMessageStore = (id) => {
    const len = contactMessages.length;
    contactMessages = contactMessages.filter((m) => m.id !== id);
    return contactMessages.length < len;
};
