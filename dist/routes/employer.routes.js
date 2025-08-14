"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const employerController_1 = __importDefault(require("../controllers/employerController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isAdmin, isEmployer, isJobSeeker } = authMiddleware_1.default;
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
// Profile routes
router.get('/profile', verifyToken, isEmployer, employerController_1.default.getProfile);
router.put('/profile', verifyToken, isEmployer, validationMiddleware_1.default.employerRegisterValidation, employerController_1.default.updateProfile);
router.put('/change-email', verifyToken, isEmployer, employerController_1.default.changeEmail);
// Job routes for the employer
router.get('/jobs', verifyToken, isEmployer, employerController_1.default.getEmployerJobs);
// Dashboard route
router.get('/dashboard', verifyToken, isEmployer, employerController_1.default.getEmployerDashboard);
//Admin
router.get('/', verifyToken, isAdmin, employerController_1.default.getAllEmployers);
router.get('/infos', verifyToken, isAdmin, employerController_1.default.getAllEmployerInfos);
router.get('/:id', verifyToken, isAdmin, employerController_1.default.getEmployerById);
exports.default = router;
