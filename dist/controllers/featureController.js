"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../models"));
const { Feature } = models_1.default;
const errorTypes_1 = __importDefault(require("../utils/errorTypes"));
const { NotFoundError, BadRequestError, ForbiddenError } = errorTypes_1.default;
/**
 * Get all Feature items
 * @route GET /api/Feature-items
 */
const getAllFeatures = async (req, res, next) => {
    try {
        const { count, rows: featureItems } = await Feature.findAndCountAll();
        res.status(200).json({
            success: true,
            count: count,
            data: featureItems,
        });
    }
    catch (error) {
        next(error);
    }
};
const getAllFeaturesPagination = async (req, res, next) => {
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
        const { count, rows: featureItems } = await Feature.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit, 10),
            offset: offset,
        });
        // Calculate total pages
        const totalPages = Math.ceil(count / limit);
        res.status(200).json({
            success: true,
            data: {
                featureItems,
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
 * Get Feature item by ID
 * @route GET /api/Feature-items/:id
 */
const getFeatureItemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const featureItem = await Feature.findByPk(id, {
            include: [{
                    model: Feature,
                    as: 'feature'
                }]
        });
        if (!featureItem) {
            throw new NotFoundError('feature item not found');
        }
        res.status(200).json({
            success: true,
            data: featureItem
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Create feature item
 * @route POST /api/feature-items
 */
const createFeatureItem = async (req, res, next) => {
    try {
        // const { feature_id, display_flg } = req.body;
        // // Check if feature exists
        // const feature = await Feature.findByPk(feature_id);
        // if (!feature) {
        //   throw new BadRequestError('Feature not found');
        // }
        const { name, parent_id, type, ...otherData } = req.body;
        const existingFeature = await Feature.findOne({ where: { name, parent_id, type } });
        if (existingFeature) {
            throw new BadRequestError('Feature is already exist');
        }
        const featureItem = await Feature.create({
            ...req.body,
        });
        res.status(201).json({
            success: true,
            data: featureItem
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Update feature item
 * @route PUT /api/feature-items/:id
 */
const updateFeatureItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { feature_id, display_flg } = req.body;
        const featureItem = await Feature.findByPk(id);
        if (!featureItem) {
            throw new NotFoundError('feature item not found');
        }
        await featureItem.update({
            ...req.body
        });
        res.status(200).json({
            success: true,
            data: featureItem
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Delete feature item
 * @route DELETE /api/feature-items/:id
 */
const deleteFeatureItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const featureItem = await Feature.findByPk(id);
        if (!featureItem) {
            throw new NotFoundError('feature item not found');
        }
        await featureItem.destroy();
        res.status(200).json({
            success: true,
            message: 'feature item deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getAllFeatures,
    getAllFeaturesPagination,
    getFeatureItemById,
    createFeatureItem,
    updateFeatureItem,
    deleteFeatureItem
};
