import express from 'express';
const router = express.Router();
import searchItemController from '../controllers/searchItemController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
const { idParamValidation } = validationMiddleware;

// All routes require admin authentication
router.use(verifyToken);
router.use(isAdmin);

router.get('/', searchItemController.getAllSearchItems);
router.get('/:id', idParamValidation, searchItemController.getSearchItemById);
router.post('/', searchItemController.createSearchItem);
router.put('/:id', idParamValidation, searchItemController.updateSearchItem);
router.delete('/:id', idParamValidation, searchItemController.deleteSearchItem);

export default router;