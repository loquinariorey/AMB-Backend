import express from 'express';
const router = express.Router();
import featureController from '../controllers/featureController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
const { idParamValidation, featureValidation } = validationMiddleware;

// All routes require admin authentication
router.get('/', featureController.getAllFeatures);
router.get('/pagination', featureController.getAllFeaturesPagination);

router.use(verifyToken);
router.use(isAdmin);
router.get('/:id', idParamValidation, featureController.getFeatureItemById);
router.post('/', featureValidation, featureController.createFeatureItem);
router.put('/:id', featureValidation, idParamValidation, featureController.updateFeatureItem);
router.delete('/:id', idParamValidation, featureController.deleteFeatureItem);

export default router;