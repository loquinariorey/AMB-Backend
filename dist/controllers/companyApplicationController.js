"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../models"));
const { CompanyApplication, JobInfo } = models_1.default;
const errorTypes_1 = __importDefault(require("../utils/errorTypes"));
const { NotFoundError, BadRequestError, ForbiddenError } = errorTypes_1.default;
/**
 * Get all clinic points for a job
 * @route GET /api/jobs/:jobId/clinic-points
 */
const getCompanyApplications = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, searchTerm, } = req.query;
        const offset = (page - 1) * limit;
        const whereCondition = {};
        if (searchTerm) {
            whereCondition[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                { company_name: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                { email: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                { telephone: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                { inquiry: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
            ];
        }
        const { count, rows: companyApplications } = await CompanyApplication.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit, 10),
            offset: offset,
        });
        const totalPages = Math.ceil(count / limit);
        res.status(200).json({
            success: true,
            data: {
                companyApplications,
                pagination: {
                    total: count,
                    page: parseInt(page, 10),
                    limit: parseInt(limit, 10),
                    totalPages,
                },
            }
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get clinic point by ID
 * @route GET /api/clinic-points/:id
 */
const getCompanyApplicationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const companyApplication = await CompanyApplication.findByPk(id);
        if (!companyApplication) {
            throw new NotFoundError('CompanyApplication not found');
        }
        res.status(200).json({
            success: true,
            data: companyApplication
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Create clinic point
 * @route POST /api/jobs/:jobId/clinic-points
 */
const createCompanyApplication = async (req, res, next) => {
    try {
        const { name, email, inquiry } = req.body;
        const companyApplication = await CompanyApplication.create(req.body);
        // Send success response immediately
        res.status(201).json({
            success: true,
            data: companyApplication
        });
        // Send emails asynchronously in the background
        setImmediate(async () => {
            try {
                const nodemailer = require('nodemailer');
                const smtpPort = parseInt(process.env.SMTP_PORT || '587');
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: smtpPort,
                    secure: false,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });
                const subject = '企業ご担当者様お申込みありがとうございます';
                const text = `\nこの度はお申込みいただき誠にありがとうございます。\n\n【受付確認】\nご入力いただいた内容で受付いたしました。\n\n【今後の流れ】\n担当者より改めてご連絡させていただきますので、今しばらくお待ちください。\n\n【お問い合わせ先】\nご不明点等ございましたら、下記までご連絡ください。\nリユース転職運営事務局\nhttps://reuse-tenshoku.com/CONTACT\n\n今後ともどうぞよろしくお願いいたします。\n`;
                await transporter.sendMail({
                    from: '"Reuse-tenshoku" <your-email@gmail.com>',
                    to: email,
                    subject,
                    text,
                });
                const adminsubject = `${name}さんからお問い合わせがありました。`;
                const admintext = `\nご入力内容\n\nお名前：${name}\nメールアドレス：${email}\nお問い合わせ内容${inquiry}\n`;
                await transporter.sendMail({
                    from: '"Reuse-tenshoku" <your-email@gmail.com>',
                    to: "admin@example.com",
                    subject: adminsubject,
                    text: admintext,
                });
                console.log('Company application emails sent successfully');
            }
            catch (mailErr) {
                // Log but do not affect the main response
                console.error('Failed to send company application confirmation email:', mailErr);
            }
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Delete clinic point
 * @route DELETE /api/clinic-points/:id
 */
const deleteCompanyApplication = async (req, res, next) => {
    try {
        const { id } = req.params;
        const companyApplication = await CompanyApplication.findByPk(id);
        if (!companyApplication) {
            throw new NotFoundError('CompanyApplication not found');
        }
        await companyApplication.destroy();
        res.status(200).json({
            success: true,
            message: 'CompanyApplication deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getCompanyApplications,
    getCompanyApplicationById,
    createCompanyApplication,
    deleteCompanyApplication
};
