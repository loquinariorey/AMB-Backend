import express from 'express';
const router = express.Router();
import applicationController from '../controllers/applicationController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
const { idParamValidation } = validationMiddleware;

router.get('/', verifyToken, applicationController.getAllApplications);
// Apply for a job (job seeker only)
router.post('/', verifyToken, isJobSeeker, applicationController.applyForJob);

// Get applications for a job seeker
router.get('/job-seeker', verifyToken, isJobSeeker, applicationController.getJobSeekerApplications);

// Get applications for an employer
router.get('/employer', verifyToken, isEmployer, applicationController.getEmployerApplications);

// Get application details
// router.get('/:id', verifyToken, idParamValidation, applicationController.getApplicationById);
router.get('/:id', verifyToken, idParamValidation, applicationController.getApplicationByJobInfoId);

export default router;