import express from 'express';
const router = express.Router();
import interviewController from '../controllers/interviewController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
const { idParamValidation, columnValidation } = validationMiddleware;
import memoryUpload from "../utils/upload_memory";

// Public routes (no authentication required)
router.get('/', interviewController.getAllInterviewsPagination);
router.get('/recommended', interviewController.getRecommened);

// 👨‍💼 Admin endpoint (must be before /:id route to avoid conflicts)
router.get('/admin', verifyToken, isAdmin, interviewController.getAllInterviewsAdmin);

// Public detail route (custom_id only, must be numeric)
router.get('/:id', idParamValidation, interviewController.getInterviewItemById);

// Admin routes (authentication required)
router.use(verifyToken);
router.use(isAdmin);

router.post('/', 
    memoryUpload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "interivewImages", maxCount: 10 },
    ]),
    interviewController.createInterviewItem);
router.put('/:id', memoryUpload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "interivewImages", maxCount: 10 },
    ]),idParamValidation, interviewController.updateInterviewItem);
router.delete('/:id', idParamValidation, interviewController.deleteInterviewItem);

export default router;