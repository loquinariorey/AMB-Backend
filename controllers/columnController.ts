import { Op, Sequelize } from 'sequelize';
import db from '../models';

const { Column, ImagePath, Interview } = db;
import errorTypes from '../utils/errorTypes';
const { NotFoundError, BadRequestError, ForbiddenError } = errorTypes;
import { uploadToS3, parseAndReplaceImagesInHTML } from '../utils/imageHandler';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all Column items
 * @route GET /api/Column-items
 */
const getAllColumns = async (req: any, res: any, next: any) => {
  try {

    const { count, rows: ColumnItems } = await Column.findAndCountAll();

    res.status(200).json({
      success: true,
      count: count,
      data: ColumnItems,
    });
  } catch (error) {
    next(error);
  }
};

const getAllColumnsPagination = async (req: any, res: any, next: any) => {
  try {
    const {
      page = 1,
      limit = 200,
      searchTerm,
      category
    } = req.query;

    const offset = (page - 1) * limit;

    const whereCondition: any = {
      is_published: true // 👁️ Only show published articles for frontend
    };
    if (category) {
      whereCondition['category'] = category;
    }
    if (searchTerm) {
      const numericSearch = /^\d+$/.test(String(searchTerm)) ? parseInt(String(searchTerm), 10) : null;
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${searchTerm}%` } },
        ...(numericSearch !== null ? [{ custom_id: numericSearch }] : [])
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
      const matchedIds = ColumnItems.map((item: any) => item.id);
      await Column.increment('search_cnt', {
        where: { id: matchedIds }
      });
    }

    const totalPages = Math.ceil(count / limit);

    // ✅ Get 3 recommended jobs sorted by custom score
    const recommended = await Column.findAll({
      where: {
        is_published: true // 👁️ Only recommend published articles
      },
      limit: 3,
      order: [
        [
          // 🧠 Sequelize.literal used for custom score formula
          Sequelize.literal('(view_cnt * 4 + favourite_cnt * 4 + search_cnt * 2)'),
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
  } catch (error) {
    next(error);
  }
};

const getRecommened = async (req: any, res: any, next: any) => {
  try {

    const recommended = await Column.findAll({
      limit: 3,
      order: [
        [
          // 🧠 Sequelize.literal used for custom score formula
          Sequelize.literal('(view_cnt * 4 + favourite_cnt * 4 + search_cnt * 2)'),
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
  } catch (error) {
    next(error);
  }
};

/**
 * Get Column item by custom_id
 * @route GET /api/Column-items/:custom_id
 */
const getColumnItemById = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    // 🔢 Enforce numeric custom_id
    if (!/^\d+$/.test(String(id))) {
      throw new BadRequestError('custom_id must be a number');
    }
    const customId = parseInt(String(id), 10);

    // 🔍 Lookup by numeric custom_id
    const whereCondition = { custom_id: customId, is_published: true };

    const ColumnItem = await Column.findOne({
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

    if (!ColumnItem) {
      throw new NotFoundError('Column item not found');
    }

    // 📈 Increment view count using the actual database id
    await Column.increment('view_cnt', { where: { id: ColumnItem.id } });

    res.status(200).json({
      success: true,
      data: ColumnItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Column item by ID (Admin - includes drafts, no view count increment)
 * @route GET /api/Column-items/admin/:id
 */
const getColumnItemByIdAdmin = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    // 🔍 Determine if id is numeric (regular id) or string (custom_id)
    let whereCondition;
    if (isNaN(Number(id))) {
      // Non-numeric = custom_id lookup
      whereCondition = { custom_id: id };
    } else {
      // Numeric = regular id lookup
      whereCondition = { id: parseInt(id) };
    }

    const ColumnItem = await Column.findOne({
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

    if (!ColumnItem) {
      throw new NotFoundError('Column item not found');
    }

    // 🚫 Do not increment view_cnt for admin preview

    res.status(200).json({
      success: true,
      data: ColumnItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all columns for admin (includes unpublished)
 * @route GET /api/Column-items/admin
 */
const getAllColumnsAdmin = async (req: any, res: any, next: any) => {
  try {
    const {
      page = 1,
      limit = 20,
      searchTerm,
      category,
      is_published
    } = req.query;

    const offset = (page - 1) * limit;

    const whereCondition: any = {};
    
    // 🔍 Filter by publication status if specified
    if (is_published !== undefined) {
      whereCondition.is_published = is_published === 'true';
    }
    
    if (category) {
      whereCondition['category'] = category;
    }
    if (searchTerm) {
      const numericSearch = /^\d+$/.test(String(searchTerm)) ? parseInt(String(searchTerm), 10) : null;
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${searchTerm}%` } },
        ...(numericSearch !== null ? [{ custom_id: numericSearch }] : [])
      ];
    }

    const { count, rows: ColumnItems } = await Column.findAndCountAll({
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
        articles: ColumnItems,
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
  } catch (error) {
    next(error);
  }
};

/**
 * Create Column item
 * @route POST /api/Column-items
 */
const createColumnItem = async (req: any, res: any, next: any) => {
  try {
    console.log('📝 CREATE COLUMN - Request body:', req.body);
    console.log('📝 CREATE COLUMN - is_published value:', req.body.is_published, 'type:', typeof req.body.is_published);
    
    const { title, category, custom_id, is_published } = req.body;
    let content = req.body.content || '';

    // ✅ Require custom_id and validate numeric format
    if (custom_id === undefined || custom_id === null || String(custom_id).trim() === '') {
      throw new BadRequestError('custom_id is required');
    }
    if (!/^\d+$/.test(String(custom_id))) {
      throw new BadRequestError('custom_id must be a number');
    }
    const numericCustomId = parseInt(String(custom_id), 10);

    // 🔍 Validate custom_id uniqueness across both columns and interviews
    const existingColumn = await Column.findOne({ where: { custom_id: numericCustomId } });
    if (existingColumn) {
      throw new BadRequestError(`Custom ID '${custom_id}' already exists in columns`);
    }
    
    // Check interviews table as well
    const existingInterview = await Interview.findOne({ where: { custom_id: numericCustomId } });
    if (existingInterview) {
      throw new BadRequestError(`Custom ID '${custom_id}' already exists in interviews`);
    }

    // Step 1: Handle thumbnail upload
    let thumbnailImageName = '';
    if (req.files?.['thumbnail']?.[0]) {
      const file = req.files['thumbnail'][0];
      const uploadResult = await uploadToS3(file);
      thumbnailImageName = uploadResult.key;

      await ImagePath.create({
        image_name: uploadResult.key,
        entity_path: uploadResult.url,
        posting_category: 21, // Thumbnail
        parent_id: 0, // Filled later after article is created
      });
    }

    // Step 2: Handle embedded TinyMCE images
    const { updatedHTML, uploadedImages } = await parseAndReplaceImagesInHTML(content);
    content = updatedHTML;

    // 📊 Parse is_published properly (handle string/boolean/undefined)
    let publishedStatus = false; // Default to draft
    if (is_published !== undefined) {
      // Handle various frontend formats: true, "true", "1", false, "false", "0"
      if (typeof is_published === 'string') {
        publishedStatus = is_published.toLowerCase() === 'true' || is_published === '1';
      } else {
        publishedStatus = Boolean(is_published);
      }
    }
    
    console.log('📝 CREATE COLUMN - Final is_published value:', publishedStatus);

    // Step 3: Create article
    const column = await Column.create({
      title,
      category,
      content,
      custom_id: numericCustomId, // 🆔 Required numeric custom ID
      is_published: publishedStatus, // 👁️ Publication status
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
  } catch (err) {
    next(err);
  }
};

/**
 * Update Column item
 * @route PUT /api/Column-items/:id
 */
const updateColumnItem = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    console.log('📝 UPDATE COLUMN - Request body:', req.body);
    console.log('📝 UPDATE COLUMN - is_published value:', req.body.is_published, 'type:', typeof req.body.is_published);
    
    const { title, category, custom_id, is_published } = req.body;
    let content = req.body.content || '';

    const columnItem = await Column.findByPk(id);
    if (!columnItem) {
      throw new NotFoundError('Column item not found');
    }

    // 🔍 Validate custom_id if it's being changed
    if (custom_id !== undefined && custom_id !== null && String(custom_id) !== String(columnItem.custom_id)) {
      if (!/^\d+$/.test(String(custom_id))) {
        throw new BadRequestError('custom_id must be a number');
      }
      const numericCustomId = parseInt(String(custom_id), 10);

      const existingColumn = await Column.findOne({ 
        where: { 
          custom_id: numericCustomId,
          id: { [Op.ne]: id } // Exclude current record
        } 
      });
      if (existingColumn) {
        throw new BadRequestError(`Custom ID '${custom_id}' already exists in columns`);
      }
      
      // Check interviews table as well
      const existingInterview = await Interview.findOne({ where: { custom_id: numericCustomId } });
      if (existingInterview) {
        throw new BadRequestError(`Custom ID '${custom_id}' already exists in interviews`);
      }
    }

    // 🖼️ Step 1: If new thumbnail uploaded
    if (req.files?.['thumbnail']?.[0]) {
      const file = req.files['thumbnail'][0];
      const uploadResult = await uploadToS3(file);
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
    const { updatedHTML, uploadedImages } = await parseAndReplaceImagesInHTML(content);
    content = updatedHTML;

    // 📊 Parse is_published properly for update
    let publishedStatus = columnItem.is_published; // Default to existing value
    if (is_published !== undefined) {
      // Handle various frontend formats: true, "true", "1", false, "false", "0"
      if (typeof is_published === 'string') {
        publishedStatus = is_published.toLowerCase() === 'true' || is_published === '1';
      } else {
        publishedStatus = Boolean(is_published);
      }
    }
    
    console.log('📝 UPDATE COLUMN - Current is_published:', columnItem.is_published);
    console.log('📝 UPDATE COLUMN - Final is_published value:', publishedStatus);

    // 📝 Step 3: Update Column fields
    await columnItem.update({
      title,
      category,
      content,
      custom_id: custom_id !== undefined && custom_id !== null && String(custom_id) !== ''
        ? parseInt(String(custom_id), 10)
        : columnItem.custom_id,
      is_published: publishedStatus, // 👁️ Publication status
    });

    // 💾 Step 4: Clean up old content images and save new ones
    if (uploadedImages.length > 0) {
      // Remove old content images first to prevent duplicates
      await ImagePath.destroy({
        where: { 
          parent_id: columnItem.id,
          posting_category: 22  // Content images
        }
      });

      // Create new content images
      for (const img of uploadedImages) {
        await ImagePath.create({
          image_name: img.key,
          entity_path: img.url,
          posting_category: 22, // content image
          parent_id: columnItem.id,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: columnItem,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Delete Column item
 * @route DELETE /api/Column-items/:id
 */
const deleteColumnItem = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    const ColumnItem = await Column.findByPk(id);
    if (!ColumnItem) {
      throw new NotFoundError('Column item not found');
    }

    // Clean up associated images before deleting the column
    await ImagePath.destroy({
      where: { 
        parent_id: id,
        posting_category: { [Op.in]: [21, 22] }  // Thumbnails (21) and Content images (22)
      }
    });

    await ColumnItem.destroy();

    res.status(200).json({
      success: true,
      message: 'Column item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllColumns,
  getAllColumnsPagination,
  getAllColumnsAdmin,
  getRecommened,
  getColumnItemById,
  getColumnItemByIdAdmin,
  createColumnItem,
  updateColumnItem,
  deleteColumnItem
};