import { filterStore } from "../store/filterStore.js";
export class FilterController {
    // GET /api/v1/filters
    static getFilters(_req, res) {
        const filters = filterStore.getFilters();
        res.status(200).json({
            success: true,
            data: filters,
        });
    }
    // POST /api/v1/filters
    static updateFilters(req, res) {
        try {
            const updated = filterStore.updateFilters(req.body);
            res.status(200).json({
                success: true,
                message: "Filter settings updated successfully!",
                data: updated,
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
}
