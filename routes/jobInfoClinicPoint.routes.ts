import express from 'express';
const router = express.Router();
import clinicPointController from '../controllers/jobInfoClinicPointController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
const { idParamValidation } = validationMiddleware;

// Protected routes
router.use(verifyToken);
router.use(isEmployer);

// Routes for specific job
router.get('/jobs/:jobId/clinic-points', clinicPointController.getClinicPoints);
router.post('/jobs/:jobId/clinic-points', clinicPointController.createClinicPoint);

// Routes for specific clinic points
router.get('/:id', idParamValidation, clinicPointController.getClinicPointById);
router.put('/:id', idParamValidation, clinicPointController.updateClinicPoint);
router.delete('/:id', idParamValidation, clinicPointController.deleteClinicPoint);

export default router;