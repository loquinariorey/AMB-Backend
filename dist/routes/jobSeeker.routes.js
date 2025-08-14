"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const jobSeekerController_1 = __importDefault(require("../controllers/jobSeekerController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isAdmin, isEmployer, isJobSeeker } = authMiddleware_1.default;
// Profile routes
router.get('/profile', verifyToken, isJobSeeker, jobSeekerController_1.default.getProfile);
router.put('/:id', verifyToken, isAdmin, jobSeekerController_1.default.updateProfile);
router.put('/change-email', verifyToken, isJobSeeker, jobSeekerController_1.default.changeEmail);
// Favorite jobs
router.get('/favorite-jobs', verifyToken, isJobSeeker, jobSeekerController_1.default.getFavoriteJobs);
router.post('/favorite-jobs', verifyToken, isJobSeeker, jobSeekerController_1.default.addFavoriteJob);
router.delete('/favorite-jobs/:id', verifyToken, isJobSeeker, jobSeekerController_1.default.removeFavoriteJob);
//Admin
router.get('/', verifyToken, isAdmin, jobSeekerController_1.default.getAllJobSeekers);
router.get('/:id', verifyToken, isAdmin, jobSeekerController_1.default.getJobSeekerById);
router.delete('/:id', verifyToken, isAdmin, jobSeekerController_1.default.deleteJobSeekerById);
exports.default = router;
