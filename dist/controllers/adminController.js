"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const models_1 = __importDefault(require("../models"));
const { Admin, Employer, JobSeeker, JobInfo, ApplicationHistory, Chat, JobAnalytic } = models_1.default;
const errorTypes_1 = __importDefault(require("../utils/errorTypes"));
const { NotFoundError, BadRequestError } = errorTypes_1.default;
/**
 * Dashboard statistics for admin
 * @route GET /api/admin/dashboard
 */
const getDashboardStats = async (req, res, next) => {
    try {
        // Calculate date ranges
        const today = new Date();
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        const todayStr = today.toISOString().slice(0, 10);
        const lastMonthStr = lastMonth.toISOString().slice(0, 10);
        // Get user counts
        const employersCount = await Employer.count({
            where: { deleted: null }
        });
        const jobSeekersCount = await JobSeeker.count({
            where: { deleted: null }
        });
        // Get active jobs count
        const activeJobsCount = await JobInfo.count({
            where: {
                deleted: null,
                public_status: 1
            }
        });
        // Get applications count
        const applicationsCount = await ApplicationHistory.count();
        // Get recent registrations
        const recentEmployers = await Employer.findAll({
            attributes: ['id', 'clinic_name', 'email', 'created'],
            where: {
                deleted: null,
                created: { [sequelize_1.Op.gte]: lastMonthStr }
            },
            order: [['created', 'DESC']],
            limit: 5
        });
        const recentJobSeekers = await JobSeeker.findAll({
            attributes: ['id', 'name', 'email', 'created'],
            where: {
                deleted: null,
                created: { [sequelize_1.Op.gte]: lastMonthStr }
            },
            order: [['created', 'DESC']],
            limit: 5
        });
        // Get recent job postings
        const recentJobs = await JobInfo.findAll({
            attributes: ['id', 'job_title', 'job_posting_date', 'public_status'],
            include: [
                {
                    model: Employer,
                    as: 'employer',
                    attributes: ['id', 'clinic_name']
                }
            ],
            where: {
                deleted: null,
                created: { [sequelize_1.Op.gte]: lastMonthStr }
            },
            order: [['created', 'DESC']],
            limit: 5
        });
        // Get recent applications
        const recentApplications = await ApplicationHistory.findAll({
            include: [
                {
                    model: JobInfo,
                    as: 'jobInfo',
                    attributes: ['id', 'job_title']
                },
                {
                    model: JobSeeker,
                    as: 'jobSeeker',
                    attributes: ['id', 'name']
                }
            ],
            order: [['created', 'DESC']],
            limit: 5
        });
        // Get analytics data for dashboard charts
        // const today = new Date();
        const yearStr = today.getFullYear().toString();
        const monthStr = (today.getMonth() + 1).toString().padStart(2, '0');
        const jobViews = await JobAnalytic.findAll({
            attributes: [
                'day',
                [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('search_count')), 'total_views'],
                [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('recruits_count')), 'total_clicks']
            ],
            where: {
                year: yearStr,
                month: monthStr,
                deleted: null
            },
            group: ['day'],
            order: [['day', 'ASC']],
            raw: true
        });
        // Return response
        res.status(200).json({
            success: true,
            data: {
                counts: {
                    employers: employersCount,
                    jobSeekers: jobSeekersCount,
                    activeJobs: activeJobsCount,
                    applications: applicationsCount
                },
                recent: {
                    employers: recentEmployers,
                    jobSeekers: recentJobSeekers,
                    jobs: recentJobs,
                    applications: recentApplications
                },
                analytics: {
                    jobViews
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get all employers for admin
 * @route GET /api/admin/employers
 */
const getAllEmployers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, searchTerm, status, sortBy = 'created', sortOrder = 'DESC' } = req.query;
        // Calculate pagination
        const offset = (page - 1) * limit;
        // Build where condition
        const whereCondition = {};
        // Add search term filter
        if (searchTerm) {
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            whereCondition[sequelize_1.Op.or] = [
                { clinic_name: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                { email: { [sequelize_1.Op.like]: `%${searchTerm}%` } }
            ];
        }
        // Add status filter
        if (status === 'active') {
            // @ts-expect-error TS(2339): Property 'deleted' does not exist on type '{}'.
            whereCondition.deleted = null;
        }
        else if (status === 'inactive') {
            // @ts-expect-error TS(2339): Property 'deleted' does not exist on type '{}'.
            whereCondition.deleted = { [sequelize_1.Op.not]: null };
        }
        // Get employers with pagination
        const { count, rows: employers } = await Employer.findAndCountAll({
            where: whereCondition,
            attributes: { exclude: ['password'] },
            limit: parseInt(limit, 10),
            offset: offset,
            order: [[sortBy, sortOrder]]
        });
        // Calculate total pages
        const totalPages = Math.ceil(count / limit);
        // Return response
        res.status(200).json({
            success: true,
            data: {
                employers,
                pagination: {
                    total: count,
                    page: parseInt(page, 10),
                    limit: parseInt(limit, 10),
                    totalPages
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get all job seekers for admin
 * @route GET /api/admin/job-seekers
 */
const getAllJobSeekers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, searchTerm, status, sortBy = 'created', sortOrder = 'DESC' } = req.query;
        // Calculate pagination
        const offset = (page - 1) * limit;
        // Build where condition
        const whereCondition = {};
        // Add search term filter
        if (searchTerm) {
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            whereCondition[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                { email: { [sequelize_1.Op.like]: `%${searchTerm}%` } }
            ];
        }
        // Add status filter
        if (status === 'active') {
            // @ts-expect-error TS(2339): Property 'deleted' does not exist on type '{}'.
            whereCondition.deleted = null;
        }
        else if (status === 'inactive') {
            // @ts-expect-error TS(2339): Property 'deleted' does not exist on type '{}'.
            whereCondition.deleted = { [sequelize_1.Op.not]: null };
        }
        // Get job seekers with pagination
        const { count, rows: jobSeekers } = await JobSeeker.findAndCountAll({
            where: whereCondition,
            attributes: { exclude: ['password'] },
            limit: parseInt(limit, 10),
            offset: offset,
            order: [[sortBy, sortOrder]]
        });
        // Calculate total pages
        const totalPages = Math.ceil(count / limit);
        // Return response
        res.status(200).json({
            success: true,
            data: {
                jobSeekers,
                pagination: {
                    total: count,
                    page: parseInt(page, 10),
                    limit: parseInt(limit, 10),
                    totalPages
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get all jobs for admin
 * @route GET /api/admin/jobs
 */
const getAllJobs = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, searchTerm, status, sortBy = 'created', sortOrder = 'DESC' } = req.query;
        // Calculate pagination
        const offset = (page - 1) * limit;
        // Build where condition
        const whereCondition = {};
        // Add search term filter
        if (searchTerm) {
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            whereCondition[sequelize_1.Op.or] = [
                { job_title: { [sequelize_1.Op.like]: `%${searchTerm}%` } }
            ];
        }
        // Add status filter
        if (status === 'active') {
            // @ts-expect-error TS(2339): Property 'deleted' does not exist on type '{}'.
            whereCondition.deleted = null;
            // @ts-expect-error TS(2339): Property 'public_status' does not exist on type '{... Remove this comment to see the full error message
            whereCondition.public_status = 1;
        }
        else if (status === 'inactive') {
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            whereCondition[sequelize_1.Op.or] = [
                { deleted: { [sequelize_1.Op.not]: null } },
                { public_status: { [sequelize_1.Op.not]: 1 } }
            ];
        }
        // Get jobs with pagination
        const { count, rows: jobs } = await JobInfo.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: Employer,
                    as: 'employer',
                    attributes: ['id', 'clinic_name']
                }
            ],
            limit: parseInt(limit, 10),
            offset: offset,
            order: [[sortBy, sortOrder]]
        });
        // Calculate total pages
        const totalPages = Math.ceil(count / limit);
        // Return response
        res.status(200).json({
            success: true,
            data: {
                jobs,
                pagination: {
                    total: count,
                    page: parseInt(page, 10),
                    limit: parseInt(limit, 10),
                    totalPages
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Create admin user
 * @route POST /api/admin/create
 */
const createAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Check if admin exists
        const existingAdmin = await Admin.findOne({ where: { email } });
        if (existingAdmin) {
            throw new BadRequestError('Admin with that email already exists');
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Create admin
        const admin = await Admin.create({
            email,
            password: hashedPassword
        });
        // Return response
        res.status(201).json({
            success: true,
            data: {
                id: admin.id,
                email: admin.email,
                created: admin.created
            }
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Deactivate a user (employer or job seeker)
 * @route PUT /api/admin/users/:id/deactivate
 */
const deactivateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userType } = req.body;
        if (!['employer', 'jobSeeker'].includes(userType)) {
            throw new BadRequestError('Invalid user type. Must be "employer" or "jobSeeker"');
        }
        let user;
        if (userType === 'employer') {
            user = await Employer.findByPk(id);
        }
        else {
            user = await JobSeeker.findByPk(id);
        }
        if (!user) {
            throw new NotFoundError('User not found');
        }
        // Soft delete the user
        await user.update({
            deleted: new Date()
        });
        // If it's an employer, also deactivate their jobs
        if (userType === 'employer') {
            await JobInfo.update({
                deleted: new Date(),
                public_status: 0
            }, {
                where: { employer_id: id, deleted: null }
            });
        }
        // Return response
        res.status(200).json({
            success: true,
            message: `${userType === 'employer' ? 'Employer' : 'Job Seeker'} deactivated successfully`
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Reactivate a user (employer or job seeker)
 * @route PUT /api/admin/users/:id/reactivate
 */
const reactivateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userType } = req.body;
        if (!['employer', 'jobSeeker'].includes(userType)) {
            throw new BadRequestError('Invalid user type. Must be "employer" or "jobSeeker"');
        }
        let user;
        if (userType === 'employer') {
            user = await Employer.findByPk(id);
        }
        else {
            user = await JobSeeker.findByPk(id);
        }
        if (!user) {
            throw new NotFoundError('User not found');
        }
        // Reactivate the user
        await user.update({
            deleted: null
        });
        // Return response
        res.status(200).json({
            success: true,
            message: `${userType === 'employer' ? 'Employer' : 'Job Seeker'} reactivated successfully`
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get analytics data
 * @route GET /api/admin/analytics
 */
const getAnalytics = async (req, res, next) => {
    try {
        const { period = 'month' } = req.query;
        // Calculate date range
        const today = new Date();
        const year = today.getFullYear().toString();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        // Define grouping based on period
        let groupBy, whereCondition;
        if (period === 'day') {
            // Day-wise data for current month
            groupBy = ['year', 'month', 'day'];
            whereCondition = { year, month };
        }
        else if (period === 'month') {
            // Month-wise data for current year
            groupBy = ['year', 'month'];
            whereCondition = { year };
        }
        else if (period === 'year') {
            // Year-wise data
            groupBy = ['year'];
            whereCondition = {};
        }
        else {
            throw new BadRequestError('Invalid period. Use "day", "month", or "year"');
        }
        // Get aggregate job views and application data
        const jobAnalytics = await JobAnalytic.findAll({
            attributes: [
                ...groupBy,
                [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('search_count')), 'total_views'],
                [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('recruits_count')), 'total_clicks'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('job_info_id')), 'job_count']
            ],
            where: whereCondition,
            group: groupBy,
            order: groupBy.map(field => [field, 'ASC']),
            raw: true
        });
        // Get user registration data
        let dateFormat;
        if (period === 'day') {
            dateFormat = '%Y-%m-%d';
        }
        else if (period === 'month') {
            dateFormat = '%Y-%m';
        }
        else {
            dateFormat = '%Y';
        }
        // Query for employers
        const employerRegistrations = await Employer.findAll({
            attributes: [
                [sequelize_1.Sequelize.fn('DATE_FORMAT', sequelize_1.Sequelize.col('created'), dateFormat), 'date'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
            ],
            where: {
                created: { [sequelize_1.Op.gte]: getStartDateByPeriod(period) }
            },
            group: ['date'],
            order: [[sequelize_1.Sequelize.literal('date'), 'ASC']],
            raw: true
        });
        // Query for job seekers
        const jobSeekerRegistrations = await JobSeeker.findAll({
            attributes: [
                [sequelize_1.Sequelize.fn('DATE_FORMAT', sequelize_1.Sequelize.col('created'), dateFormat), 'date'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
            ],
            where: {
                created: { [sequelize_1.Op.gte]: getStartDateByPeriod(period) }
            },
            group: ['date'],
            order: [[sequelize_1.Sequelize.literal('date'), 'ASC']],
            raw: true
        });
        // Query for job postings
        const jobPostings = await JobInfo.findAll({
            attributes: [
                [sequelize_1.Sequelize.fn('DATE_FORMAT', sequelize_1.Sequelize.col('created'), dateFormat), 'date'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
            ],
            where: {
                created: { [sequelize_1.Op.gte]: getStartDateByPeriod(period) }
            },
            group: ['date'],
            order: [[sequelize_1.Sequelize.literal('date'), 'ASC']],
            raw: true
        });
        // Query for applications
        const applications = await ApplicationHistory.findAll({
            attributes: [
                [sequelize_1.Sequelize.fn('DATE_FORMAT', sequelize_1.Sequelize.col('created'), dateFormat), 'date'],
                [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
            ],
            where: {
                created: { [sequelize_1.Op.gte]: getStartDateByPeriod(period) }
            },
            group: ['date'],
            order: [[sequelize_1.Sequelize.literal('date'), 'ASC']],
            raw: true
        });
        // Return response
        res.status(200).json({
            success: true,
            data: {
                jobAnalytics,
                registrations: {
                    employers: employerRegistrations,
                    jobSeekers: jobSeekerRegistrations
                },
                activities: {
                    jobPostings,
                    applications
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Helper to get start date based on period
 */
function getStartDateByPeriod(period) {
    const today = new Date();
    if (period === 'day') {
        // Start from beginning of current month
        return new Date(today.getFullYear(), today.getMonth(), 1);
    }
    else if (period === 'month') {
        // Start from beginning of current year
        return new Date(today.getFullYear(), 0, 1);
    }
    else {
        // Start from 5 years ago for yearly data
        return new Date(today.getFullYear() - 5, 0, 1);
    }
}
exports.default = {
    getDashboardStats,
    getAllEmployers,
    getAllJobSeekers,
    getAllJobs,
    createAdmin,
    deactivateUser,
    reactivateUser,
    getAnalytics
};
