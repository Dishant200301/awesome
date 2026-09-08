import { getReviewsStore, createReviewStore, updateReviewStatusStore, deleteReviewStore, } from "../store/reviewStore.js";
const setNoCache = (res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
};
export const getReviews = async (req, res) => {
    setNoCache(res);
    try {
        const { productId, status, search } = req.query;
        const reviews = await getReviewsStore(productId, status, search);
        res.json({ success: true, data: reviews });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to fetch reviews" });
    }
};
export const createReview = async (req, res) => {
    try {
        const { author, comment, rating } = req.body;
        if (!author || !comment) {
            return res.status(400).json({ success: false, message: "Author and comment are required" });
        }
        const review = await createReviewStore(req.body);
        res.status(201).json({ success: true, data: review });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to create review" });
    }
};
export const updateReviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: "Status is required" });
        }
        const updated = await updateReviewStatusStore(id, status);
        if (!updated) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to update review status" });
    }
};
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteReviewStore(id);
        res.json({ success: deleted, message: deleted ? "Review deleted" : "Review not found" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to delete review" });
    }
};
