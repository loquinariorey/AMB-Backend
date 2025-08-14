"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const applicationController_1 = __importDefault(require("../controllers/applicationController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware_1.default;
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const { idParamValidation } = validationMiddleware_1.default;
router.get('/', verifyToken, applicationController_1.default.getAllApplications);
// Apply for a job (job seeker only)
router.post('/', verifyToken, isJobSeeker, applicationController_1.default.applyForJob);
// Get applications for a job seeker
router.get('/job-seeker', verifyToken, isJobSeeker, applicationController_1.default.getJobSeekerApplications);
// Get applications for an employer
router.get('/employer', verifyToken, isEmployer, applicationController_1.default.getEmployerApplications);
// Get application details
// router.get('/:id', verifyToken, idParamValidation, applicationController.getApplicationById);
router.get('/:id', verifyToken, idParamValidation, applicationController_1.default.getApplicationByJobInfoId);
exports.default = router;
