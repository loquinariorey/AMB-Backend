"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const jobInfoClinicPointController_1 = __importDefault(require("../controllers/jobInfoClinicPointController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker } = authMiddleware_1.default;
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const { idParamValidation } = validationMiddleware_1.default;
// Protected routes
router.use(verifyToken);
router.use(isEmployer);
// Routes for specific job
router.get('/jobs/:jobId/clinic-points', jobInfoClinicPointController_1.default.getClinicPoints);
router.post('/jobs/:jobId/clinic-points', jobInfoClinicPointController_1.default.createClinicPoint);
// Routes for specific clinic points
router.get('/:id', idParamValidation, jobInfoClinicPointController_1.default.getClinicPointById);
router.put('/:id', idParamValidation, jobInfoClinicPointController_1.default.updateClinicPoint);
router.delete('/:id', idParamValidation, jobInfoClinicPointController_1.default.deleteClinicPoint);
exports.default = router;
