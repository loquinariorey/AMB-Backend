"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const featureController_1 = __importDefault(require("../controllers/featureController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware_1.default;
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const { idParamValidation, featureValidation } = validationMiddleware_1.default;
// All routes require admin authentication
router.get('/', featureController_1.default.getAllFeatures);
router.get('/pagination', featureController_1.default.getAllFeaturesPagination);
router.use(verifyToken);
router.use(isAdmin);
router.get('/:id', idParamValidation, featureController_1.default.getFeatureItemById);
router.post('/', featureValidation, featureController_1.default.createFeatureItem);
router.put('/:id', featureValidation, idParamValidation, featureController_1.default.updateFeatureItem);
router.delete('/:id', idParamValidation, featureController_1.default.deleteFeatureItem);
exports.default = router;
