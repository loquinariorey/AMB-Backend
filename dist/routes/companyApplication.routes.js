"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const companyApplicationController_1 = __importDefault(require("../controllers/companyApplicationController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker } = authMiddleware_1.default;
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const { idParamValidation } = validationMiddleware_1.default;
// Routes for specific job
router.get('/', companyApplicationController_1.default.getCompanyApplications);
router.get('/:id', companyApplicationController_1.default.getCompanyApplicationById);
// Routes for specific clinic points
router.post('/', companyApplicationController_1.default.createCompanyApplication);
router.delete('/:id', idParamValidation, companyApplicationController_1.default.deleteCompanyApplication);
exports.default = router;
