import { check } from 'express-validator';
import express from 'express';
const router = express.Router();

// Import the default export object from authController.js
import authController from '../controllers/authController';

// Import middleware normally
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
import upload from "../middleware/upload_aws";

// Job Seeker Routes
router.post('/job-seeker/register', validationMiddleware.jobSeekerRegisterValidation, authController.registerJobSeeker);
router.post('/job-seeker/update', verifyToken, isJobSeeker, upload.single('avatar'), authController.updateJobSeeker);
router.post('/job-seeker/login', validationMiddleware.loginValidation, authController.loginJobSeeker);

// Employer Routes
router.post('/employer/register', validationMiddleware.employerRegisterValidation, authController.registerEmployer);
router.post('/employer/update', verifyToken, isEmployer, upload.single('avatar'), authController.updateEmployer);
router.post('/employer/login', validationMiddleware.loginValidation, authController.loginEmployer);

// Admin Routes
router.post('/admin/login', validationMiddleware.loginValidation, authController.loginAdmin);

// Unified Login
router.post('/login', validationMiddleware.loginValidation, authController.unifiedLogin);

// General Routes
router.get('/me', authMiddleware.verifyToken, authController.getCurrentUser);
router.put('/change-password', authMiddleware.verifyToken, authController.changePassword);

// ✅ Forgot Password and Reset Password
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// ✅ Change Email Routes
router.post('/request-change-email', verifyToken, authController.requestEmailChangeLink);
router.get('/verify-email-change', authController.verifyEmailChange);

// ✅ Check Email Routes
router.post('/confirm-email-request', authController.confirmEmailRequest);
router.post('/confirm-email', authController.confirmEmail);

// ✅ Toggle User Status
router.post('/toggle-user-status', verifyToken, isAdmin, authController.toggleUserStatus);

export default router;
