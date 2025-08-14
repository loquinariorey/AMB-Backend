"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const adminController_1 = __importDefault(require("../controllers/adminController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isAdmin } = authMiddleware_1.default;
// All routes require admin authentication
router.use(verifyToken);
router.use(isAdmin);
// Dashboard route
router.get('/dashboard', adminController_1.default.getDashboardStats);
// User management routes
router.get('/employers', adminController_1.default.getAllEmployers);
router.get('/job-seekers', adminController_1.default.getAllJobSeekers);
router.get('/jobs', adminController_1.default.getAllJobs);
// Admin user management
router.post('/create', adminController_1.default.createAdmin);
// User activation/deactivation
router.put('/users/:id/deactivate', adminController_1.default.deactivateUser);
router.put('/users/:id/reactivate', adminController_1.default.reactivateUser);
// Analytics
router.get('/analytics', adminController_1.default.getAnalytics);
exports.default = router;
