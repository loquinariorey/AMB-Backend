"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocketServer = void 0;
// socketServer.ts
const socket_io_1 = require("socket.io");
const models_1 = __importDefault(require("../models"));
const { ChatBody } = models_1.default;
let io;
const initSocketServer = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*',
            // methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        // console.log('🔌 Connected:', socket.id);
        socket.on('join', (chatId) => {
            socket.join(`chat_${chatId}`);
            // console.log(`✅ Joined chat room: chat_${chatId}`);
        });
        socket.on('notify_join', (notifyID) => {
            socket.join(`${notifyID}`);
            // console.log(`✅ Notify: ${notifyID}`);
        });
        socket.on('message', async (data) => {
            const { chat_id, sender, body, file_path = '', file_name = '', notifyTo } = data;
            try {
                // ✅ Input validation
                if (!chat_id || sender === undefined || !body || body.trim().length === 0) {
                    socket.emit('errorMessage', 'Missing required fields: chat_id, sender, or body');
                    return;
                }
                if (body.length > 2000) {
                    socket.emit('errorMessage', 'Message too long (max 2000 characters)');
                    return;
                }
                // ✅ Add timeout protection for database operations
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Database operation timeout')), 10000));
                const newMessage = await Promise.race([
                    ChatBody.create({
                        chat_id,
                        sender,
                        body: body.trim(),
                        is_readed: 0,
                        mail_send: 0,
                        chat_flg: 0,
                        file_path,
                        file_name,
                        deleted: null, // Soft delete field
                    }),
                    timeoutPromise
                ]);
                io.to(`chat_${chat_id}`).emit('newMessage', newMessage);
                io.to(`${notifyTo}`).emit('newMessage', newMessage);
                console.log(`📩 Message sent to chat_${chat_id}:`, body.substring(0, 50) + (body.length > 50 ? '...' : ''));
            }
            catch (err) {
                console.error('❌ Message save failed:', err);
                const errorMsg = err?.message === 'Database operation timeout'
                    ? 'Message sending timed out. Please try again.'
                    : 'Failed to send message';
                socket.emit('errorMessage', errorMsg);
            }
        });
        // ✏️ Edit message
        socket.on('editMessage', async (data) => {
            const { messageId, newBody, notifyTo } = data;
            try {
                // ✅ Input validation
                if (!messageId || !newBody || newBody.trim().length === 0) {
                    socket.emit('errorMessage', 'Missing required fields: messageId or newBody');
                    return;
                }
                if (newBody.length > 2000) {
                    socket.emit('errorMessage', 'Message too long (max 2000 characters)');
                    return;
                }
                // ✅ Add timeout protection
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Database operation timeout')), 10000));
                const message = await Promise.race([
                    ChatBody.findByPk(messageId),
                    timeoutPromise
                ]);
                if (!message || message.deleted) {
                    socket.emit('errorMessage', 'Message not found or already deleted');
                    return;
                }
                message.body = newBody.trim();
                message.modified = new Date();
                await Promise.race([message.save(), timeoutPromise]);
                io.to(`chat_${message.chat_id}`).emit('messageUpdated', {
                    id: message.id,
                    body: message.body,
                    modified: message.modified,
                });
                io.to(`${notifyTo}`).emit('newMessage', { type: "updateMessage" });
                console.log(`✏️ Message updated in chat_${message.chat_id}`);
            }
            catch (err) {
                console.error('❌ Edit failed:', err);
                const errorMsg = err?.message === 'Database operation timeout'
                    ? 'Edit operation timed out. Please try again.'
                    : 'Failed to edit message';
                socket.emit('errorMessage', errorMsg);
            }
        });
        // 🗑️ Soft delete message
        socket.on('deleteMessage', async (data) => {
            const { messageId, notifyTo } = data;
            try {
                // ✅ Input validation
                if (!messageId) {
                    socket.emit('errorMessage', 'Missing required field: messageId');
                    return;
                }
                // ✅ Add timeout protection
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Database operation timeout')), 10000));
                const message = await Promise.race([
                    ChatBody.findByPk(messageId),
                    timeoutPromise
                ]);
                if (!message || message.deleted) {
                    socket.emit('errorMessage', 'Message not found or already deleted');
                    return;
                }
                message.deleted = new Date(); // Soft delete
                await Promise.race([message.save(), timeoutPromise]);
                io.to(`chat_${message.chat_id}`).emit('messageDeleted', {
                    id: message.id,
                    deletedAt: message.deleted,
                });
                io.to(`${notifyTo}`).emit('newMessage', { type: "deleteMessage" });
                console.log(`🗑️ Message soft-deleted in chat_${message.chat_id}`);
            }
            catch (err) {
                console.error('❌ Delete failed:', err);
                const errorMsg = err?.message === 'Database operation timeout'
                    ? 'Delete operation timed out. Please try again.'
                    : 'Failed to delete message';
                socket.emit('errorMessage', errorMsg);
            }
        });
        socket.on('disconnect', () => {
            console.log('❌ Disconnected:', socket.id);
        });
    });
};
exports.initSocketServer = initSocketServer;
const getIO = () => io;
exports.getIO = getIO;
