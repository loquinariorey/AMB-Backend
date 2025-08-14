"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = __importDefault(require("../models"));
const { SearchItem, Feature } = models_1.default;
const errorTypes_1 = __importDefault(require("../utils/errorTypes"));
const { NotFoundError, BadRequestError, ForbiddenError } = errorTypes_1.default;
/**
 * Get all search items
 * @route GET /api/search-items
 */
const getAllSearchItems = async (req, res, next) => {
    try {
        const searchItems = await SearchItem.findAll({
            include: [{
                    model: Feature,
                    as: 'feature'
                }],
            order: [['created', 'DESC']]
        });
        res.status(200).json({
            success: true,
            data: searchItems
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get search item by ID
 * @route GET /api/search-items/:id
 */
const getSearchItemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const searchItem = await SearchItem.findByPk(id, {
            include: [{
                    model: Feature,
                    as: 'feature'
                }]
        });
        if (!searchItem) {
            throw new NotFoundError('Search item not found');
        }
        res.status(200).json({
            success: true,
            data: searchItem
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Create search item
 * @route POST /api/search-items
 */
const createSearchItem = async (req, res, next) => {
    try {
        const { feature_id, display_flg } = req.body;
        // Check if feature exists
        const feature = await Feature.findByPk(feature_id);
        if (!feature) {
            throw new BadRequestError('Feature not found');
        }
        const searchItem = await SearchItem.create({
            feature_id,
            display_flg
        });
        res.status(201).json({
            success: true,
            data: searchItem
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Update search item
 * @route PUT /api/search-items/:id
 */
const updateSearchItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { feature_id, display_flg } = req.body;
        const searchItem = await SearchItem.findByPk(id);
        if (!searchItem) {
            throw new NotFoundError('Search item not found');
        }
        if (feature_id) {
            const feature = await Feature.findByPk(feature_id);
            if (!feature) {
                throw new BadRequestError('Feature not found');
            }
        }
        await searchItem.update({
            feature_id: feature_id || searchItem.feature_id,
            display_flg: display_flg !== undefined ? display_flg : searchItem.display_flg
        });
        res.status(200).json({
            success: true,
            data: searchItem
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Delete search item
 * @route DELETE /api/search-items/:id
 */
const deleteSearchItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const searchItem = await SearchItem.findByPk(id);
        if (!searchItem) {
            throw new NotFoundError('Search item not found');
        }
        await searchItem.destroy();
        res.status(200).json({
            success: true,
            message: 'Search item deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getAllSearchItems,
    getSearchItemById,
    createSearchItem,
    updateSearchItem,
    deleteSearchItem
};
