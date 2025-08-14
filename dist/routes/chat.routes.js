"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatController_1 = __importDefault(require("../controllers/chatController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware_1.default;
const router = express_1.default.Router();
// All routes need authentication
router.get('/', verifyToken, chatController_1.default.getUserChats);
router.get('/:chat_id', verifyToken, chatController_1.default.getChatMessages);
router.get('/mark/:chat_id', verifyToken, chatController_1.default.markMessagesRead);
router.put('/messages/:id', verifyToken, chatController_1.default.editMessage);
router.delete('/messages/:id', verifyToken, chatController_1.default.deleteMessage);
exports.default = router;
