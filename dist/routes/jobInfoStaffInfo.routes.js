"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const jobInfoStaffInfoController_1 = __importDefault(require("../controllers/jobInfoStaffInfoController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker } = authMiddleware_1.default;
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const { idParamValidation } = validationMiddleware_1.default;
// Protected routes
router.use(verifyToken);
router.use(isEmployer);
// Routes for specific job
router.get('/jobs/:jobId/staff-info', jobInfoStaffInfoController_1.default.getStaffInfo);
router.post('/jobs/:jobId/staff-info', jobInfoStaffInfoController_1.default.createStaffInfo);
// Routes for specific staff info
router.get('/:id', idParamValidation, jobInfoStaffInfoController_1.default.getStaffInfoById);
router.put('/:id', idParamValidation, jobInfoStaffInfoController_1.default.updateStaffInfo);
router.delete('/:id', idParamValidation, jobInfoStaffInfoController_1.default.deleteStaffInfo);
exports.default = router;
