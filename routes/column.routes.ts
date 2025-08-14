import express from 'express';
const router = express.Router();
import columnController from '../controllers/columnController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
const { idParamValidation, columnValidation } = validationMiddleware;
import memoryUpload from "../utils/upload_memory";

// All routes require admin authentication
// router.get('/', columnController.getAllColumns);
router.get('/', columnController.getAllColumnsPagination);
router.get('/recommended', columnController.getRecommened);
router.get('/:id', idParamValidation, columnController.getColumnItemById);

router.use(verifyToken);
router.use(isAdmin);
router.post('/', 
    memoryUpload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "columnImages", maxCount: 10 },
    ]),
    columnValidation, columnController.createColumnItem);
router.put('/:id', memoryUpload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "columnImages", maxCount: 10 },
    ]),idParamValidation, columnController.updateColumnItem);
router.delete('/:id', idParamValidation, columnController.deleteColumnItem);

export default router;