"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const careerConsultationController_1 = __importDefault(require("../controllers/careerConsultationController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker } = authMiddleware_1.default;
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const { idParamValidation } = validationMiddleware_1.default;
// Routes for specific job
router.get('/', careerConsultationController_1.default.getCareerConsultations);
router.get('/:id', careerConsultationController_1.default.getCareerConsultationById);
// Routes for specific clinic points
router.post('/', careerConsultationController_1.default.createCareerConsultation);
router.delete('/:id', idParamValidation, careerConsultationController_1.default.deleteCareerConsultation);
exports.default = router;
