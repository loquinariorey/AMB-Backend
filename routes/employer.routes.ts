import express from 'express';
const router = express.Router();
import employerController from '../controllers/employerController';

import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isAdmin, isEmployer, isJobSeeker } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';

// Profile routes
router.get('/profile', verifyToken, isEmployer, employerController.getProfile);
router.put('/profile', verifyToken, isEmployer, validationMiddleware.employerRegisterValidation, employerController.updateProfile);
router.put('/change-email', verifyToken, isEmployer, employerController.changeEmail);

// Job routes for the employer
router.get('/jobs', verifyToken, isEmployer, employerController.getEmployerJobs);

// Dashboard route
router.get('/dashboard', verifyToken, isEmployer, employerController.getEmployerDashboard);

//Admin
router.get('/', verifyToken, isAdmin, employerController.getAllEmployers);
router.get('/infos', verifyToken, isAdmin, employerController.getAllEmployerInfos);
router.get('/:id', verifyToken, isAdmin, employerController.getEmployerById);
export default router;