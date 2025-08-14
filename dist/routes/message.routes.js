"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const messageController_1 = __importDefault(require("../controllers/messageController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker } = authMiddleware_1.default;
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const { messageValidation, idParamValidation } = validationMiddleware_1.default;
// All routes require authentication
router.use(verifyToken);
// Get all chats for current user
router.get('/chats', messageController_1.default.getAllChats);
// Get messages in a chat
router.get('/chats/:id', idParamValidation, messageController_1.default.getChatMessages);
// Send a message in a chat
router.post('/chats/:id', idParamValidation, messageValidation, messageController_1.default.sendMessage);
// Start a new chat (job seeker only)
router.post('/start-chat', isJobSeeker, messageController_1.default.startChat);
// Get unread message count
router.get('/unread-count', messageController_1.default.getUnreadCount);
exports.default = router;
