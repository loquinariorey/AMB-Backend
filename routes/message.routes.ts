import express from 'express';
const router = express.Router();
import messageController from '../controllers/messageController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
const { messageValidation, idParamValidation } = validationMiddleware;

// All routes require authentication
router.use(verifyToken);

// Get all chats for current user
router.get('/chats', messageController.getAllChats);

// Get messages in a chat
router.get('/chats/:id', idParamValidation, messageController.getChatMessages);

// Send a message in a chat
router.post('/chats/:id', idParamValidation, messageValidation, messageController.sendMessage);

// Start a new chat (job seeker only)
router.post('/start-chat', isJobSeeker, messageController.startChat);

// Get unread message count
router.get('/unread-count', messageController.getUnreadCount);

export default router;