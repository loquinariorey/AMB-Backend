import { Op } from 'sequelize';
import db from '../models';
const { JobInfoClinicPoint, JobInfo } = db;
import errorTypes from '../utils/errorTypes';
const { NotFoundError, BadRequestError, ForbiddenError } = errorTypes;

/**
 * Get all clinic points for a job
 * @route GET /api/jobs/:jobId/clinic-points
 */
const getClinicPoints = async (req: any, res: any, next: any) => {
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
  } catch (error) {
    next(error);
  }
};

/**
 * Get clinic point by ID
 * @route GET /api/clinic-points/:id
 */
const getClinicPointById = async (req: any, res: any, next: any) => {
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
  } catch (error) {
    next(error);
  }
};

/**
 * Create clinic point
 * @route POST /api/jobs/:jobId/clinic-points
 */
const createClinicPoint = async (req: any, res: any, next: any) => {
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
  } catch (error) {
    next(error);
  }
};

/**
 * Update clinic point
 * @route PUT /api/clinic-points/:id
 */
const updateClinicPoint = async (req: any, res: any, next: any) => {
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
  } catch (error) {
    next(error);
  }
};

/**
 * Delete clinic point
 * @route DELETE /api/clinic-points/:id
 */
const deleteClinicPoint = async (req: any, res: any, next: any) => {
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
  } catch (error) {
    next(error);
  }
};

export default {
  getClinicPoints,
  getClinicPointById,
  createClinicPoint,
  updateClinicPoint,
  deleteClinicPoint
};