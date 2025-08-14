"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../models"));
const { ApplicationHistory, JobInfo, JobSeeker, Chat, ChatBody, Employer, Feature, RecruitingCriteria, ImagePath } = models_1.default;
const errorTypes_1 = __importDefault(require("../utils/errorTypes"));
const { NotFoundError, BadRequestError, ForbiddenError } = errorTypes_1.default;
/**
 * Apply for a job
 * @route POST /api/applications
 */
const applyForJob = async (req, res, next) => {
    try {
        const { id: jobSeekerId } = req.user;
        const { job_info_id } = req.body;
        const application_message = "応募しました。";
        if (!job_info_id) {
            throw new BadRequestError('Job ID is required');
        }
        // ✅ Find job
        const job = await JobInfo.findByPk(job_info_id);
        if (!job || job.deleted || job.public_status !== 1) {
            throw new NotFoundError('Job not found or not active');
        }
        // ✅ Determine employer_id based on template
        const isAgency = job.job_detail_page_template_id === 2;
        // ✅ Check if already applied
        const existingApplication = await ApplicationHistory.findOne({
            where: {
                job_info_id,
                job_seeker_id: jobSeekerId
            }
        });
        if (existingApplication) {
            throw new BadRequestError('You have already applied for this job');
        }
        // ✅ Create or get existing chat
        let chat = await Chat.findOne({
            where: {
                job_info_id,
                job_seeker_id: jobSeekerId
            }
        });
        if (!chat) {
            chat = await Chat.create({
                job_info_id,
                job_seeker_id: jobSeekerId,
                job_title: job.job_title,
                agency: isAgency, // 🔥 Save target employer/admin here
                is_send_privacy: 0
            });
        }
        // ✅ Create application message
        const nextMessageNumber = (await ChatBody.count({
            where: { chat_id: chat.id }
        })) + 1;
        await ChatBody.create({
            chat_id: chat.id,
            no: nextMessageNumber,
            sender: 1, // 🔁 1 = job seeker
            body: application_message,
            is_readed: 0,
            mail_send: 0,
            chat_flg: 1, // 🔥 Application type
            deleted: null
        });
        // ✅ Save application history
        const application = await ApplicationHistory.create({
            job_info_id,
            job_seeker_id: jobSeekerId,
            job_title: job.job_title,
            chat_id: chat.id
        });
        res.status(201).json({
            success: true,
            data: application,
            message: 'Application submitted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
const getAllApplications = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, searchTerm, job_seeker_id, employer_id, jobType } = req.query;
        // Calculate pagination
        const offset = (page - 1) * limit;
        const whereCondition = {};
        // Search Term
        if (searchTerm) {
            whereCondition[sequelize_1.Op.or] = [
                { job_title: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                { '$jobSeeker.name$': { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                { '$jobInfo.pay$': { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                { '$jobInfo.employer.clinic_name$': { [sequelize_1.Op.like]: `%${searchTerm}%` } }
            ];
        }
        if (job_seeker_id) {
            whereCondition[sequelize_1.Op.or] = [
                { job_seeker_id: job_seeker_id },
            ];
        }
        if (employer_id) {
            // Get employer's job IDs
            const jobs = await JobInfo.findAll({
                attributes: ["id"],
                where: { employer_id: employer_id },
                raw: true, // Ensures only plain data objects are returned
            });
            // Extract job IDs from results
            const jobIds = jobs.map((job) => job.id);
            if (jobIds.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: []
                });
            }
            whereCondition.job_info_id = { [sequelize_1.Op.in]: jobIds };
        }
        // Get all applications with job info
        const { count, rows: applications } = await ApplicationHistory.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit, 10),
            offset: offset,
            distinct: true,
            include: [
                {
                    model: JobSeeker,
                    as: "jobSeeker",
                    required: true,
                    include: [
                        {
                            model: ImagePath,
                            as: 'avatar',
                            required: false,
                            where: { posting_category: 1 }, // 👤 employer avatar
                            attributes: ['entity_path'],
                        },
                    ],
                },
                {
                    model: JobInfo,
                    as: 'jobInfo',
                    required: true,
                    where: jobType ? { job_detail_page_template_id: jobType } : undefined,
                    include: [
                        {
                            model: Employer,
                            as: 'employer',
                            required: true,
                            attributes: ['id', 'clinic_name', "prefectures", "city", "zip", "tel"],
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
                        // {
                        //   model: Feature,
                        //   as: "features",
                        // },
                        {
                            model: RecruitingCriteria,
                            as: "recruitingCriterias",
                        },
                    ],
                },
                {
                    model: Chat,
                    as: 'chat',
                    include: [
                        {
                            model: ChatBody,
                            as: 'messages',
                            limit: 1,
                            order: [['created', 'DESC']]
                        }
                    ]
                }
            ],
            order: [['created', 'DESC']]
        });
        // Calculate total pages
        const totalPages = Math.ceil(count / limit);
        // Return response
        res.status(200).json({
            success: true,
            data: {
                applications,
                pagination: {
                    total: count,
                    page: parseInt(page, 10),
                    limit: parseInt(limit, 10),
                    totalPages,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get all applications for job seeker
 * @route GET /api/applications/job-seeker
 */
const getJobSeekerApplications = async (req, res, next) => {
    try {
        const { id: jobSeekerId } = req.user;
        // Get all applications with job info
        const applications = await ApplicationHistory.findAll({
            where: { job_seeker_id: jobSeekerId },
            include: [
                {
                    model: JobInfo,
                    as: 'jobInfo',
                    include: [
                        {
                            model: Employer,
                            as: 'employer',
                            attributes: ['id', 'clinic_name', "prefectures", "city", "zip", "tel"],
                            include: [
                                {
                                    model: ImagePath,
                                    as: 'avatar',
                                    required: false,
                                    where: { posting_category: 2 }, // 👤 employer avatar
                                    attributes: ['entity_path'],
                                },
                            ],
                        }
                    ]
                },
                {
                    model: Chat,
                    as: 'chat',
                    include: [
                        {
                            model: ChatBody,
                            as: 'messages',
                            limit: 1,
                            order: [['created', 'DESC']]
                        }
                    ]
                }
            ],
            order: [['created', 'DESC']]
        });
        // Return response
        res.status(200).json({
            success: true,
            data: applications
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get all applications for employer's jobs
 * @route GET /api/applications/employer
 */
const getEmployerApplications = async (req, res, next) => {
    try {
        const { id: employerId } = req.user;
        // Get employer's job IDs
        const jobs = await JobInfo.findAll({
            attributes: ["id"],
            where: { employer_id: employerId },
            raw: true,
        });
        const jobIds = jobs.map((job) => job.id);
        if (jobIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }
        const applications = await ApplicationHistory.findAll({
            where: { job_info_id: { [sequelize_1.Op.in]: jobIds } },
            include: [
                {
                    model: JobInfo,
                    as: 'jobInfo',
                    include: [
                        {
                            model: Employer,
                            as: 'employer',
                            attributes: ['id', 'clinic_name', "prefectures", "city", "zip", "tel"],
                            include: [
                                {
                                    model: ImagePath,
                                    as: 'avatar',
                                    required: false,
                                    where: { posting_category: 2 }, // 👤 employer avatar
                                    attributes: ['entity_path'],
                                },
                            ],
                            // include: [
                            //   {
                            //     model: ImagePath,
                            //     as: 'avatar',
                            //     required: false,
                            //     where: { posting_category: 7 }, // ✅ 7 for employer avatar
                            //     attributes: ['entity_path']
                            //   }
                            // ]
                        }
                    ]
                },
                {
                    model: JobSeeker,
                    as: 'jobSeeker',
                    include: [
                        {
                            model: ImagePath,
                            as: 'avatar',
                            required: false,
                            where: { posting_category: 1 }, // ✅ 6 for jobseeker avatar
                            attributes: ['entity_path']
                        }
                    ]
                },
                {
                    model: Chat,
                    as: 'chat',
                    include: [
                        {
                            model: ChatBody,
                            as: 'messages',
                            limit: 1,
                            order: [['created', 'DESC']]
                        }
                    ]
                }
            ],
            order: [['created', 'DESC']]
        });
        res.status(200).json({
            success: true,
            data: applications
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get application details
 * @route GET /api/applications/:id
 */
const getApplicationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;
        // Find application
        const application = await ApplicationHistory.findByPk(id, {
            include: [
                {
                    model: JobInfo,
                    as: 'jobInfo',
                    include: [
                        {
                            model: Employer,
                            as: 'employer',
                            attributes: ['id', 'clinic_name'],
                            include: [
                                {
                                    model: ImagePath,
                                    as: 'avatar',
                                    required: false,
                                    where: { posting_category: 2 }, // 👤 employer avatar
                                    attributes: ['entity_path'],
                                },
                            ],
                        }
                    ]
                },
                {
                    model: JobSeeker,
                    as: 'jobSeeker',
                    attributes: ['id', 'name', 'email', 'tel', 'birthdate', 'prefectures'],
                    include: [
                        {
                            model: ImagePath,
                            as: 'avatar',
                            required: false,
                            where: { posting_category: 1 }, // 👤 employer avatar
                            attributes: ['entity_path'],
                        },
                    ],
                },
                {
                    model: Chat,
                    as: 'chat',
                    include: [
                        {
                            model: ChatBody,
                            as: 'messages',
                            order: [['created', 'ASC']]
                        }
                    ]
                }
            ]
        });
        if (!application) {
            throw new NotFoundError('Application not found');
        }
        // Check access permissions
        if ((role === 'jobSeeker' && application.job_seeker_id !== userId) ||
            (role === 'employer' && application.jobInfo.employer_id !== userId)) {
            throw new ForbiddenError('You do not have access to this application');
        }
        // Return response
        res.status(200).json({
            success: true,
            data: application
        });
    }
    catch (error) {
        next(error);
    }
};
const getApplicationByJobInfoId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;
        // Find application
        const application = await ApplicationHistory.findAll({
            include: [
                {
                    model: JobInfo,
                    as: 'jobInfo',
                    include: [
                        {
                            model: Employer,
                            as: 'employer',
                            attributes: ['id', 'clinic_name'],
                            include: [
                                {
                                    model: ImagePath,
                                    as: 'avatar',
                                    required: false,
                                    where: { posting_category: 2 }, // 👤 employer avatar
                                    attributes: ['entity_path'],
                                },
                            ],
                        }
                    ], where: { id: id }
                },
                {
                    model: JobSeeker,
                    as: 'jobSeeker',
                    attributes: ['id', 'name', 'email', 'tel', 'birthdate', 'prefectures'],
                    include: [
                        {
                            model: ImagePath,
                            as: 'avatar',
                            required: false,
                            where: { posting_category: 1 },
                            attributes: ['entity_path'],
                        },
                    ],
                },
                {
                    model: Chat,
                    as: 'chat',
                    include: [
                        {
                            model: ChatBody,
                            as: 'messages',
                            order: [['created', 'ASC']]
                        }
                    ]
                }
            ]
        });
        if (!application) {
            throw new NotFoundError('Application not found');
        }
        // Return response
        res.status(200).json({
            success: true,
            data: application
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getAllApplications,
    applyForJob,
    getJobSeekerApplications,
    getEmployerApplications,
    getApplicationById,
    getApplicationByJobInfoId
};
