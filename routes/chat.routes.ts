import express from 'express';
import chatController from '../controllers/chatController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware;

const router = express.Router();

// All routes need authentication
router.get('/', verifyToken, chatController.getUserChats as any);
router.get('/:chat_id', verifyToken, chatController.getChatMessages as any);
router.get('/mark/:chat_id', verifyToken, chatController.markMessagesRead as any);

router.put('/messages/:id', verifyToken, chatController.editMessage as any);
router.delete('/messages/:id', verifyToken, chatController.deleteMessage as any);

export default router;