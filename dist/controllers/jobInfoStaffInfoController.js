"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = __importDefault(require("../models"));
const { JobInfoStaffInfo, JobInfo } = models_1.default;
const errorTypes_1 = __importDefault(require("../utils/errorTypes"));
const { NotFoundError, BadRequestError, ForbiddenError } = errorTypes_1.default;
/**
 * Get all staff info for a job
 * @route GET /api/jobs/:jobId/staff-info
 */
const getStaffInfo = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const staffInfo = await JobInfoStaffInfo.findAll({
            where: { job_info_id: jobId },
            order: [['order_by', 'ASC'], ['created', 'DESC']]
        });
        res.status(200).json({
            success: true,
            data: staffInfo
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get staff info by ID
 * @route GET /api/staff-info/:id
 */
const getStaffInfoById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const staffInfo = await JobInfoStaffInfo.findByPk(id, {
            include: [{
                    model: JobInfo,
                    as: 'jobInfo'
                }]
        });
        if (!staffInfo) {
            throw new NotFoundError('Staff info not found');
        }
        res.status(200).json({
            success: true,
            data: staffInfo
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Create staff info
 * @route POST /api/jobs/:jobId/staff-info
 */
const createStaffInfo = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { post, last_name, first_name, last_name_romaji, first_name_romaji, introduction_text, order_by } = req.body;
        // Check if job exists and user has permission
        const job = await JobInfo.findByPk(jobId);
        if (!job) {
            throw new NotFoundError('Job not found');
        }
        if (job.employer_id !== req.user.id) {
            throw new ForbiddenError('Not authorized to add staff info to this job');
        }
        const staffInfo = await JobInfoStaffInfo.create({
            job_info_id: jobId,
            post,
            last_name,
            first_name,
            last_name_romaji,
            first_name_romaji,
            introduction_text,
            order_by: order_by || 0
        });
        res.status(201).json({
            success: true,
            data: staffInfo
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Update staff info
 * @route PUT /api/staff-info/:id
 */
const updateStaffInfo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { post, last_name, first_name, last_name_romaji, first_name_romaji, introduction_text, order_by } = req.body;
        const staffInfo = await JobInfoStaffInfo.findByPk(id, {
            include: [{
                    model: JobInfo,
                    as: 'jobInfo'
                }]
        });
        if (!staffInfo) {
            throw new NotFoundError('Staff info not found');
        }
        // Check permission
        if (staffInfo.jobInfo.employer_id !== req.user.id) {
            throw new ForbiddenError('Not authorized to update this staff info');
        }
        await staffInfo.update({
            post: post || staffInfo.post,
            last_name: last_name || staffInfo.last_name,
            first_name: first_name || staffInfo.first_name,
            last_name_romaji: last_name_romaji || staffInfo.last_name_romaji,
            first_name_romaji: first_name_romaji || staffInfo.first_name_romaji,
            introduction_text: introduction_text || staffInfo.introduction_text,
            order_by: order_by !== undefined ? order_by : staffInfo.order_by
        });
        res.status(200).json({
            success: true,
            data: staffInfo
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Delete staff info
 * @route DELETE /api/staff-info/:id
 */
const deleteStaffInfo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const staffInfo = await JobInfoStaffInfo.findByPk(id, {
            include: [{
                    model: JobInfo,
                    as: 'jobInfo'
                }]
        });
        if (!staffInfo) {
            throw new NotFoundError('Staff info not found');
        }
        // Check permission
        if (staffInfo.jobInfo.employer_id !== req.user.id) {
            throw new ForbiddenError('Not authorized to delete this staff info');
        }
        await staffInfo.destroy();
        res.status(200).json({
            success: true,
            message: 'Staff info deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getStaffInfo,
    getStaffInfoById,
    createStaffInfo,
    updateStaffInfo,
    deleteStaffInfo
};
