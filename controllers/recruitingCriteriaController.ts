import { Op } from 'sequelize';
import db from '../models';

const { RecruitingCriteria } = db;
import errorTypes from '../utils/errorTypes';
const { NotFoundError, BadRequestError, ForbiddenError } = errorTypes;

/**
 * Get all RecruitingCriteria items
 * @route GET /api/RecruitingCriteria-items
 */
const getAllRecruitingCriterias = async (req: any, res: any, next: any) => {
  try {
    const { count, rows: RecruitingCriteriaItems } = await RecruitingCriteria.findAndCountAll();

    res.status(200).json({
      success: true,
      count: count,
      data: RecruitingCriteriaItems,
    });
  } catch (error) {
    next(error);
  }
};

const getAllRecruitingCriteriasPagination = async (req: any, res: any, next: any) => {
  try {
    const {
      page = 1,
      limit = 200,
      searchTerm,
    } = req.query;

    // Calculate pagination
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    // Search Term
    if (searchTerm) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    const { count, rows: RecruitingCriteriaItems } = await RecruitingCriteria.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit, 10),
      offset: offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,

      data: {
        RecruitingCriteriaItems,
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

/**
 * Get RecruitingCriteria item by ID
 * @route GET /api/RecruitingCriteria-items/:id
 */
const getRecruitingCriteriaItemById = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    const RecruitingCriteriaItem = await RecruitingCriteria.findByPk(id, {
      include: [{
        model: RecruitingCriteria,
        as: 'RecruitingCriteria'
      }]
    });

    if (!RecruitingCriteriaItem) {
      throw new NotFoundError('RecruitingCriteria item not found');
    }

    res.status(200).json({
      success: true,
      data: RecruitingCriteriaItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create RecruitingCriteria item
 * @route POST /api/RecruitingCriteria-items
 */
const createRecruitingCriteriaItem = async (req: any, res: any, next: any) => {
  try {
    // const { RecruitingCriteria_id, display_flg } = req.body;

    // // Check if RecruitingCriteria exists
    // const RecruitingCriteria = await RecruitingCriteria.findByPk(RecruitingCriteria_id);
    // if (!RecruitingCriteria) {
    //   throw new BadRequestError('RecruitingCriteria not found');
    // }
    const { name, ...otherData } = req.body;
    const existingRecruitingCriteria = await RecruitingCriteria.findOne({ where: { name } });
    if (existingRecruitingCriteria) {
      throw new BadRequestError('RecruitingCriteria is already exist');
    }
    const RecruitingCriteriaItem = await RecruitingCriteria.create({
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: RecruitingCriteriaItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update RecruitingCriteria item
 * @route PUT /api/RecruitingCriteria-items/:id
 */
const updateRecruitingCriteriaItem = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const { RecruitingCriteria_id, display_flg } = req.body;

    const RecruitingCriteriaItem = await RecruitingCriteria.findByPk(id);
    if (!RecruitingCriteriaItem) {
      throw new NotFoundError('RecruitingCriteria item not found');
    }

    await RecruitingCriteriaItem.update({
      ...req.body
    });

    res.status(200).json({
      success: true,
      data: RecruitingCriteriaItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete RecruitingCriteria item
 * @route DELETE /api/RecruitingCriteria-items/:id
 */
const deleteRecruitingCriteriaItem = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    const RecruitingCriteriaItem = await RecruitingCriteria.findByPk(id);
    if (!RecruitingCriteriaItem) {
      throw new NotFoundError('RecruitingCriteria item not found');
    }
    await RecruitingCriteriaItem.destroy();

    res.status(200).json({
      success: true,
      message: 'RecruitingCriteria item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllRecruitingCriterias,
  getAllRecruitingCriteriasPagination,
  getRecruitingCriteriaItemById,
  createRecruitingCriteriaItem,
  updateRecruitingCriteriaItem,
  deleteRecruitingCriteriaItem
};