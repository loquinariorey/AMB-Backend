import express from 'express';
const router = express.Router();
import contactController from '../controllers/contactController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
const { idParamValidation } = validationMiddleware;

// Routes for specific job
router.get('/', contactController.getContacts);
router.get('/:id', contactController.getContactById);

// Routes for specific clinic points
router.post('/', contactController.createContact);
router.delete('/:id', idParamValidation, contactController.deleteContact);

export default router;