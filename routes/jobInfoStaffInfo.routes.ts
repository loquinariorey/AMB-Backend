import express from 'express';
const router = express.Router();
import staffInfoController from '../controllers/jobInfoStaffInfoController';

import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
const { idParamValidation } = validationMiddleware;

// Protected routes
router.use(verifyToken);
router.use(isEmployer);

// Routes for specific job
router.get('/jobs/:jobId/staff-info', staffInfoController.getStaffInfo);
router.post('/jobs/:jobId/staff-info', staffInfoController.createStaffInfo);

// Routes for specific staff info
router.get('/:id', idParamValidation, staffInfoController.getStaffInfoById);
router.put('/:id', idParamValidation, staffInfoController.updateStaffInfo);
router.delete('/:id', idParamValidation, staffInfoController.deleteStaffInfo);

export default router;