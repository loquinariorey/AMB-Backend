"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const errorTypes_1 = __importDefault(require("../utils/errorTypes"));
const { BadRequestError } = errorTypes_1.default;
// Process validation results
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const validationDetails = errors.array();
        return next(
        // new BadRequestError({
        //   message: "Validation error",
        //   errors: validationDetails.map(error => error.msg).join(", "), // Convert errors to a readable string
        // })
        new BadRequestError(validationDetails.map(error => error.msg).join(", ")));
    }
    next();
};
// Auth validation rules
const jobSeekerRegisterValidation = [
    (0, express_validator_1.check)("name", "Name is required").notEmpty(),
    (0, express_validator_1.check)("name_kana", "Name(Kana) is required").notEmpty(),
    // check("name_kana", "Name(Kana) must be in Katakana format").matches(/^[ァ-ンヴー]+$/),
    (0, express_validator_1.check)("birthdate", "Birthdate is required").notEmpty(),
    (0, express_validator_1.check)("birthdate", "Invalid Birthdate format(1970-01-01)").isISO8601(),
    (0, express_validator_1.check)("sex", "Sex is required").notEmpty(),
    (0, express_validator_1.check)("zip", "ZIP code is required").notEmpty(),
    (0, express_validator_1.check)("zip", "Invalid Zip code format (123-4567)").matches(/^\d{3}-\d{4}$/),
    (0, express_validator_1.check)("tel", "Telephone number is required").notEmpty(),
    (0, express_validator_1.check)("email", "Email is required").notEmpty(),
    (0, express_validator_1.check)("email", "Invalid Email").isEmail(),
    (0, express_validator_1.check)("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    validate,
];
const employerRegisterValidation = [
    (0, express_validator_1.check)("clinic_name", "Company Name is required").notEmpty(),
    (0, express_validator_1.check)("clinic_name_kana", "Company Name(Kana) is required").notEmpty(),
    // check("clinic_name_kana", "Company Name(Kana) must be in Katakana format").matches(/^[ァ-ンヴー]+$/),
    (0, express_validator_1.check)("zip", "ZIP code is required").notEmpty(),
    (0, express_validator_1.check)("zip", "Invalid Zip code format (123-4567)").matches(/^\d{3}-\d{4}$/),
    (0, express_validator_1.check)("tel", "Telephone number is required").notEmpty(),
    (0, express_validator_1.check)("email", "Email is required").notEmpty(),
    (0, express_validator_1.check)("email", "Invalid Email").isEmail(),
    // check("home_page_url", "HomePage Url is required").notEmpty(),
    (0, express_validator_1.check)("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    validate,
];
const loginValidation = [
    (0, express_validator_1.check)("email", "Valid email is required").isEmail(),
    (0, express_validator_1.check)("password", "Password is required").exists(),
    validate,
];
// Employer validation rules
const employerValidation = [
    (0, express_validator_1.check)("clinic_name", "Clinic name is required").notEmpty(),
    (0, express_validator_1.check)("email", "Valid email is required").isEmail(),
    (0, express_validator_1.check)("password", "Password must be at least 6 characters").isLength({
        min: 6,
    }),
    validate,
];
// Job seeker validation rules
const jobSeekerValidation = [
    (0, express_validator_1.check)("name", "Name is required").notEmpty(),
    (0, express_validator_1.check)("email", "Valid email is required").isEmail(),
    (0, express_validator_1.check)("password", "Password must be at least 6 characters").isLength({
        min: 6,
    }),
    validate,
];
// Job validation rules
// const jobValidation = [
//   check("job_title", "Job title is required").notEmpty(),
//   // check("employment_type_id", "Employment type is required").isInt(),
//   check("public_status", "Public status must be a valid number").isInt(),
//   // check("clinic_public_form_url", "Site URL must be a valid URL").isURL(),
//   validate,
// ];
const jobValidation = (req, res, next) => {
    const publicStatus = parseInt(req.body.public_status);
    if (publicStatus === 2) {
        // 🟡 Skip validation for draft
        return next();
    }
    // ✅ Apply validation rules
    return Promise.all([
        (0, express_validator_1.check)("job_title", "Job title is required").notEmpty().run(req),
        (0, express_validator_1.check)("job_lead_statement", "Job Description is required").notEmpty().run(req),
        (0, express_validator_1.check)("pay", "Salary is required").notEmpty().run(req),
        (0, express_validator_1.check)("public_status", "Public status must be a valid number").isInt().run(req),
        // Add other rules here if needed
    ])
        .then(() => validate(req, res, next))
        .catch(next);
};
// Chat validation rules
const messageValidation = [
    (0, express_validator_1.check)("body", "Message body is required").notEmpty(),
    (0, express_validator_1.check)("chat_id", "Chat ID is required").isInt(),
    validate,
];
// ID validation
const idParamValidation = [
    (0, express_validator_1.param)("id", "ID must be a valid integer").isInt(),
    validate,
];
// Feature validation
const featureValidation = [
    (0, express_validator_1.check)("parent_id", "Parent_id is required").notEmpty(),
    (0, express_validator_1.check)("type", "type is required").notEmpty(),
    (0, express_validator_1.check)("name", "Name is required").notEmpty(),
    validate,
];
const columnValidation = [
    (0, express_validator_1.check)("title", "Title is required").notEmpty(),
    (0, express_validator_1.check)("category", "Category is required").notEmpty(),
    (0, express_validator_1.check)("content", "Content is required").notEmpty(),
    validate,
];
// recrutingCriteria validation
const recruitingCriteriaValidation = [
    (0, express_validator_1.check)("name", "Name is required").notEmpty(),
    (0, express_validator_1.check)("display_order", "display_order is required").notEmpty(),
    validate,
];
exports.default = {
    validate,
    jobSeekerRegisterValidation,
    employerRegisterValidation,
    loginValidation,
    employerValidation,
    jobSeekerValidation,
    jobValidation,
    messageValidation,
    idParamValidation,
    featureValidation,
    columnValidation,
    recruitingCriteriaValidation
};
