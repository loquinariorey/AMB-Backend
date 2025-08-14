import express from 'express';
const router = express.Router();
import careerConsultationController from '../controllers/careerConsultationController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
const { idParamValidation } = validationMiddleware;

// Routes for specific job
router.get('/', careerConsultationController.getCareerConsultations);
router.get('/:id', careerConsultationController.getCareerConsultationById);

// Routes for specific clinic points
router.post('/', careerConsultationController.createCareerConsultation);
router.delete('/:id', idParamValidation, careerConsultationController.deleteCareerConsultation);

export default router;