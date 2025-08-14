"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../models"));
const { Column, ImagePath } = models_1.default;
const errorTypes_1 = __importDefault(require("../utils/errorTypes"));
const { NotFoundError, BadRequestError, ForbiddenError } = errorTypes_1.default;
const imageHandler_1 = require("../utils/imageHandler");
/**
 * Get all Column items
 * @route GET /api/Column-items
 */
const getAllColumns = async (req, res, next) => {
    try {
        const { count, rows: ColumnItems } = await Column.findAndCountAll();
        res.status(200).json({
            success: true,
            count: count,
            data: ColumnItems,
        });
    }
    catch (error) {
        next(error);
    }
};
const getAllColumnsPagination = async (req, res, next) => {
    try {
        const { page = 1, limit = 200, searchTerm, category } = req.query;
        const offset = (page - 1) * limit;
        const whereCondition = {};
        if (category) {
            whereCondition['category'] = category;
        }
        if (searchTerm) {
            whereCondition[sequelize_1.Op.or] = [
                { title: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
            ];
        }
        const { count, rows: ColumnItems } = await Column.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit, 10),
            offset: offset,
            include: [
                {
                    model: ImagePath,
                    as: 'thumbnail',
                    required: false,
                    where: { posting_category: 21 },
                    attributes: ['entity_path'],
                },
            ],
        });
        // 🔼 Increase search count if it's a search request
        if (searchTerm && ColumnItems.length > 0) {
            const matchedIds = ColumnItems.map((item) => item.id);
            await Column.increment('search_cnt', {
                where: { id: matchedIds }
            });
        }
        const totalPages = Math.ceil(count / limit);
        // ✅ Get 3 recommended jobs sorted by custom score
        const recommended = await Column.findAll({
            limit: 3,
            order: [
                [
                    // 🧠 Sequelize.literal used for custom score formula
                    sequelize_1.Sequelize.literal('(view_cnt * 4 + favourite_cnt * 4 + search_cnt * 2)'),
                    'DESC'
                ]
            ],
            include: [
                {
                    model: ImagePath,
                    as: 'thumbnail',
                    required: false,
                    where: { posting_category: 21 },
                    attributes: ['entity_path'],
                },
            ]
        });
        // ✅ Final response
        res.status(200).json({
            success: true,
            data: {
                recommended,
                ColumnItems,
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
const getRecommened = async (req, res, next) => {
    try {
        const recommended = await Column.findAll({
            limit: 3,
            order: [
                [
                    // 🧠 Sequelize.literal used for custom score formula
                    sequelize_1.Sequelize.literal('(view_cnt * 4 + favourite_cnt * 4 + search_cnt * 2)'),
                    'DESC'
                ]
            ],
            include: [
                {
                    model: ImagePath,
                    as: 'thumbnail',
                    required: false,
                    where: { posting_category: 21 },
                    attributes: ['entity_path']
                },
            ]
        });
        res.status(200).json({
            success: true,
            recommended
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get Column item by ID
 * @route GET /api/Column-items/:id
 */
const getColumnItemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Column.increment('view_cnt', { where: { id } });
        const ColumnItem = await Column.findByPk(id, {
            include: [
                {
                    model: ImagePath,
                    as: 'thumbnail',
                    required: false,
                    where: { posting_category: 21 },
                    attributes: ['entity_path'],
                },
            ],
        });
        if (!ColumnItem) {
            throw new NotFoundError('Column item not found');
        }
        res.status(200).json({
            success: true,
            data: ColumnItem
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Create Column item
 * @route POST /api/Column-items
 */
const createColumnItem = async (req, res, next) => {
    try {
        const { title, category } = req.body;
        let content = req.body.content || '';
        // Step 1: Handle thumbnail upload
        let thumbnailImageName = '';
        if (req.files?.['thumbnail']?.[0]) {
            const file = req.files['thumbnail'][0];
            const uploadResult = await (0, imageHandler_1.uploadToS3)(file);
            thumbnailImageName = uploadResult.key;
            await ImagePath.create({
                image_name: uploadResult.key,
                entity_path: uploadResult.url,
                posting_category: 21, // Thumbnail
                parent_id: 0, // Filled later after article is created
            });
        }
        // Step 2: Handle embedded TinyMCE images
        const { updatedHTML, uploadedImages } = await (0, imageHandler_1.parseAndReplaceImagesInHTML)(content);
        content = updatedHTML;
        // Step 3: Create article
        const column = await Column.create({
            title,
            category,
            // thumbnail_image: thumbnailImageName,
            content,
        });
        // Step 4: Update parent_id in image_paths
        if (thumbnailImageName) {
            await ImagePath.update({ parent_id: column.id }, { where: { image_name: thumbnailImageName } });
        }
        for (const img of uploadedImages) {
            await ImagePath.create({
                image_name: img.key,
                entity_path: img.url,
                posting_category: 22, // Content image
                parent_id: column.id,
            });
        }
        res.status(201).json({
            success: true,
            data: column,
        });
    }
    catch (err) {
        next(err);
    }
};
/**
 * Update Column item
 * @route PUT /api/Column-items/:id
 */
const updateColumnItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, category } = req.body;
        let content = req.body.content || '';
        const columnItem = await Column.findByPk(id);
        if (!columnItem) {
            throw new NotFoundError('Column item not found');
        }
        // 🖼️ Step 1: If new thumbnail uploaded
        if (req.files?.['thumbnail']?.[0]) {
            const file = req.files['thumbnail'][0];
            const uploadResult = await (0, imageHandler_1.uploadToS3)(file);
            const newThumbnailKey = uploadResult.key;
            // 🔄 Update or create ImagePath
            const [thumbRecord, created] = await ImagePath.findOrCreate({
                where: {
                    parent_id: id,
                    posting_category: 21,
                },
                defaults: {
                    image_name: newThumbnailKey,
                    entity_path: uploadResult.url,
                    parent_id: id,
                    posting_category: 21,
                },
            });
            if (!created) {
                // Update existing record
                await thumbRecord.update({
                    image_name: newThumbnailKey,
                    entity_path: uploadResult.url,
                });
            }
        }
        // 🖼️ Step 2: Handle embedded TinyMCE base64 images
        const { updatedHTML, uploadedImages } = await (0, imageHandler_1.parseAndReplaceImagesInHTML)(content);
        content = updatedHTML;
        // 📝 Step 3: Update Column fields
        await columnItem.update({
            title,
            category,
            content,
        });
        // 💾 Step 4: Save content images in image_paths
        for (const img of uploadedImages) {
            await ImagePath.create({
                image_name: img.key,
                entity_path: img.url,
                posting_category: 22, // content image
                parent_id: columnItem.id,
            });
        }
        res.status(200).json({
            success: true,
            data: columnItem,
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Delete Column item
 * @route DELETE /api/Column-items/:id
 */
const deleteColumnItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ColumnItem = await Column.findByPk(id);
        if (!ColumnItem) {
            throw new NotFoundError('Column item not found');
        }
        await ColumnItem.destroy();
        res.status(200).json({
            success: true,
            message: 'Column item deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getAllColumns,
    getAllColumnsPagination,
    getRecommened,
    getColumnItemById,
    createColumnItem,
    updateColumnItem,
    deleteColumnItem
};
