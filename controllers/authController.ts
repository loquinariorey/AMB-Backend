import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models';
const { Admin, Employer, JobSeeker, ImagePath } = db;
import { Op } from "sequelize";

import errorTypes from '../utils/errorTypes';
const { NotFoundError, BadRequestError, ForbiddenError, UnauthorizedError } = errorTypes;
import log from '../utils/logger';
const { logger } = log;
import dotenv from 'dotenv';
dotenv.config();

/**
 * Generate JWT token for authentication
 * @param {Object} user - User object
 * @param {String} role - User role
 * @returns {String} JWT token
 */
const generateToken = (user: any, role: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role
    },
    // @ts-expect-error TS(2769): No overload matches this call.
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRATION || '1d'
    }
  );
};

/**
 * Register a new job seeker
 * @route POST /api/auth/job-seeker/register
 */
const registerJobSeeker = async (req: any, res: any, next: any) => {
  try {
    const { name, email, password, ...otherData } = req.body;

    // Check if the email already exists
    const existingJobSeeker = await JobSeeker.findOne({ where: { email } });
    const existingEmployer = await Employer.findOne({ where: { email } });
    const existingAdmin = await Admin.findOne({ where: { email } });

    if (existingJobSeeker || existingEmployer || existingAdmin) {
      throw new BadRequestError('Email is already registered');
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create job seeker
    const jobSeeker = await JobSeeker.create({
      name,
      email,
      password: hashedPassword,
      status: 'pending',
      ...otherData
    });

    // Generate and save confirmation token
    const confirmToken = require('crypto').randomBytes(32).toString('hex');
    jobSeeker.email_confirm_token = confirmToken;
    jobSeeker.email_confirm_token_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry
    await jobSeeker.save();

    // Send confirmation email
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const transporter = require('nodemailer').createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    const confirmLink = `https://reuse-tenshoku.com/confirm-email?token=${confirmToken}&role=jobSeeker`;
    await transporter.sendMail({
      from: '"Reuse-tenshoku" <your-email@gmail.com>',
      to: email,
      subject: '【リユース転職】メールアドレス確認のご案内',
      text: `\nこんにちは。リユース転職運営事務局です。\nリユース転職をご利用いただきありがとうございます。\n\nご本人様確認のため、下記URLへ「24時間以内」にアクセスし「メールアドレス確認」を完了してください。\n${confirmLink}\n\n※当メール送信後、24時間を超過しますと、セキュリティ保持のため有効期限切れとなります。\nその場合は再度、最初からお手続きをお願い致します。\n\n※お使いのメールソフトによってはURLが途中で改行されることがあります。\nその場合は、URLの先頭から末尾の英数字までをブラウザに直接コピー＆ペーストしてアクセスしてください。\n\n※当メールは送信専用メールアドレスから配信されています。\nこのままご返信いただいてもお答えできませんのでご了承ください。\n\n※当メールに心当たりの無い場合は、誠に恐れ入りますが破棄して頂けますよう、よろしくお願い致します。\n----------------------------------------------------------\nその他ご不明な点・ご質問などございましたら、リユース転職運営事務局までお問い合わせください。\n※本メールは、ご登録いただいたメールアドレス宛に自動的にお送りしています。\n身に覚えのない場合には下記までお問い合わせください。\n■ リユース転職へのお問い合わせ\nhttps://reuse-tenshoku.com/CONTACT\n=====================================\nリユース・リサイクル・買取業界専門の転職サービス リユース転職\nHP：https://reuse-tenshoku.com/job-openings/\n`,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to confirm your account.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new employer
 * @route POST /api/auth/employer/register
 */
const registerEmployer = async (req: any, res: any, next: any) => {
  try {
    const { clinic_name, email, password, ...otherData } = req.body;

    // Check if the email already exists
    const existingJobSeeker = await JobSeeker.findOne({ where: { email } });
    const existingEmployer = await Employer.findOne({ where: { email } });
    const existingAdmin = await Admin.findOne({ where: { email } });

    if (existingJobSeeker || existingEmployer || existingAdmin) {
      throw new BadRequestError('Email is already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create employer
    const employer = await Employer.create({
      clinic_name,
      email,
      password: hashedPassword,
      status: 'pending',
      ...otherData
    });

    // Generate and save confirmation token
    const confirmToken = require('crypto').randomBytes(32).toString('hex');
    employer.email_confirm_token = confirmToken;
    employer.email_confirm_token_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry
    await employer.save();

    // Send confirmation email
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const transporter = require('nodemailer').createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    const confirmLink = `https://reuse-tenshoku.com/confirm-email?token=${confirmToken}&role=employer`;
    await transporter.sendMail({
      from: '"Reuse-tenshoku" <your-email@gmail.com>',
      to: email,
      subject: '【リユース転職】メールアドレス確認のご案内',
      text: `\nこんにちは。リユース転職運営事務局です。\nリユース転職をご利用いただきありがとうございます。\n\nご本人様確認のため、下記URLへ「24時間以内」にアクセスし「メールアドレス確認」を完了してください。\n${confirmLink}\n\n※当メール送信後、24時間を超過しますと、セキュリティ保持のため有効期限切れとなります。\nその場合は再度、最初からお手続きをお願い致します。\n\n※お使いのメールソフトによってはURLが途中で改行されることがあります。\nその場合は、URLの先頭から末尾の英数字までをブラウザに直接コピー＆ペーストしてアクセスしてください。\n\n※当メールは送信専用メールアドレスから配信されています。\nこのままご返信いただいてもお答えできませんのでご了承ください。\n\n※当メールに心当たりの無い場合は、誠に恐れ入りますが破棄して頂けますよう、よろしくお願い致します。\n----------------------------------------------------------\nその他ご不明な点・ご質問などございましたら、リユース転職運営事務局までお問い合わせください。\n※本メールは、ご登録いただいたメールアドレス宛に自動的にお送りしています。\n身に覚えのない場合には下記までお問い合わせください。\n■ リユース転職へのお問い合わせ\nhttps://reuse-tenshoku.com/CONTACT\n=====================================\nリユース・リサイクル・買取業界専門の転職サービス リユース転職\nHP：https://reuse-tenshoku.com/job-openings/\n`,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to confirm your account.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login for job seeker
 * @route POST /api/auth/job-seeker/login
 */
const loginJobSeeker = async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;
    // Check if the user exists
    const jobSeeker = await JobSeeker.findOne({ where: { email } });
    if (!jobSeeker) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if the user is deleted
    if (jobSeeker.deleted) {
      throw new UnauthorizedError('Account deactivated');
    }
    // Check if status is not active
    if (jobSeeker.status !== 'active') {
      throw new UnauthorizedError('Account not active. Please confirm your email.');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, jobSeeker.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken(jobSeeker, 'jobseeker');

    // Return response
    res.status(200).json({
      success: true,
      data: {
        role: "JobSeeker",
        user: jobSeeker.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login for employer
 * @route POST /api/auth/employer/login
 */
const loginEmployer = async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;
    // Check if the user exists
    const employer = await Employer.findOne({ where: { email } });
    if (!employer) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if the user is deleted
    if (employer.deleted) {
      throw new UnauthorizedError('Account deactivated');
    }
    // Check if status is not active
    if (employer.status !== 'active') {
      throw new UnauthorizedError('Account not active. Please confirm your email.');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, employer.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken(employer, 'employer');

    // Return response
    res.status(200).json({
      success: true,
      data: {
        role: "Employer",
        user: employer.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login for admin
 * @route POST /api/auth/admin/login
 */
const loginAdmin = async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;

    // Check if the admin exists
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken(admin, 'admin');

    // Return response
    res.status(200).json({
      success: true,
      data: {
        role: admin.toJSON().role,
        user: admin.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};


const unifiedLogin = async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;

    let user = null;
    let role = '';

    // Try to find the user in JobSeeker table
    user = await JobSeeker.findOne({ where: { email } });
    if (user) {
      if (user.deleted) throw new UnauthorizedError('Account deleted');
      if (user.status !== 'active') throw new UnauthorizedError('Account not active. Please confirm your email.');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new UnauthorizedError('Invalid credentials with password');
      role = 'JobSeeker';
    }

    // If not found in JobSeeker, try Employer
    if (!user) {
      user = await Employer.findOne({ where: { email } });
      if (user) {
        if (user.deleted) throw new UnauthorizedError('Account deleted');
        if (user.status !== 'active') throw new UnauthorizedError('Account not active. Please confirm your email.');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedError('Invalid credentials with email');
        role = 'Employer';
      }
    }

    // If still not found, try Admin
    if (!user) {
      user = await Admin.findOne({ where: { email } });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedError('Invalid credentials');
        // role = user.role || 'Admin';
        role = 'Admin';
      }
    }

    // If still not found, throw error
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user, role.toLowerCase());

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        role,
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 */

const getCurrentUser = async (req: any, res: any, next: any) => {
  try {
    const { id, role } = req.user;
    let user;
    let postingCategory = null;

    // Get user & posting category
    switch (role) {
      case "admin":
        user = await Admin.findByPk(id);
        break;
      case "employer":
        user = await Employer.findByPk(id, {
          attributes: { exclude: ["password"] },
        });
        postingCategory = 2;
        break;
      case "jobseeker":
        user = await JobSeeker.findByPk(id, {
          attributes: { exclude: ["password"] },
        });
        postingCategory = 1;
        break;
      default:
        throw new UnauthorizedError("Invalid role");
    }

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // 🔹 Get avatar if applicable
    let avatarUrl = null;
    if (postingCategory) {
      const avatarImage = await ImagePath.findOne({
        where: {
          posting_category: postingCategory,
          parent_id: id,
        },
        order: [["created", "DESC"]],
      });

      avatarUrl = avatarImage ? avatarImage.image_name : null;
    }

    res.status(200).json({
      success: true,
      data: {
        role: role,
        ...user.toJSON(),
        avatar: avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};



const updateJobSeeker = async (req: any, res: any, next: any) => {
  try {
    const jobSeekerId = req.user.id; // assuming `req.user` is set via auth middleware
    const { password, email, ...otherData } = req.body;

    // Check if user exists
    const jobSeeker = await JobSeeker.findByPk(jobSeekerId);
    if (!jobSeeker) {
      throw new NotFoundError('Job Seeker not found');
    }

    // Prevent email update if already taken
    // if (email && email !== jobSeeker.email) {
    //   const emailUsed =
    //     await JobSeeker.findOne({ where: { email } }) ||
    //     await Employer.findOne({ where: { email } }) ||
    //     await Admin.findOne({ where: { email } });

    //   if (emailUsed) {
    //     throw new BadRequestError('Email is already registered');
    //   }

    //   jobSeeker.email = email;
    // }

    // // Update password if provided
    // if (password) {
    //   const salt = await bcrypt.genSalt(10);
    //   jobSeeker.password = await bcrypt.hash(password, salt);
    // }

    // Update other fields
    Object.assign(jobSeeker, otherData);
    await jobSeeker.save();


    // 🔹 Upload avatar if present
    if (req.file) {
      const imageName = req.file.key.replace(/^recruit\//, '');
      await ImagePath.create({
        image_name: imageName,
        entity_path: `/recruit/${imageName}`,
        posting_category: 1, // Avatar
        parent_id: jobSeekerId,
      });
    }


    res.status(200).json({
      success: true,
      data: {
        user: jobSeeker.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployer = async (req: any, res: any, next: any) => {
  try {
    const employerId = req.user.id;
    const { password, email, ...otherData } = req.body;

    // Check if employer exists
    const employer = await Employer.findByPk(employerId);
    if (!employer) {
      throw new NotFoundError('Employer not found');
    }

    // // Prevent email update if already taken
    // if (email && email !== employer.email) {
    //   const emailUsed =
    //     await JobSeeker.findOne({ where: { email } }) ||
    //     await Employer.findOne({ where: { email } }) ||
    //     await Admin.findOne({ where: { email } });

    //   if (emailUsed) {
    //     throw new BadRequestError('Email is already registered');
    //   }

    //   employer.email = email;
    // }

    // // Update password if provided
    // if (password) {
    //   const salt = await bcrypt.genSalt(10);
    //   employer.password = await bcrypt.hash(password, salt);
    // }

    // Update other fields



    Object.assign(employer, otherData);
    await employer.save();

    // 🔹 Upload avatar if present
    if (req.file) {
      const imageName = req.file.key.replace(/^recruit\//, '');
      await ImagePath.create({
        image_name: imageName,
        entity_path: `/recruit/${imageName}`,
        posting_category: 2, // Avatar
        parent_id: employerId,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: employer.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Change password
 * @route PUT /api/auth/change-password
 */
const changePassword = async (req: any, res: any, next: any) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id, role } = req.user;

    let user;

    // Get user based on role
    switch (role) {
      case 'admin':
        user = await Admin.findByPk(id);
        break;
      case 'employer':
        user = await Employer.findByPk(id);
        break;
      case 'jobseeker':
        user = await JobSeeker.findByPk(id);
        break;
      default:
        throw new UnauthorizedError('Invalid role');
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    user.modified = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

import crypto from "crypto";
import nodemailer from "nodemailer";




const requestPasswordReset = async (req: any, res: any, next: any) => {
  try {
    const { email } = req.body;
    // console.log(req.body, email);
    // Use model references as any to avoid type errors
    const EmployerModel = db["Employer"] as any;
    const JobSeekerModel = db["JobSeeker"] as any;

    let user = await EmployerModel.findOne({ where: { email } });
    let role = null;
    if (user) {
      role = "employer";
    } else {
      user = await JobSeekerModel.findOne({ where: { email } });
      if (user) {
        role = "jobSeeker";
      }
    }
    if (!user) {
      // return res.status(404).json({ success: true, message: "Email not found" });
      return res.status(200).json({ success: true, message: "Reset email sent!" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.reset_token = resetToken;
    user.token_expiry = new Date(Date.now() + 15 * 60 * 1000); // 🔹 Expiry in 15 mins
    await user.save();

    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: false, // Change to `true` if using port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        logger.error("SMTP Connection Failed:", error);
      } else {
        logger.info("SMTP Connection Successful!");
      }
    });

    const resetLink = `https://reuse-tenshoku.com/reset-password?token=${resetToken}&role=${role}`;

    await transporter.sendMail({
      from: `"Reuse-tenshoku" <your-email@gmail.com>`,
      to: email,
      subject: "【リユース転職】求職者、パスワード再発行用URLのご案内",
      text:
        `

こんにちは。リユース転職運営事務局です。
リユース転職をご利用いただきありがとうございます。

ご本人様確認のため、下記URLへ「15分以内」にアクセスし
「パスワード再設定画面」から再設定をお願いいたします。
${resetLink}

※当メール送信後、15分を超過しますと、セキュリティ保持のため有効期限切れとなります。
　その場合は再度、最初からお手続きをお願い致します。

※お使いのメールソフトによってはURLが途中で改行されることがあります。
　その場合は、URLの先頭から末尾の英数字までをブラウザに
　直接コピー＆ペーストしてアクセスしてください。

※当メールは送信専用メールアドレスから配信されています。
　このままご返信いただいてもお答えできませんのでご了承ください。

※当メールに心当たりの無い場合は、誠に恐れ入りますが
　破棄して頂けますよう、よろしくお願い致します。

----------------------------------------------------------

その他ご不明な点・ご質問などございましたら、リユース転職運営事務局までお問い合わせください。
※本メールは、ご登録いただいたメールアドレス宛に自動的にお送りしています。
身に覚えのない場合には下記までお問い合わせください。

■ リユース転職へのお問い合わせ
https://reuse-tenshoku.com/CONTACT
=====================================

リユース・リサイクル・買取業界専門の転職サービス リユース転職
HP：https://reuse-tenshoku.com/job-openings/

`,
    });

    res.status(200).json({ success: true, message: "Reset email sent!" });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req: any, res: any, next: any) => {
  try {
    const { token, role, newPassword } = req.body;

    const Model = role === "employer" ? Employer : JobSeeker;
    const user = await Model.findOne({
      where: { reset_token: token, token_expiry: { [Op.gt]: new Date() } },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.reset_token = null;
    user.token_expiry = null;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful!" });
  } catch (error) {
    next(error);
  }
};

const confirmEmailRequest = async (req: any, res: any, next: any) => {
  try {
    const { email } = req.body;

    // Use model references as any to avoid type errors
    const EmployerModel = db["Employer"] as any;
    const JobSeekerModel = db["JobSeeker"] as any;

    let user = await EmployerModel.findOne({ where: { email } });
    let role = null;
    if (user) {
      role = "employer";
    } else {
      user = await JobSeekerModel.findOne({ where: { email } });
      if (user) {
        role = "jobSeeker";
      }
    }
    if (!user) {
      // For security, always return success
      return res.status(200).json({ success: true, message: "Confirmation email sent!" });
    }

    // Generate and save confirmation token
    const confirmToken = crypto.randomBytes(32).toString("hex");
    user.email_confirm_token = confirmToken;
    user.email_confirm_token_expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // one week expiry
    user.status = "pending";
    await user.save();

    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: false, // Change to `true` if using port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        logger.error("SMTP Connection Failed:", error);
      } else {
        logger.info("SMTP Connection Successful!");
      }
    });

    const confirmLink = `https://reuse-tenshoku.com/confirm-email?token=${confirmToken}&role=${role}`;

    await transporter.sendMail({
      from: `"Reuse-tenshoku" <your-email@gmail.com>`,
      to: email,
      subject: "【リユース転職】メールアドレス確認のご案内",
      text:
        `
こんにちは。リユース転職運営事務局です。
リユース転職をご利用いただきありがとうございます。

ご本人様確認のため、下記URLへ「24時間以内」にアクセスし
「メールアドレス確認」を完了してください。
${confirmLink}

※当メール送信後、24時間を超過しますと、セキュリティ保持のため有効期限切れとなります。
　その場合は再度、最初からお手続きをお願い致します。

※お使いのメールソフトによってはURLが途中で改行されることがあります。
　その場合は、URLの先頭から末尾の英数字までをブラウザに
　直接コピー＆ペーストしてアクセスしてください。

※当メールは送信専用メールアドレスから配信されています。
　このままご返信いただいてもお答えできませんのでご了承ください。

※当メールに心当たりの無い場合は、誠に恐れ入りますが
　破棄して頂けますよう、よろしくお願い致します。

----------------------------------------------------------

その他ご不明な点・ご質問などございましたら、リユース転職運営事務局までお問い合わせください。
※本メールは、ご登録いただいたメールアドレス宛に自動的にお送りしています。
身に覚えのない場合には下記までお問い合わせください。

■ リユース転職へのお問い合わせ
https://reuse-tenshoku.com/CONTACT
=====================================

リユース・リサイクル・買取業界専門の転職サービス リユース転職
HP：https://reuse-tenshoku.com/job-openings/

`,
    });

    res.status(200).json({ success: true, message: "Confirmation email sent!" });
  } catch (error) {
    next(error);
  }
};

const confirmEmail = async (req: any, res: any, next: any) => {
  try {
    const { token, role } = req.body;

    const Model = role === "employer" ? Employer : JobSeeker;
    const user = await Model.findOne({
      where: { email_confirm_token: token, email_confirm_token_expiry: { [Op.gt]: new Date() } },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    user.status = "active";
    user.email_confirm_token = null;
    user.email_confirm_token_expiry = null;
    await user.save();

    // Generate JWT token for the user
    const jwtRole = role === "employer" ? "employer" : "jobseeker";
    const tokenJwt = generateToken(user, jwtRole);

    res.status(200).json({
      success: true,
      message: "Email confirmed and logged in successfully!",
      data: {
        role: jwtRole.charAt(0).toUpperCase() + jwtRole.slice(1),
        user: user.toJSON(),
        token: tokenJwt
      }
    });
  } catch (error) {
    next(error);
  }
};

// export const requestEmailChangeLink = async (req, res, next) => {
//   try {
//     const { newEmail } = req.body;
//     const userId = req.user.id;
//     const role = req.user.role; // ✅ get from logged-in user

//     const token = jwt.sign(
//       { newEmail, userId, role },
//       process.env.JWT_SECRET,
//       { expiresIn: "90m" } // ✅ 90 minutes
//     );

//     const verificationUrl = `http://172.20.1.185:3000/api/auth/verify-email-change?token=${token}`;

//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: parseInt(process.env.SMTP_PORT),
//       secure: false,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"Reuse-tenshoku" <your-email@gmail.com>`,
//       to: newEmail,
//       subject: "【リユース転職】メールアドレス変更確認",
//       text: `以下のURLをクリックして、メールアドレス変更を完了してください（90分以内に有効）：\n\n${verificationUrl}`,
//     });

//     res.status(200).json({ success: true, message: "確認リンクを送信しました。" });
//   } catch (err) {
//     next(err);
//   }
// };

export const requestEmailChangeLink = async (req: any, res: any, next: any) => {
  try {
    // console.log(req.body);
    const { newEmail } = req.body;
    const userId = req.user.id;
    const role = req.user.role; // ✅ get from logged-in user

    // Validate newEmail format
    if (!newEmail || typeof newEmail !== 'string' || !newEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        message: "有効なメールアドレスを入力してください。"
      });
    }

    // Check if newEmail already exists for the specified role
    let existingUser = null;
    if (role === 'jobseeker') {
      existingUser = await JobSeeker.findOne({ where: { email: newEmail } });
    } else if (role === 'employer') {
      existingUser = await Employer.findOne({ where: { email: newEmail } });
    } else {
      return res.status(400).json({
        success: false,
        message: "無効なユーザーロールです。"
      });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "このメールアドレスは既に使用されています。"
      });
    }

    // Also check if the newEmail exists in other roles to prevent cross-role conflicts
    let crossRoleUser = null;
    if (role === 'jobseeker') {
      crossRoleUser = await Employer.findOne({ where: { email: newEmail } });
    } else if (role === 'employer') {
      crossRoleUser = await JobSeeker.findOne({ where: { email: newEmail } });
    }

    if (crossRoleUser) {
      return res.status(400).json({
        success: false,
        message: "このメールアドレスは他のアカウントタイプで既に使用されています。"
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      { newEmail, userId, role },
      process.env.JWT_SECRET,
      { expiresIn: "90m" } // ✅ 90 minutes
    );

    const verificationUrl = `http://api.reuse-tenshoku.com/api/auth/verify-email-change?token=${token}`;

    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
      throw new Error('SMTP configuration is incomplete');
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Reuse-tenshoku" <your-email@gmail.com>`,
      to: newEmail,
      subject: "【リユース転職】メールアドレス変更確認",
      text: `以下のURLをクリックして、メールアドレス変更を完了してください（90分以内に有効）：\n\n${verificationUrl}`,
    });

    res.status(200).json({ success: true, message: "確認リンクを送信しました。" });
  } catch (err) {
    next(err);
  }
};

export const verifyEmailChange = async (req: any, res: any, next: any) => {
  try {
    const { token } = req.query;

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET) as any;
    const { userId, newEmail, role } = payload;
    const Model = role === "employer" ? Employer : JobSeeker;
    const user = await Model.findByPk(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // console.log(userId, newEmail, role);
    user.email = newEmail;
    await user.save();

    res.redirect("https://reuse-tenshoku.com/email-change-success");
  } catch (err) {
    res.status(400).send("Invalid or expired token");
  }
};

// Toggle user status (active <-> blocked) by email
const toggleUserStatus = async (req: any, res: any, next: any) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    // Use model references as any to avoid type errors
    const EmployerModel = db["Employer"] as any;
    const JobSeekerModel = db["JobSeeker"] as any;
    let user = await EmployerModel.findOne({ where: { email } });
    let role = null;
    if (user) {
      role = "employer";
    } else {
      user = await JobSeekerModel.findOne({ where: { email } });
      if (user) {
        role = "jobSeeker";
      }
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const pastStatus = user.status;
    let newStatus = "active";
    if (pastStatus === "active") {
      newStatus = "blocked";
    } else if (pastStatus === "blocked") {
      newStatus = "active";
    }
    user.status = newStatus;
    await user.save();
    res.status(200).json({ success: true, message: `User status updated to '${newStatus}' from '${pastStatus}' as ${role}` });
  } catch (error) {
    next(error);
  }
};

export default {
  registerJobSeeker,
  registerEmployer,
  loginJobSeeker,
  loginEmployer,
  loginAdmin,
  unifiedLogin,
  getCurrentUser,
  updateJobSeeker,
  updateEmployer,
  changePassword,
  requestPasswordReset,
  resetPassword,
  requestEmailChangeLink,
  verifyEmailChange,
  confirmEmailRequest,
  confirmEmail,
  toggleUserStatus
};