import { Op, Sequelize, where } from "sequelize";
import bcrypt from "bcryptjs";
import db from "../models";
const {
  JobSeeker,
  EmploymentType,
  DesiredCondition,
  JobSeekersEmploymentType,
  JobSeekersDesiredCondition,
  FavoriteJob,
  ImagePath,
  JobInfo,
} = db;
import errorTypes from "../utils/errorTypes";
const { NotFoundError, BadRequestError, ForbiddenError } = errorTypes;
import log from "../utils/logger";
const { logger, httpLogger } = log;

/**
 * Get job seeker profile
 * @route GET /api/job-seekers/profile
 */
const getProfile = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.user;

    const jobSeeker = await JobSeeker.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: EmploymentType,
          as: "employmentTypes",
          through: { attributes: [] },
        },
        {
          model: DesiredCondition,
          as: "desiredConditions",
          through: { attributes: ["id", "body"] },
        },
      ],
    });

    if (!jobSeeker || jobSeeker.deleted) {
      throw new NotFoundError("Job seeker not found");
    }

    // Return response
    res.status(200).json({
      success: true,
      data: jobSeeker,
    });
  } catch (error) {
    next(error);
  }
};
  
/**
 * Update job seeker profile
 * @route PUT /api/job-seekers/profile
 */
const updateProfile = async (req: any, res: any, next: any) => {
  try {
    const {id} = req.params;
    const {
      name,
      name_kana,
      birthdate,
      sex,
      zip,
      prefectures,
      tel,
      desired_working_place_1,
      desired_working_place_2,
      other_desired_criteria,
      employment_types,
      desired_conditions,
    } = req.body;

    const jobSeeker = await JobSeeker.findByPk(id);

    if (!jobSeeker || jobSeeker.deleted) {
      throw new NotFoundError("Job seeker not found");
    }

    // Start transaction
    // const transaction = await models.sequelize.transaction();

    try {
      // Update basic profile info
      await jobSeeker.update(
        {
          name,
          name_kana,
          birthdate,
          sex,
          zip,
          prefectures,
          tel,
          desired_working_place_1,
          desired_working_place_2,
          other_desired_criteria,
          modified: new Date(),
        },
        // { transaction }
      );

      // Update employment types if provided
      if (employment_types && Array.isArray(employment_types)) {
        // Remove existing employment types first
        await JobSeekersEmploymentType.destroy({
          where: { job_seeker_id: id },
          // transaction,
        });

        // Add new employment types
        if (employment_types.length > 0) {
          const employmentTypeData = employment_types.map((typeId) => ({
            job_seeker_id: id,
            employment_type_id: typeId,
          }));

          await JobSeekersEmploymentType.bulkCreate(employmentTypeData, 
            // {transaction,}
          );
        }
      }

      // Update desired conditions if provided
      if (desired_conditions && Array.isArray(desired_conditions)) {
        // Remove existing desired conditions first
        await JobSeekersDesiredCondition.destroy({
          where: { job_seeker_id: id },
          // transaction,
        });

        // Add new desired conditions
        if (desired_conditions.length > 0) {
          const desiredConditionData = desired_conditions.map((condition) => ({
            job_seeker_id: id,
            desired_condition_id: condition.id,
            body: condition.body || null,
          }));

          await JobSeekersDesiredCondition.bulkCreate(desiredConditionData, 
            // {transaction,}
          );
        }
      }

      // Commit transaction
      // await transaction.commit();

      // Get updated profile
      const updatedJobSeeker = await JobSeeker.findByPk(id, {
        attributes: { exclude: ["password"] },
        include: [
          {
            model: EmploymentType,
            as: "employmentTypes",
            through: { attributes: [] },
          },
          {
            model: DesiredCondition,
            as: "desiredConditions",
            through: { attributes: ["id", "body"] },
          },
        ],
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedJobSeeker,
      });
    } catch (error) {
      // Rollback transaction on error
      // await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Change email address
 * @route PUT /api/job-seekers/change-email
 */
const changeEmail = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.user;
    const { newEmail, password } = req.body;

    // Validate email
    if (!newEmail || !isValidEmail(newEmail)) {
      throw new BadRequestError("Invalid email format");
    }

    // Find job seeker
    const jobSeeker = await JobSeeker.findByPk(id);

    if (!jobSeeker || jobSeeker.deleted) {
      throw new NotFoundError("Job seeker not found");
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, jobSeeker.password);
    if (!isMatch) {
      // @ts-expect-error TS(2304): Cannot find name 'UnauthorizedError'.
      throw new UnauthorizedError("Invalid password");
    }

    // Check if the new email already exists
    const existingJobSeeker = await JobSeeker.findOne({
      where: { email: newEmail },
    });

    if (existingJobSeeker) {
      throw new BadRequestError("Email already in use");
    }

    // Update email
    await jobSeeker.update({
      email: newEmail,
      modified: new Date(),
    });

    // Return response
    res.status(200).json({
      success: true,
      message: "Email updated successfully",
      data: {
        email: newEmail,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get favorite jobs
 * @route GET /api/job-seekers/favorite-jobs
 */
const getFavoriteJobs = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.user;

    // Get all favorite jobs
    const favoriteJobs = await FavoriteJob.findAll({
      where: { job_seeker_id: id },
      include: [
        {
          model: JobInfo,
          as: "jobInfo",
          include: [
            {
              // @ts-expect-error TS(2304): Cannot find name 'Employer'.
              model: Employer,
              as: "employer",
              attributes: ["id", "clinic_name", "prefectures", "city"],
            },
            {
              model: EmploymentType,
              as: "employmentType",
            },
          ],
        },
      ],
      order: [["created", "DESC"]],
    });

    // Return response
    res.status(200).json({
      success: true,
      data: favoriteJobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add job to favorites
 * @route POST /api/job-seekers/favorite-jobs
 */
const addFavoriteJob = async (req: any, res: any, next: any) => {
  try {
    const { id: jobSeekerId } = req.user;
    const { job_info_id } = req.body;

    if (!job_info_id) {
      throw new BadRequestError("Job ID is required");
    }

    // Check if job exists
    const job = await JobInfo.findByPk(job_info_id);

    if (!job || job.deleted || job.public_status !== 1) {
      throw new NotFoundError("Job not found or not active");
    }

    // Check if already in favorites
    const existingFavorite = await FavoriteJob.findOne({
      where: {
        job_seeker_id: jobSeekerId,
        job_info_id,
      },
    });

    if (existingFavorite) {
      throw new BadRequestError("Job is already in favorites");
    }

    // Add to favorites
    const favorite = await FavoriteJob.create({
      job_seeker_id: jobSeekerId,
      job_info_id,
    });

    // Return response
    res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove job from favorites
 * @route DELETE /api/job-seekers/favorite-jobs/:id
 */
const removeFavoriteJob = async (req: any, res: any, next: any) => {
  try {
    const { id: jobSeekerId } = req.user;
    const { id: job_info_id } = req.params;

    // Find favorite
    const favorite = await FavoriteJob.findOne({
      where: {
        job_seeker_id: jobSeekerId,
        job_info_id,
      },
    });

    if (!favorite) {
      throw new NotFoundError("Favorite job not found");
    }

    // Remove from favorites
    await favorite.destroy();

    // Return response
    res.status(200).json({
      success: true,
      message: "Job removed from favorites",
    });
  } catch (error) {
    next(error);
  }
};

const getAllJobSeekers = async (req: any, res: any, next: any) => {
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
    const whereCondition = { deleted: null };
    // @ts-expect-error
    if (prefectures) whereCondition.prefectures = prefectures;
    // Add search term filter
    if (searchTerm) {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { name_kana: { [Op.like]: `%${searchTerm}%` } },
        { email: { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    const includeOptions = [
      {
        model: EmploymentType,
        as: "employmentTypes",
        through: { attributes: [] },
      },
      {
        model: DesiredCondition,
        as: "desiredConditions",
        through: { attributes: ["id", "body"] },
      },
      {
        model: ImagePath,
        as: "avatar",
        required: false,
        where: { posting_category: 1 },
        attributes: ['entity_path'],
      },
    ]

    const { count, rows: jobseekers } = await JobSeeker.findAndCountAll({
      where: whereCondition,
      include: includeOptions,
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
        jobseekers,
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

const getJobSeekerById = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    const jobSeeker = await JobSeeker.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: EmploymentType,
          as: "employmentTypes",
          through: { attributes: [] },
        },
        {
          model: DesiredCondition,
          as: "desiredConditions",
          through: { attributes: ["id", "body"] },
        },
      ],
    });

    if (!jobSeeker || jobSeeker.deleted) {
      throw new NotFoundError("Job seeker not found");
    }

    // Return response
    res.status(200).json({
      success: true,
      data: jobSeeker,
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

const deleteJobSeekerById = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    const jobSeeker = await JobSeeker.findByPk(id);
    if (!jobSeeker) {
      throw new NotFoundError('JobSeeker not found');
    }
    await jobSeeker.destroy();

    res.status(200).json({
      success: true,
      message: 'JobSeeker deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getProfile,
  updateProfile,
  changeEmail,
  getFavoriteJobs,
  addFavoriteJob,
  removeFavoriteJob,
  getAllJobSeekers,
  getJobSeekerById,
  deleteJobSeekerById
};
