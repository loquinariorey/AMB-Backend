import express from 'express';
const router = express.Router();
import companyApplicationController from '../controllers/companyApplicationController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
const { idParamValidation } = validationMiddleware;

// Routes for specific job
router.get('/', companyApplicationController.getCompanyApplications);
router.get('/:id', companyApplicationController.getCompanyApplicationById);

// Routes for specific clinic points
router.post('/', companyApplicationController.createCompanyApplication);
router.delete('/:id', idParamValidation, companyApplicationController.deleteCompanyApplication);

export default router;