"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const columnController_1 = __importDefault(require("../controllers/columnController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware_1.default;
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const { idParamValidation, columnValidation } = validationMiddleware_1.default;
const upload_memory_1 = __importDefault(require("../utils/upload_memory"));
// All routes require admin authentication
// router.get('/', columnController.getAllColumns);
router.get('/', columnController_1.default.getAllColumnsPagination);
router.get('/recommended', columnController_1.default.getRecommened);
router.get('/:id', idParamValidation, columnController_1.default.getColumnItemById);
router.use(verifyToken);
router.use(isAdmin);
router.post('/', upload_memory_1.default.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "columnImages", maxCount: 10 },
]), columnValidation, columnController_1.default.createColumnItem);
router.put('/:id', upload_memory_1.default.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "columnImages", maxCount: 10 },
]), idParamValidation, columnController_1.default.updateColumnItem);
router.delete('/:id', idParamValidation, columnController_1.default.deleteColumnItem);
exports.default = router;
