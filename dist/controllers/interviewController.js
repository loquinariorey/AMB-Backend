"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../models"));
const { Interview, ImagePath, Column } = models_1.default;
const errorTypes_1 = __importDefault(require("../utils/errorTypes"));
const { NotFoundError, BadRequestError, ForbiddenError } = errorTypes_1.default;
const imageHandler_1 = require("../utils/imageHandler");
/**
 * Get all Interview items
 * @route GET /api/Interview-items
 */
const getAllInterviews = async (req, res, next) => {
    try {
        const { count, rows: InterviewItems } = await Interview.findAndCountAll();
        res.status(200).json({
            success: true,
            count: count,
            data: InterviewItems,
        });
    }
    catch (error) {
        next(error);
    }
};
const getAllInterviewsPagination = async (req, res, next) => {
    try {
        const { page = 1, limit = 200, searchTerm, category } = req.query;
        const offset = (page - 1) * limit;
        const whereCondition = {
            is_published: true // 👁️ Only show published articles for frontend
        };
        if (category) {
            whereCondition['category'] = category;
        }
        if (searchTerm) {
            const numericSearch = /^\d+$/.test(String(searchTerm)) ? parseInt(String(searchTerm), 10) : null;
            whereCondition[sequelize_1.Op.or] = [
                { title: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                ...(numericSearch !== null ? [{ custom_id: numericSearch }] : [])
            ];
        }
        const { count, rows: InterviewItems } = await Interview.findAndCountAll({
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
        if (searchTerm && InterviewItems.length > 0) {
            const matchedIds = InterviewItems.map((item) => item.id);
            await Interview.increment('search_cnt', {
                where: { id: matchedIds }
            });
        }
        const totalPages = Math.ceil(count / limit);
        // ✅ Get 3 recommended jobs sorted by custom score
        const recommended = await Interview.findAll({
            where: {
                is_published: true // 👁️ Only recommend published articles
            },
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
                InterviewItems,
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
        const recommended = await Interview.findAll({
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
 * Get Interview item by custom_id
 * @route GET /api/Interview-items/:id
 */
const getInterviewItemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        // 🔢 Enforce numeric custom_id for public access
        if (!/^\d+$/.test(String(id))) {
            throw new BadRequestError('custom_id must be a number');
        }
        const customId = parseInt(String(id), 10);
        // 🔍 Lookup by numeric custom_id
        const whereCondition = { custom_id: customId, is_published: true };
        const InterviewItem = await Interview.findOne({
            where: whereCondition,
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
        if (!InterviewItem) {
            throw new NotFoundError('Interview item not found');
        }
        // 📈 Increment view count using the actual database id
        await Interview.increment('view_cnt', { where: { id: InterviewItem.id } });
        res.status(200).json({
            success: true,
            data: InterviewItem
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get all interviews for admin (includes unpublished)
 * @route GET /api/Interview-items/admin
 */
const getAllInterviewsAdmin = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, searchTerm, category, is_published } = req.query;
        const offset = (page - 1) * limit;
        const whereCondition = {};
        // 🔍 Filter by publication status if specified
        if (is_published !== undefined) {
            whereCondition.is_published = is_published === 'true';
        }
        if (category) {
            whereCondition['category'] = category;
        }
        if (searchTerm) {
            const numericSearch = /^\d+$/.test(String(searchTerm)) ? parseInt(String(searchTerm), 10) : null;
            whereCondition[sequelize_1.Op.or] = [
                { title: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                ...(numericSearch !== null ? [{ custom_id: numericSearch }] : [])
            ];
        }
        const { count, rows: InterviewItems } = await Interview.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit, 10),
            offset: offset,
            order: [['created', 'DESC']], // 📅 Show newest first for admin
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
        const totalPages = Math.ceil(count / limit);
        // ✅ Admin response with publication status visible
        res.status(200).json({
            success: true,
            data: {
                articles: InterviewItems,
                pagination: {
                    total: count,
                    page: parseInt(page, 10),
                    limit: parseInt(limit, 10),
                    totalPages,
                },
                filters: {
                    category,
                    searchTerm,
                    is_published
                }
            },
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Get Interview item by custom_id (Admin - includes drafts, no view count increment)
 * @route GET /api/Interview-items/admin/:id
 */
const getInterviewItemByIdAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Enforce numeric custom_id for admin detail
        if (!/^\d+$/.test(String(id))) {
            throw new BadRequestError('custom_id must be a number');
        }
        const customId = parseInt(String(id), 10);
        const InterviewItem = await Interview.findOne({
            where: { custom_id: customId },
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
        if (!InterviewItem) {
            throw new NotFoundError('Interview item not found');
        }
        res.status(200).json({
            success: true,
            data: InterviewItem
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Create Interview item
 * @route POST /api/Interview-items
 */
const createInterviewItem = async (req, res, next) => {
    try {
        console.log('📝 CREATE INTERVIEW - Request body:', req.body);
        console.log('📝 CREATE INTERVIEW - is_published value:', req.body.is_published, 'type:', typeof req.body.is_published);
        const { title, category, tag, custom_id, is_published } = req.body;
        let content = req.body.content || '';
        // ✅ Require custom_id numeric
        if (custom_id === undefined || custom_id === null || String(custom_id).trim() === '') {
            throw new BadRequestError('custom_id is required');
        }
        if (!/^\d+$/.test(String(custom_id))) {
            throw new BadRequestError('custom_id must be a number');
        }
        const numericCustomId = parseInt(String(custom_id), 10);
        // 🔍 Validate custom_id uniqueness across both columns and interviews
        const existingInterview = await Interview.findOne({ where: { custom_id: numericCustomId } });
        if (existingInterview) {
            throw new BadRequestError(`Custom ID '${custom_id}' already exists in interviews`);
        }
        // Check columns table as well
        const existingColumn = await Column.findOne({ where: { custom_id: numericCustomId } });
        if (existingColumn) {
            throw new BadRequestError(`Custom ID '${custom_id}' already exists in columns`);
        }
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
        // 📊 Parse is_published properly (handle string/boolean/undefined)
        let publishedStatus = false; // Default to draft
        if (is_published !== undefined) {
            // Handle various frontend formats: true, "true", "1", false, "false", "0"
            if (typeof is_published === 'string') {
                publishedStatus = is_published.toLowerCase() === 'true' || is_published === '1';
            }
            else {
                publishedStatus = Boolean(is_published);
            }
        }
        console.log('📝 CREATE INTERVIEW - Final is_published value:', publishedStatus);
        // Step 3: Create article
        const interview = await Interview.create({
            title,
            category,
            tag,
            content,
            custom_id: numericCustomId, // 🆔 Required numeric custom ID
            is_published: publishedStatus, // 👁️ Publication status
        });
        // Step 4: Update parent_id in image_paths
        if (thumbnailImageName) {
            await ImagePath.update({ parent_id: interview.id }, { where: { image_name: thumbnailImageName } });
        }
        for (const img of uploadedImages) {
            await ImagePath.create({
                image_name: img.key,
                entity_path: img.url,
                posting_category: 22, // Content image
                parent_id: interview.id,
            });
        }
        res.status(201).json({
            success: true,
            data: interview,
        });
    }
    catch (err) {
        next(err);
    }
};
/**
 * Update Interview item
 * @route PUT /api/Interview-items/:id
 */
const updateInterviewItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('📝 UPDATE INTERVIEW - Request body:', req.body);
        console.log('📝 UPDATE INTERVIEW - is_published value:', req.body.is_published, 'type:', typeof req.body.is_published);
        const { title, category, custom_id, is_published } = req.body;
        let content = req.body.content || '';
        const interviewItem = await Interview.findByPk(id);
        if (!interviewItem) {
            throw new NotFoundError('Interview item not found');
        }
        // 🔍 Validate custom_id if it's being changed
        if (custom_id !== undefined && custom_id !== null && String(custom_id) !== String(interviewItem.custom_id)) {
            if (!/^\d+$/.test(String(custom_id))) {
                throw new BadRequestError('custom_id must be a number');
            }
            const numericCustomId = parseInt(String(custom_id), 10);
            const existingInterview = await Interview.findOne({
                where: {
                    custom_id: numericCustomId,
                    id: { [sequelize_1.Op.ne]: id } // Exclude current record
                }
            });
            if (existingInterview) {
                throw new BadRequestError(`Custom ID '${custom_id}' already exists in interviews`);
            }
            // Check columns table as well
            const existingColumn = await Column.findOne({ where: { custom_id: numericCustomId } });
            if (existingColumn) {
                throw new BadRequestError(`Custom ID '${custom_id}' already exists in columns`);
            }
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
        // 📊 Parse is_published properly for update
        let publishedStatus = interviewItem.is_published; // Default to existing value
        if (is_published !== undefined) {
            // Handle various frontend formats: true, "true", "1", false, "false", "0"
            if (typeof is_published === 'string') {
                publishedStatus = is_published.toLowerCase() === 'true' || is_published === '1';
            }
            else {
                publishedStatus = Boolean(is_published);
            }
        }
        console.log('📝 UPDATE INTERVIEW - Current is_published:', interviewItem.is_published);
        console.log('📝 UPDATE INTERVIEW - Final is_published value:', publishedStatus);
        // 📝 Step 3: Update Interview fields
        await interviewItem.update({
            title,
            category,
            content,
            custom_id: custom_id !== undefined && custom_id !== null && String(custom_id) !== ''
                ? parseInt(String(custom_id), 10)
                : interviewItem.custom_id,
            is_published: publishedStatus, // 👁️ Publication status
        });
        // 💾 Step 4: Clean up old content images and save new ones
        if (uploadedImages.length > 0) {
            // Remove old content images first to prevent duplicates
            await ImagePath.destroy({
                where: {
                    parent_id: interviewItem.id,
                    posting_category: 22 // Content images
                }
            });
            // Create new content images
            for (const img of uploadedImages) {
                await ImagePath.create({
                    image_name: img.key,
                    entity_path: img.url,
                    posting_category: 22, // content image
                    parent_id: interviewItem.id,
                });
            }
        }
        res.status(200).json({
            success: true,
            data: interviewItem,
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Delete Interview item
 * @route DELETE /api/Interview-items/:id
 */
const deleteInterviewItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const InterviewItem = await Interview.findByPk(id);
        if (!InterviewItem) {
            throw new NotFoundError('Interview item not found');
        }
        // Clean up associated images before deleting the interview
        await ImagePath.destroy({
            where: {
                parent_id: id,
                posting_category: { [sequelize_1.Op.in]: [21, 22] } // Thumbnails (21) and Content images (22)
            }
        });
        await InterviewItem.destroy();
        res.status(200).json({
            success: true,
            message: 'Interview item deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getAllInterviews,
    getAllInterviewsPagination,
    getAllInterviewsAdmin,
    getRecommened,
    getInterviewItemById,
    getInterviewItemByIdAdmin,
    createInterviewItem,
    updateInterviewItem,
    deleteInterviewItem
};
