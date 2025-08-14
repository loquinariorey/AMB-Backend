"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const models_1 = __importDefault(require("../models"));
const { JobAnalytic, sequelize } = models_1.default;
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isAdmin, isEmployer } = authMiddleware_1.default;
const errorTypes_1 = __importDefault(require("../utils/errorTypes"));
const { BadRequestError } = errorTypes_1.default;
/**
 * Get analytics for a specific job
 * @route GET /api/analytics/job/:id
 */
router.get('/job/:id', verifyToken, isEmployer, async (req, res, next) => {
    try {
        const { id: jobId } = req.params;
        const { period = 'month' } = req.query;
        // Calculate date range
        const today = new Date();
        const year = today.getFullYear().toString();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        // Define grouping based on period
        let groupBy, whereCondition;
        if (period === 'day') {
            // Day-wise data for current month
            groupBy = ['year', 'month', 'day'];
            whereCondition = { job_info_id: jobId, year, month };
        }
        else if (period === 'month') {
            // Month-wise data for current year
            groupBy = ['year', 'month'];
            whereCondition = { job_info_id: jobId, year };
        }
        else if (period === 'year') {
            // Year-wise data
            groupBy = ['year'];
            whereCondition = { job_info_id: jobId };
        }
        else {
            throw new BadRequestError('Invalid period. Use "day", "month", or "year"');
        }
        // Get job analytics
        const analytics = await JobAnalytic.findAll({
            attributes: [
                ...groupBy,
                [sequelize.fn('SUM', sequelize.col('search_count')), 'total_views'],
                [sequelize.fn('SUM', sequelize.col('recruits_count')), 'total_clicks']
            ],
            where: whereCondition,
            group: groupBy,
            order: groupBy.map(field => [field, 'ASC']),
            raw: true
        });
        // Return response
        res.status(200).json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
