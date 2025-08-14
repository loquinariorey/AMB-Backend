"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../models"));
const { Chat, ChatBody, JobInfo, JobSeeker, Employer } = models_1.default;
const errorTypes_1 = __importDefault(require("../utils/errorTypes"));
const { NotFoundError, BadRequestError, ForbiddenError } = errorTypes_1.default;
/**
 * Get all chats for a user (job seeker or employer)
 * @route GET /api/messages/chats
 */
const getAllChats = async (req, res, next) => {
    try {
        const { id, role } = req.user;
        let whereCondition = {};
        let includeOptions = [];
        if (role === 'jobSeeker') {
            // For job seekers
            whereCondition = { job_seeker_id: id };
            includeOptions = [
                {
                    model: JobInfo,
                    as: 'jobInfo',
                    attributes: ['id', 'job_title', 'employer_id'],
                    include: [
                        {
                            model: Employer,
                            as: 'employer',
                            attributes: ['id', 'clinic_name']
                        }
                    ]
                }
            ];
        }
        else if (role === 'employer') {
            // For employers
            includeOptions = [
                {
                    model: JobInfo,
                    as: 'jobInfo',
                    attributes: ['id', 'job_title'],
                    where: { employer_id: id }
                },
                {
                    model: JobSeeker,
                    as: 'jobSeeker',
                    attributes: ['id', 'name']
                }
            ];
        }
        else {
            throw new ForbiddenError('Unauthorized access to chats');
        }
        // Add last message to each chat
        includeOptions.push({
            model: ChatBody,
            as: 'messages',
            // @ts-expect-error TS(2345): Argument of type '{ model: any; as: string; limit:... Remove this comment to see the full error message
            limit: 1,
            order: [['created', 'DESC']]
        });
        // Get all chats
        const chats = await Chat.findAll({
            where: whereCondition,
            include: includeOptions,
            order: [['modified', 'DESC']]
        });
        // Get unread message counts for each chat
        const chatsWithUnreadCount = await Promise.all(chats.map(async (chat) => {
            // Determine which messages are unread based on sender
            const unreadCondition = {
                chat_id: chat.id,
                is_readed: 0,
            };
            if (role === 'jobSeeker') {
                // For job seekers, employer messages are unread (sender = 1 typically means employer)
                // @ts-expect-error TS(2339): Property 'sender' does not exist on type '{ chat_i... Remove this comment to see the full error message
                unreadCondition.sender = 1;
            }
            else {
                // For employers, job seeker messages are unread (sender = 0 typically means job seeker)
                // @ts-expect-error TS(2339): Property 'sender' does not exist on type '{ chat_i... Remove this comment to see the full error message
                unreadCondition.sender = 0;
            }
            const unreadCount = await ChatBody.count({
                where: unreadCondition
            });
            return {
                ...chat.toJSON(),
                unreadCount
            };
        }));
        // Return response
        res.status(200).json({
            success: true,
            data: chatsWithUnreadCount
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get chat messages for a specific chat
 * @route GET /api/messages/chats/:id
 */
const getChatMessages = async (req, res, next) => {
    try {
        const { id: chatId } = req.params;
        const { id: userId, role } = req.user;
        // Find chat with job and job seeker info
        const chat = await Chat.findByPk(chatId, {
            include: [
                {
                    model: JobInfo,
                    as: 'jobInfo',
                    attributes: ['id', 'job_title', 'employer_id'],
                    include: [
                        {
                            model: Employer,
                            as: 'employer',
                            attributes: ['id', 'clinic_name']
                        }
                    ]
                },
                {
                    model: JobSeeker,
                    as: 'jobSeeker',
                    attributes: ['id', 'name']
                }
            ]
        });
        if (!chat) {
            throw new NotFoundError('Chat not found');
        }
        // Check if user has access to this chat
        if ((role === 'jobSeeker' && chat.job_seeker_id !== userId) ||
            (role === 'employer' && chat.jobInfo.employer_id !== userId)) {
            throw new ForbiddenError('You do not have access to this chat');
        }
        // Get messages
        const messages = await ChatBody.findAll({
            where: { chat_id: chatId },
            order: [['created', 'ASC']]
        });
        // Mark messages as read
        const unreadCondition = {
            chat_id: chatId,
            is_readed: 0
        };
        // Determine which messages to mark as read based on role
        if (role === 'jobSeeker') {
            // @ts-expect-error TS(2339): Property 'sender' does not exist on type '{ chat_i... Remove this comment to see the full error message
            unreadCondition.sender = 1; // Mark employer messages as read
        }
        else {
            // @ts-expect-error TS(2339): Property 'sender' does not exist on type '{ chat_i... Remove this comment to see the full error message
            unreadCondition.sender = 0; // Mark job seeker messages as read
        }
        await ChatBody.update({ is_readed: 1 }, { where: unreadCondition });
        // Return response
        res.status(200).json({
            success: true,
            data: {
                chat,
                messages
            }
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Send a message in a chat
 * @route POST /api/messages/chats/:id
 */
const sendMessage = async (req, res, next) => {
    try {
        const { id: chatId } = req.params;
        const { id: userId, role } = req.user;
        const { body, file_path, file_name } = req.body;
        // Find chat
        const chat = await Chat.findByPk(chatId, {
            include: [
                {
                    model: JobInfo,
                    as: 'jobInfo',
                    attributes: ['id', 'employer_id']
                }
            ]
        });
        if (!chat) {
            throw new NotFoundError('Chat not found');
        }
        // Check if user has access to this chat
        if ((role === 'jobSeeker' && chat.job_seeker_id !== userId) ||
            (role === 'employer' && chat.jobInfo.employer_id !== userId)) {
            throw new ForbiddenError('You do not have access to this chat');
        }
        // Determine sender type (0 for job seeker, 1 for employer)
        const sender = role === 'jobSeeker' ? 0 : 1;
        // Get the highest message number in this chat
        const lastMessage = await ChatBody.findOne({
            where: { chat_id: chatId },
            order: [['no', 'DESC']]
        });
        const nextMessageNumber = lastMessage ? lastMessage.no + 1 : 1;
        // Create message
        const message = await ChatBody.create({
            chat_id: chatId,
            no: nextMessageNumber,
            sender,
            body,
            is_readed: 0,
            mail_send: 0,
            chat_flg: 0,
            file_path,
            file_name
        });
        // Update chat last modified time
        await chat.update({
            modified: new Date()
        });
        // Return response
        res.status(201).json({
            success: true,
            data: message
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Start a new chat with an employer about a job
 * @route POST /api/messages/start-chat
 */
const startChat = async (req, res, next) => {
    try {
        const { id: jobSeekerId } = req.user;
        const { job_info_id, message } = req.body;
        if (!job_info_id || !message) {
            throw new BadRequestError('Job ID and initial message are required');
        }
        // Find job
        const job = await JobInfo.findByPk(job_info_id);
        if (!job || job.deleted || job.public_status !== 1) {
            throw new NotFoundError('Job not found or not active');
        }
        // Check if chat already exists
        const existingChat = await Chat.findOne({
            where: {
                job_info_id,
                job_seeker_id: jobSeekerId
            }
        });
        let chat;
        if (existingChat) {
            chat = existingChat;
        }
        else {
            // Create a new chat
            chat = await Chat.create({
                job_info_id,
                job_seeker_id: jobSeekerId,
                job_title: job.job_title,
                is_send_privacy: 0
            });
        }
        // Create initial message
        // Get the highest message number in this chat or start with 1
        const lastMessage = await ChatBody.findOne({
            where: { chat_id: chat.id },
            order: [['no', 'DESC']]
        });
        const nextMessageNumber = lastMessage ? lastMessage.no + 1 : 1;
        const chatMessage = await ChatBody.create({
            chat_id: chat.id,
            no: nextMessageNumber,
            sender: 0, // 0 for job seeker
            body: message,
            is_readed: 0,
            mail_send: 0,
            chat_flg: 0
        });
        // Return response
        res.status(201).json({
            success: true,
            data: {
                chat,
                message: chatMessage
            }
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get unread message count for user
 * @route GET /api/messages/unread-count
 */
const getUnreadCount = async (req, res, next) => {
    try {
        const { id, role } = req.user;
        let unreadCount;
        if (role === 'jobSeeker') {
            // For job seekers
            const chatIds = await Chat.findAll({
                attributes: ['id'],
                where: { job_seeker_id: id }
            }).map((chat) => chat.id);
            unreadCount = await ChatBody.count({
                where: {
                    chat_id: { [sequelize_1.Op.in]: chatIds },
                    is_readed: 0,
                    sender: 1 // Messages from employers
                }
            });
        }
        else if (role === 'employer') {
            // For employers, need to find chats from jobs they own
            const jobIds = await JobInfo.findAll({
                attributes: ['id'],
                where: { employer_id: id }
            }).map((job) => job.id);
            const chatIds = await Chat.findAll({
                attributes: ['id'],
                where: { job_info_id: { [sequelize_1.Op.in]: jobIds } }
            }).map((chat) => chat.id);
            unreadCount = await ChatBody.count({
                where: {
                    chat_id: { [sequelize_1.Op.in]: chatIds },
                    is_readed: 0,
                    sender: 0 // Messages from job seekers
                }
            });
        }
        else {
            throw new ForbiddenError('Unauthorized access');
        }
        // Return response
        res.status(200).json({
            success: true,
            data: { unreadCount }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getAllChats,
    getChatMessages,
    sendMessage,
    startChat,
    getUnreadCount
};
