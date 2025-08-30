"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const interviewController_1 = __importDefault(require("../controllers/interviewController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware_1.default;
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const { idParamValidation, columnValidation } = validationMiddleware_1.default;
const upload_memory_1 = __importDefault(require("../utils/upload_memory"));
// Public routes (no authentication required)
router.get('/', interviewController_1.default.getAllInterviewsPagination);
router.get('/recommended', interviewController_1.default.getRecommened);
// 👨‍💼 Admin endpoint (must be before /:id route to avoid conflicts)
router.get('/admin', verifyToken, isAdmin, interviewController_1.default.getAllInterviewsAdmin);
router.get('/admin/:id', verifyToken, isAdmin, idParamValidation, interviewController_1.default.getInterviewItemByIdAdmin);
// Public detail route (custom_id only, must be numeric)
router.get('/:id', idParamValidation, interviewController_1.default.getInterviewItemById);
// Admin routes (authentication required)
router.use(verifyToken);
router.use(isAdmin);
router.post('/', upload_memory_1.default.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "interivewImages", maxCount: 10 },
]), interviewController_1.default.createInterviewItem);
router.put('/:id', upload_memory_1.default.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "interivewImages", maxCount: 10 },
]), idParamValidation, interviewController_1.default.updateInterviewItem);
router.delete('/:id', idParamValidation, interviewController_1.default.deleteInterviewItem);
exports.default = router;
