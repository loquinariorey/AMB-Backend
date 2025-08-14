"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = __importDefault(require("../models"));
const { JobInfoClinicPoint, JobInfo } = models_1.default;
const errorTypes_1 = __importDefault(require("../utils/errorTypes"));
const { NotFoundError, BadRequestError, ForbiddenError } = errorTypes_1.default;
/**
 * Get all clinic points for a job
 * @route GET /api/jobs/:jobId/clinic-points
 */
const getClinicPoints = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const clinicPoints = await JobInfoClinicPoint.findAll({
            where: { job_info_id: jobId },
            order: [['created', 'DESC']]
        });
        res.status(200).json({
            success: true,
            data: clinicPoints
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
const getClinicPointById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const clinicPoint = await JobInfoClinicPoint.findByPk(id, {
            include: [{
                    model: JobInfo,
                    as: 'jobInfo'
                }]
        });
        if (!clinicPoint) {
            throw new NotFoundError('Clinic point not found');
        }
        res.status(200).json({
            success: true,
            data: clinicPoint
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
const createClinicPoint = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { title, description } = req.body;
        // Check if job exists and user has permission
        const job = await JobInfo.findByPk(jobId);
        if (!job) {
            throw new NotFoundError('Job not found');
        }
        if (job.employer_id !== req.user.id) {
            throw new ForbiddenError('Not authorized to add clinic points to this job');
        }
        const clinicPoint = await JobInfoClinicPoint.create({
            job_info_id: jobId,
            title,
            description
        });
        res.status(201).json({
            success: true,
            data: clinicPoint
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Update clinic point
 * @route PUT /api/clinic-points/:id
 */
const updateClinicPoint = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const clinicPoint = await JobInfoClinicPoint.findByPk(id, {
            include: [{
                    model: JobInfo,
                    as: 'jobInfo'
                }]
        });
        if (!clinicPoint) {
            throw new NotFoundError('Clinic point not found');
        }
        // Check permission
        if (clinicPoint.jobInfo.employer_id !== req.user.id) {
            throw new ForbiddenError('Not authorized to update this clinic point');
        }
        await clinicPoint.update({
            title: title || clinicPoint.title,
            description: description || clinicPoint.description
        });
        res.status(200).json({
            success: true,
            data: clinicPoint
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
const deleteClinicPoint = async (req, res, next) => {
    try {
        const { id } = req.params;
        const clinicPoint = await JobInfoClinicPoint.findByPk(id, {
            include: [{
                    model: JobInfo,
                    as: 'jobInfo'
                }]
        });
        if (!clinicPoint) {
            throw new NotFoundError('Clinic point not found');
        }
        // Check permission
        if (clinicPoint.jobInfo.employer_id !== req.user.id) {
            throw new ForbiddenError('Not authorized to delete this clinic point');
        }
        await clinicPoint.destroy();
        res.status(200).json({
            success: true,
            message: 'Clinic point deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getClinicPoints,
    getClinicPointById,
    createClinicPoint,
    updateClinicPoint,
    deleteClinicPoint
};
