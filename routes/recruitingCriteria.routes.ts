import express from 'express';
const router = express.Router();
import recruitingCriteriaController from '../controllers/recruitingCriteriaController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
const { idParamValidation, recruitingCriteriaValidation } = validationMiddleware;

// All routes require admin authentication
router.get('/', recruitingCriteriaController.getAllRecruitingCriterias);
router.get('/pagination', recruitingCriteriaController.getAllRecruitingCriteriasPagination);

router.use(verifyToken);
router.use(isAdmin);
router.get('/:id', idParamValidation, recruitingCriteriaController.getRecruitingCriteriaItemById);
router.post('/', recruitingCriteriaValidation, recruitingCriteriaController.createRecruitingCriteriaItem);
router.put('/:id', recruitingCriteriaValidation, idParamValidation, recruitingCriteriaController.updateRecruitingCriteriaItem);
router.delete('/:id', idParamValidation, recruitingCriteriaController.deleteRecruitingCriteriaItem);

export default router;