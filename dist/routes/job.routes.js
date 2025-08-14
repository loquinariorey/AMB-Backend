"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Import default export object from jobController
const jobController_1 = __importDefault(require("../controllers/jobController"));
// Import auth middlewares
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker, isAdmin, isOwner } = authMiddleware_1.default;
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const { jobValidation, idParamValidation } = validationMiddleware_1.default;
const upload_aws_1 = __importDefault(require("../middleware/upload_aws"));
// Public routes
router.get('/', jobController_1.default.getAllJobs);
router.get('/featured', jobController_1.default.getFeaturedJobs);
// Job recommendations for job seekers
router.get('/recommendations', verifyToken, isJobSeeker, jobController_1.default.getRecommendedJobs);
router.get('/favourites', verifyToken, isJobSeeker, jobController_1.default.getFavouriteJobs);
// Get job by ID with ID validation
router.get('/:id', idParamValidation, jobController_1.default.getJobById);
// Add favourite jobs by JobSeeker
router.post('/favourite', verifyToken, isJobSeeker, jobController_1.default.addFavouriteJob);
// Create a job
router.post('/', verifyToken, 
// isEmployer,
upload_aws_1.default.fields([
    { name: "staffImages", maxCount: 10 },
    { name: "introImages", maxCount: 10 },
    { name: "thumbnail", maxCount: 1 },
]), jobValidation, jobController_1.default.createJob);
// Update a job
router.put('/:id', verifyToken, upload_aws_1.default.fields([
    { name: "staffImages", maxCount: 10 },
    { name: "introImages", maxCount: 10 },
    { name: "thumbnail", maxCount: 1 },
]), jobValidation, jobController_1.default.updateJob);
// Delete a job
router.delete('/:id', verifyToken, idParamValidation, jobController_1.default.deleteJob);
exports.default = router;
