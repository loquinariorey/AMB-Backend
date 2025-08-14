import { Op, Sequelize } from "sequelize";
import * as bcrypt from 'bcryptjs';
import db from '../models';
const {  ApplicationHistory, JobInfo, JobSeeker, Chat, ChatBody, Employer, EmploymentType, Feature, JobAnalytic } = db;
import errorTypes from '../utils/errorTypes';
const { NotFoundError, BadRequestError, ForbiddenError, UnauthorizedError } = errorTypes;


/**
 * Get employer profile
 * @route GET /api/employers/profile
 */
const getProfile = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.user;
    
    const employer = await Employer.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!employer || employer.deleted) {
      throw new NotFoundError('Employer not found');
    }
    
    // Return response
    res.status(200).json({
      success: true,
      data: employer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update employer profile
 * @route PUT /api/employers/profile
 */
const updateProfile = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.user;
    const { 
      clinic_name, clinic_name_kana, business_form, 
      zip, prefectures, city, closest_station, 
      tel, home_page_url, access, director_name, 
      employee_number, establishment_year, business, capital_stock 
    } = req.body;
    
    const employer = await Employer.findByPk(id);
    
    if (!employer || employer.deleted) {
      throw new NotFoundError('Employer not found');
    }
    
    // Update employer data
    await employer.update({
      clinic_name,
      clinic_name_kana,
      business_form,
      zip,
      prefectures,
      city,
      closest_station,
      tel,
      home_page_url,
      access,
      director_name,
      employee_number,
      establishment_year,
      business,
      capital_stock,
      modified: new Date()
    });
    
    // Return response
    res.status(200).json({
      success: true,
      data: {
        ...employer.toJSON(),
        password: undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change email address
 * @route PUT /api/employers/change-email
 */
const changeEmail = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.user;
    const { newEmail, password } = req.body;
    
    // Validate email
    if (!newEmail || !isValidEmail(newEmail)) {
      throw new BadRequestError('Invalid email format');
    }
    
    // Find employer
    const employer = await Employer.findByPk(id);
    
    if (!employer || employer.deleted) {
      throw new NotFoundError('Employer not found');
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, employer.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid password');
    }
    
    // Check if the new email already exists
    const existingEmployer = await Employer.findOne({
      where: { email: newEmail }
    });
    
    if (existingEmployer) {
      throw new BadRequestError('Email already in use');
    }
    
    // Update email
    await employer.update({
      email: newEmail,
      modified: new Date()
    });
    
    // Return response
    res.status(200).json({
      success: true,
      message: 'Email updated successfully',
      data: {
        email: newEmail
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get employer jobs
 * @route GET /api/employers/jobs
 */
const getEmployerJobs = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.user;
    const { status } = req.query;
    
    // Build where condition
    const whereCondition: any = {
      employer_id: id
    };
    
    if (status === 'active') {
      whereCondition.deleted = null;
      whereCondition.public_status = 1;
    } else if (status === 'inactive') {
      whereCondition[Op.or] = [
        { deleted: { [Op.not]: null } },
        { public_status: { [Op.not]: 1 } }
      ];
    }
    
    // Get all jobs for the employer
    const jobs = await JobInfo.findAll({
      where: whereCondition,
      include: [
        {
          model: EmploymentType,
          as: 'employmentType'
        },
        {
          model: Feature,
          as: 'features',
          through: { attributes: [] }
        }
      ],
      order: [['created', 'DESC']]
    });
    
    // Get application count for each job
    const jobsWithApplicationCount = await Promise.all(
      jobs.map(async (job: any) => {
        const applicationCount = await ApplicationHistory.count({
          where: { job_info_id: job.id }
        });
        
        return {
          ...job.toJSON(),
          applicationCount
        };
      })
    );
    
    // Return response
    res.status(200).json({
      success: true,
      data: jobsWithApplicationCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get employer dashboard stats
 * @route GET /api/employers/dashboard
 */
const getEmployerDashboard = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.user;
    
    // Get job count
    const activeJobsCount = await JobInfo.count({
      where: {
        employer_id: id,
        deleted: null,
        public_status: 1
      }
    });
    
    const inactiveJobsCount = await JobInfo.count({
      where: {
        employer_id: id,
        [Op.or]: [
          { deleted: { [Op.not]: null } },
          { public_status: { [Op.not]: 1 } }
        ]
      }
    });
    
    // Get application count
    const jobIds = await JobInfo.findAll({
      attributes: ['id'],
      where: { employer_id: id }
    }).map((job: any) => job.id);
    
    const applicationsCount = await ApplicationHistory.count({
      where: {
        job_info_id: { [Op.in]: jobIds }
      }
    });
    
    // Get recent applications
    const recentApplications = await ApplicationHistory.findAll({
      where: {
        job_info_id: { [Op.in]: jobIds }
      },
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
    
    // Get analytics for jobs
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    
    // Aggregate job analytics
    const jobAnalytics = await JobAnalytic.findAll({
      attributes: [
        'job_info_id',
        [Sequelize.fn('SUM', Sequelize.col('search_count')), 'total_views'],
        [Sequelize.fn('SUM', Sequelize.col('recruits_count')), 'total_clicks']
      ],
      where: {
        job_info_id: { [Op.in]: jobIds },
        year,
        month,
        deleted: null
      },
      group: ['job_info_id'],
      order: [[Sequelize.literal('total_views'), 'DESC']],
      limit: 10,
      raw: true
    });
    
    // Get job details for the analytics
    const jobDetails = await JobInfo.findAll({
      attributes: ['id', 'job_title'],
      where: {
        id: { [Op.in]: jobAnalytics.map((analytics: any) => analytics.job_info_id) }
      },
      raw: true
    });
    
    // Merge job analytics with job details
    const jobPerformance = jobAnalytics.map((analytics: any) => {
      const job = jobDetails.find((j: any) => j.id === analytics.job_info_id);
      return {
        ...analytics,
        job_title: job ? job.job_title : 'Unknown Job'
      };
    });
    
    // Return response
    res.status(200).json({
      success: true,
      data: {
        counts: {
          activeJobs: activeJobsCount,
          inactiveJobs: inactiveJobsCount,
          applications: applicationsCount
        },
        recentApplications,
        jobPerformance
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllEmployers = async (req: any, res: any, next: any) => {
  try {
    const {
      page = 1,
      limit = 10,
      prefectures,
      searchTerm,
      sortBy = "created",
      sortOrder = "DESC",
    } = req.query;

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Build where condition
    const whereCondition: any = { deleted: null };
    if (prefectures) whereCondition.prefectures = prefectures;
    // Add search term filter
    if (searchTerm) {
      whereCondition[Op.or] = [
        { clinic_name: { [Op.like]: `%${searchTerm}%` } },
        { clinic_name_kana: { [Op.like]: `%${searchTerm}%` } },
        { email: { [Op.like]: `%${searchTerm}%` } },
        { city: { [Op.like]: `%${searchTerm}%` } },
        { business: { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    const { count, rows: employers } = await Employer.findAndCountAll({
      where: whereCondition,
      distinct: true,
      limit: parseInt(limit, 10),
      offset: offset,
      order: [[sortBy, sortOrder]],
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
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllEmployerInfos = async (req: any, res: any, next: any) => {
  try {
    const whereCondition = { deleted: null };
    const { count, rows: employers } = await Employer.findAndCountAll({
      where: whereCondition,
      attributes: ['id', 'clinic_name'],
      distinct: true,
    });

    // Return response
    res.status(200).json({
      success: true,
      data: {
        count: count,
        employers,
      },
    });
  } catch (error) {
    next(error);
  }
};
const getEmployerById = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    
    const employer = await Employer.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!employer || employer.deleted) {
      throw new NotFoundError('Employer not found');
    }
    
    // Return response
    res.status(200).json({
      success: true,
      data: employer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to validate email format
 */
function isValidEmail(email: any) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default {
  getProfile,
  updateProfile,
  changeEmail,
  getEmployerJobs,
  getEmployerDashboard,
  getEmployerById,
  getAllEmployerInfos,
  getAllEmployers
};