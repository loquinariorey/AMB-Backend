import express from 'express';
const router = express.Router();
import interviewController from '../controllers/interviewController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
const { idParamValidation, columnValidation } = validationMiddleware;
import memoryUpload from "../utils/upload_memory";

// All routes require admin authentication
// router.get('/', interviewController.getAllColumns);
router.get('/', interviewController.getAllInterviewsPagination);
router.get('/recommended', interviewController.getRecommened);
router.get('/:id', idParamValidation, interviewController.getInterviewItemById);

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