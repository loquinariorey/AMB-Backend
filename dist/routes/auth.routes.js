"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Import the default export object from authController.js
const authController_1 = __importDefault(require("../controllers/authController"));
// Import middleware normally
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware_1.default;
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const upload_aws_1 = __importDefault(require("../middleware/upload_aws"));
// Job Seeker Routes
router.post('/job-seeker/register', validationMiddleware_1.default.jobSeekerRegisterValidation, authController_1.default.registerJobSeeker);
router.post('/job-seeker/update', verifyToken, isJobSeeker, upload_aws_1.default.single('avatar'), authController_1.default.updateJobSeeker);
router.post('/job-seeker/login', validationMiddleware_1.default.loginValidation, authController_1.default.loginJobSeeker);
// Employer Routes
router.post('/employer/register', validationMiddleware_1.default.employerRegisterValidation, authController_1.default.registerEmployer);
router.post('/employer/update', verifyToken, isEmployer, upload_aws_1.default.single('avatar'), authController_1.default.updateEmployer);
router.post('/employer/login', validationMiddleware_1.default.loginValidation, authController_1.default.loginEmployer);
// Admin Routes
router.post('/admin/login', validationMiddleware_1.default.loginValidation, authController_1.default.loginAdmin);
// Unified Login
router.post('/login', validationMiddleware_1.default.loginValidation, authController_1.default.unifiedLogin);
// General Routes
router.get('/me', authMiddleware_1.default.verifyToken, authController_1.default.getCurrentUser);
router.put('/change-password', authMiddleware_1.default.verifyToken, authController_1.default.changePassword);
// ✅ Forgot Password and Reset Password
router.post('/forgot-password', authController_1.default.requestPasswordReset);
router.post('/reset-password', authController_1.default.resetPassword);
// ✅ Change Email Routes
router.post('/request-change-email', verifyToken, authController_1.default.requestEmailChangeLink);
router.get('/verify-email-change', authController_1.default.verifyEmailChange);
// ✅ Check Email Routes
router.post('/confirm-email-request', authController_1.default.confirmEmailRequest);
router.post('/confirm-email', authController_1.default.confirmEmail);
// ✅ Toggle User Status
router.post('/toggle-user-status', verifyToken, isAdmin, authController_1.default.toggleUserStatus);
exports.default = router;
