import express from 'express';
const router = express.Router();
import columnController from '../controllers/columnController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
const { idParamValidation, columnValidation } = validationMiddleware;
import memoryUpload from "../utils/upload_memory";

// Public routes (no authentication required)
router.get('/', columnController.getAllColumnsPagination);
router.get('/recommended', columnController.getRecommened);

// 👨‍💼 Admin endpoint (must be before /:id route to avoid conflicts)
router.get('/admin', verifyToken, isAdmin, columnController.getAllColumnsAdmin);
router.get('/admin/:id', verifyToken, isAdmin, columnController.getColumnItemByIdAdmin);

// Public detail route (custom_id only)
router.get('/:id', columnController.getColumnItemById);

// Admin routes (authentication required)
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