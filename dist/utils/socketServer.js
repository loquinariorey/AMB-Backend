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
                const newMessage = await ChatBody.create({
                    chat_id,
                    sender,
                    body,
                    is_readed: 0,
                    mail_send: 0,
                    chat_flg: 0,
                    file_path,
                    file_name,
                    deleted: null, // Soft delete field
                });
                io.to(`chat_${chat_id}`).emit('newMessage', newMessage);
                io.to(`${notifyTo}`).emit('newMessage', newMessage);
                console.log(`📩 Message sent to chat_${chat_id}:`, body);
            }
            catch (err) {
                console.error('❌ Message save failed:', err);
                socket.emit('errorMessage', 'Failed to send message');
            }
        });
        // ✏️ Edit message
        socket.on('editMessage', async (data) => {
            const { messageId, newBody, notifyTo } = data;
            try {
                const message = await ChatBody.findByPk(messageId);
                if (!message || message.deleted)
                    return;
                message.body = newBody;
                message.modified = new Date();
                await message.save();
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
                socket.emit('errorMessage', 'Failed to edit message');
            }
        });
        // 🗑️ Soft delete message
        socket.on('deleteMessage', async (data) => {
            const { messageId, notifyTo } = data;
            try {
                const message = await ChatBody.findByPk(messageId);
                if (!message || message.deleted)
                    return;
                message.deleted = new Date(); // Soft delete
                await message.save();
                io.to(`chat_${message.chat_id}`).emit('messageDeleted', {
                    id: message.id,
                    deletedAt: message.deleted,
                });
                io.to(`${notifyTo}`).emit('newMessage', { type: "deleteMessage" });
                console.log(`🗑️ Message soft-deleted in chat_${message.chat_id}`);
            }
            catch (err) {
                console.error('❌ Delete failed:', err);
                socket.emit('errorMessage', 'Failed to delete message');
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
