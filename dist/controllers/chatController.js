"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = __importDefault(require("../models"));
const { Chat, ChatBody, JobInfo, JobSeeker, Employer, ImagePath } = models_1.default;
// Get chat list for current user (employer or jobseeker)
const getUserChats = async (req, res, next) => {
    try {
        const { user } = req;
        const isEmployer = user.role === 'employer';
        const isAdmin = user.role === 'admin';
        // 🔥 Updated where clause based on role and agency
        let chatWhere = {};
        console.log(user.role);
        if (user.role === 'admin') {
            chatWhere = { agency: 1 }; // 🔥 Admin sees agency chats only
        }
        else if (user.role === 'employer') {
            chatWhere = { agency: 0 }; // 🔥 Employer sees non-agency chats only
        }
        else if (user.role === 'jobseeker') {
            chatWhere = { job_seeker_id: user.id }; // 🔥 Job seeker sees their chats
        }
        const chats = await Chat.findAll({
            include: [
                {
                    model: ChatBody,
                    as: 'messages',
                    separate: true,
                    order: [['created', 'DESC']],
                    limit: 1, // latest message only
                },
                {
                    model: JobInfo,
                    as: 'jobInfo',
                    attributes: ['id', 'job_title', 'employer_id', 'job_detail_page_template_id'],
                    required: true,
                    where: isEmployer ? { employer_id: user.id } : undefined, // 🔥 filter by jobInfo.employer_id for employer
                    include: [
                        {
                            model: Employer,
                            as: 'employer',
                            attributes: ['id', 'clinic_name', 'prefectures', 'city', 'tel'],
                            include: [
                                {
                                    model: ImagePath,
                                    as: 'avatar',
                                    required: false,
                                    where: { posting_category: 2 }, // 👤 employer avatar
                                    attributes: ['entity_path'],
                                },
                            ],
                        },
                    ],
                },
                {
                    model: JobSeeker,
                    as: 'jobSeeker',
                    attributes: ['id', 'name', 'email', 'sex', 'birthdate', 'prefectures', 'zip', 'tel'],
                    include: [
                        {
                            model: ImagePath,
                            as: 'avatar',
                            required: false,
                            where: { posting_category: 1 }, // 👤 job seeker avatar
                            attributes: ['entity_path'],
                        },
                    ],
                },
            ],
            where: chatWhere,
        });
        // 📨 Add unread count per chat
        const chatListWithUnread = await Promise.all(chats.map(async (chat) => {
            const unreadCount = await ChatBody.count({
                where: {
                    chat_id: chat.id,
                    is_readed: 0,
                    sender: user.role === 'jobseeker' ? 2 : 1,
                },
            });
            const latestMessage = chat.messages[0];
            return {
                ...chat.toJSON(),
                unreadCount,
                lastMessageTime: latestMessage?.created || chat.created,
            };
        }));
        // 📅 Sort by latest message time
        chatListWithUnread.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
        res.json({ success: true, data: chatListWithUnread });
    }
    catch (err) {
        next(err);
    }
};
// Mark messages as read
const markMessagesRead = async (req, res, next) => {
    try {
        const chatId = parseInt(req.params.chat_id);
        const { user } = req;
        const isJobSeeker = user.role === 'jobseeker';
        await ChatBody.update({ is_readed: 1 }, {
            where: {
                chat_id: chatId,
                is_readed: 0,
                sender: isJobSeeker ? 2 : 1,
            },
        });
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
};
// Get all messages for one chat room
const getChatMessages = async (req, res, next) => {
    try {
        const chat_id = parseInt(req.params.chat_id);
        const messages = await ChatBody.findAll({
            where: { chat_id: chat_id },
            order: [['created', 'DESC']],
        });
        res.json({ success: true, data: messages });
    }
    catch (err) {
        next(err);
    }
};
// controllers/chatController.ts
const editMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { body } = req.body;
        const { user } = req;
        const message = await ChatBody.findByPk(id);
        if (!message)
            return res.status(404).json({ success: false, message: 'Message not found' });
        const isEmployer = user.role === 'employer';
        const senderCode = isEmployer ? 1 : 2;
        if (message.sender !== senderCode) {
            return res.status(403).json({ success: false, message: 'You can only edit your own message' });
        }
        message.body = body;
        message.modified = new Date();
        await message.save();
        res.json({ success: true, data: message });
    }
    catch (err) {
        next(err);
    }
};
const deleteMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user } = req;
        const message = await ChatBody.findByPk(id);
        if (!message)
            return res.status(404).json({ success: false, message: 'Message not found' });
        const isEmployer = user.role === 'employer';
        const senderCode = isEmployer ? 1 : 2;
        if (message.sender !== senderCode) {
            return res.status(403).json({ success: false, message: 'You can only delete your own message' });
        }
        await message.destroy();
        res.json({ success: true, message: 'Message deleted' });
    }
    catch (err) {
        next(err);
    }
};
exports.default = {
    getChatMessages, markMessagesRead, getUserChats, editMessage, deleteMessage
};
