"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../models"));
const { RecruitingCriteria } = models_1.default;
const errorTypes_1 = __importDefault(require("../utils/errorTypes"));
const { NotFoundError, BadRequestError, ForbiddenError } = errorTypes_1.default;
/**
 * Get all RecruitingCriteria items
 * @route GET /api/RecruitingCriteria-items
 */
const getAllRecruitingCriterias = async (req, res, next) => {
    try {
        const { count, rows: RecruitingCriteriaItems } = await RecruitingCriteria.findAndCountAll();
        res.status(200).json({
            success: true,
            count: count,
            data: RecruitingCriteriaItems,
        });
    }
    catch (error) {
        next(error);
    }
};
const getAllRecruitingCriteriasPagination = async (req, res, next) => {
    try {
        const { page = 1, limit = 200, searchTerm, } = req.query;
        // Calculate pagination
        const offset = (page - 1) * limit;
        const whereCondition = {};
        // Search Term
        if (searchTerm) {
            whereCondition[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
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
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get RecruitingCriteria item by ID
 * @route GET /api/RecruitingCriteria-items/:id
 */
const getRecruitingCriteriaItemById = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
/**
 * Create RecruitingCriteria item
 * @route POST /api/RecruitingCriteria-items
 */
const createRecruitingCriteriaItem = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
/**
 * Update RecruitingCriteria item
 * @route PUT /api/RecruitingCriteria-items/:id
 */
const updateRecruitingCriteriaItem = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
/**
 * Delete RecruitingCriteria item
 * @route DELETE /api/RecruitingCriteria-items/:id
 */
const deleteRecruitingCriteriaItem = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getAllRecruitingCriterias,
    getAllRecruitingCriteriasPagination,
    getRecruitingCriteriaItemById,
    createRecruitingCriteriaItem,
    updateRecruitingCriteriaItem,
    deleteRecruitingCriteriaItem
};
