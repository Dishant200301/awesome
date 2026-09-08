import { getDashboardAnalyticsStore } from "../store/analyticsStore.js";
export const getDashboardAnalytics = (_req, res) => {
    const stats = getDashboardAnalyticsStore();
    res.json({ success: true, data: stats });
};
