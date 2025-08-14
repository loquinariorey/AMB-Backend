"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const recruitingCriteriaController_1 = __importDefault(require("../controllers/recruitingCriteriaController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware_1.default;
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const { idParamValidation, recruitingCriteriaValidation } = validationMiddleware_1.default;
// All routes require admin authentication
router.get('/', recruitingCriteriaController_1.default.getAllRecruitingCriterias);
router.get('/pagination', recruitingCriteriaController_1.default.getAllRecruitingCriteriasPagination);
router.use(verifyToken);
router.use(isAdmin);
router.get('/:id', idParamValidation, recruitingCriteriaController_1.default.getRecruitingCriteriaItemById);
router.post('/', recruitingCriteriaValidation, recruitingCriteriaController_1.default.createRecruitingCriteriaItem);
router.put('/:id', recruitingCriteriaValidation, idParamValidation, recruitingCriteriaController_1.default.updateRecruitingCriteriaItem);
router.delete('/:id', idParamValidation, recruitingCriteriaController_1.default.deleteRecruitingCriteriaItem);
exports.default = router;
