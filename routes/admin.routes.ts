import express from 'express';
const router = express.Router();
import adminController from '../controllers/adminController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isAdmin } = authMiddleware;
// All routes require admin authentication
router.use(verifyToken);
router.use(isAdmin);

// Dashboard route
router.get('/dashboard', adminController.getDashboardStats);

// User management routes
router.get('/employers', adminController.getAllEmployers);
router.get('/job-seekers', adminController.getAllJobSeekers);
router.get('/jobs', adminController.getAllJobs);

// Admin user management
router.post('/create', adminController.createAdmin);

// User activation/deactivation
router.put('/users/:id/deactivate', adminController.deactivateUser);
router.put('/users/:id/reactivate', adminController.reactivateUser);

// Analytics
router.get('/analytics', adminController.getAnalytics);

export default router;