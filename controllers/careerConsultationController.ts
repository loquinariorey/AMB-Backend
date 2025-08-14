import { Op } from 'sequelize';
import db from '../models';
const { CareerConsultation, JobInfo } = db;
import errorTypes from '../utils/errorTypes';
const { NotFoundError, BadRequestError, ForbiddenError } = errorTypes;
import log from '../utils/logger';
const { logger } = log;
/**
 * Get all clinic points for a job
 * @route GET /api/jobs/:jobId/clinic-points
 */
const getCareerConsultations = async (req: any, res: any, next: any) => {
  try {
    const {
      page = 1,
      limit = 10,
      searchTerm,
    } = req.query;


    const offset = (page - 1) * limit;

    const whereCondition: any = {};
    if (searchTerm) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { email: { [Op.like]: `%${searchTerm}%` } },
        { telephone: { [Op.like]: `%${searchTerm}%` } },
        { inquiry: { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    const { count, rows: careerConsultations } = await CareerConsultation.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit, 10),
      offset: offset,
    });

    const totalPages = Math.ceil(count / limit);


    res.status(200).json({
      success: true,
      data: {
        careerConsultations,
        pagination: {
          total: count,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages,
        },
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get clinic point by ID
 * @route GET /api/clinic-points/:id
 */
const getCareerConsultationById = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    const careerConsultation = await CareerConsultation.findByPk(id);

    if (!careerConsultation) {
      throw new NotFoundError('CareerConsultation not found');
    }

    res.status(200).json({
      success: true,
      data: careerConsultation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create clinic point
 * @route POST /api/jobs/:jobId/clinic-points
 */
const createCareerConsultation = async (req: any, res: any, next: any) => {
  try {
    const { title, description } = req.body;
    const { email, name, request } = req.body;
    const careerConsultation = await CareerConsultation.create(req.body);

    // Send success response immediately
    res.status(201).json({
      success: true,
      data: careerConsultation
    });

    // Send emails asynchronously in the background
    setImmediate(async () => {
      try {
        const nodemailer = require('nodemailer');
        const smtpPort = parseInt(process.env.SMTP_PORT || '587');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: smtpPort,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const subject = '転職支援サービスへのお申し込みありがとうございます';
        const text = `\nこの度はお申込みいただき誠にありがとうございます。\n\n【受付確認】\nご入力いただいた内容で受付いたしました。\n\n【今後の流れ】\n担当者より改めてご連絡させていただきますので、今しばらくお待ちください。\n\n【お問い合わせ先】\nご不明点等ございましたら、下記までご連絡ください。\nリユース転職運営事務局\nhttps://reuse-tenshoku.com/CONTACT\n\n今後ともどうぞよろしくお願いいたします。\n`;

        await transporter.sendMail({
          from: '"Reuse-tenshoku" <your-email@gmail.com>',
          to: email,
          subject,
          text,
        });

        const adminsubject = `${name}さんからお問い合わせがありました。`;
        const admintext = `\nご入力内容\n\nお名前：${name}\nメールアドレス：${email}\nお問い合わせ内容${request}\n`;

        await transporter.sendMail({
          from: '"Reuse-tenshoku" <your-email@gmail.com>',
          to: "admin@example.com",
          subject: adminsubject,
          text: admintext,
        });

        logger.info('Career consultation emails sent successfully');
      } catch (mailErr) {
        // Log but do not affect the main response
        logger.error('Failed to send career consultation confirmation email:', mailErr);
      }
    });

  } catch (error) {
    next(error);
  }
};


/**
 * Delete clinic point
 * @route DELETE /api/clinic-points/:id
 */
const deleteCareerConsultation = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    const careerConsultation = await CareerConsultation.findByPk(id);

    if (!careerConsultation) {
      throw new NotFoundError('CareerConsultation not found');
    }

    await careerConsultation.destroy();

    res.status(200).json({
      success: true,
      message: 'CareerConsultation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCareerConsultations,
  getCareerConsultationById,
  createCareerConsultation,
  deleteCareerConsultation
};