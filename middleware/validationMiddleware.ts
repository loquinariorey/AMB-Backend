import { validationResult, check, param, body } from 'express-validator';
import errorTypes from '../utils/errorTypes';
const { BadRequestError } = errorTypes;

// Process validation results
const validate = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationDetails = errors.array();
    return next(
      // new BadRequestError({
      //   message: "Validation error",
      //   errors: validationDetails.map(error => error.msg).join(", "), // Convert errors to a readable string
      // })
      new BadRequestError(
        validationDetails.map(error => error.msg).join(", ")
      )
    );
  }
  next();
};

// Auth validation rules

const jobSeekerRegisterValidation = [
  check("name", "Name is required").notEmpty(),
  check("name_kana", "Name(Kana) is required").notEmpty(),
  // check("name_kana", "Name(Kana) must be in Katakana format").matches(/^[ァ-ンヴー]+$/),
  check("birthdate", "Birthdate is required").notEmpty(),
  check("birthdate", "Invalid Birthdate format(1970-01-01)").isISO8601(),
  check("sex", "Sex is required").notEmpty(),
  check("zip", "ZIP code is required").notEmpty(),
  check("zip", "Invalid Zip code format (123-4567)").matches(/^\d{3}-\d{4}$/),
  check("tel", "Telephone number is required").notEmpty(),
  check("email", "Email is required").notEmpty(),
  check("email", "Invalid Email").isEmail(),
  check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  validate,
];

const employerRegisterValidation = [
  check("clinic_name", "Company Name is required").notEmpty(),
  check("clinic_name_kana", "Company Name(Kana) is required").notEmpty(),
  // check("clinic_name_kana", "Company Name(Kana) must be in Katakana format").matches(/^[ァ-ンヴー]+$/),
  check("zip", "ZIP code is required").notEmpty(),
  check("zip", "Invalid Zip code format (123-4567)").matches(/^\d{3}-\d{4}$/),
  check("tel", "Telephone number is required").notEmpty(),
  check("email", "Email is required").notEmpty(),
  check("email", "Invalid Email").isEmail(),
  // check("home_page_url", "HomePage Url is required").notEmpty(),
  check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  validate,
];

const loginValidation = [
  check("email", "Valid email is required").isEmail(),
  check("password", "Password is required").exists(),
  validate,
];

// Employer validation rules
const employerValidation = [
  check("clinic_name", "Clinic name is required").notEmpty(),
  check("email", "Valid email is required").isEmail(),
  check("password", "Password must be at least 6 characters").isLength({
    min: 6,
  }),
  validate,
];

// Job seeker validation rules
const jobSeekerValidation = [
  check("name", "Name is required").notEmpty(),
  check("email", "Valid email is required").isEmail(),
  check("password", "Password must be at least 6 characters").isLength({
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
const jobValidation = (req: any, res: any, next: any) => {
  const publicStatus = parseInt(req.body.public_status);
  if (publicStatus === 2) {
    // 🟡 Skip validation for draft
    return next();
  }

  // ✅ Apply validation rules
  return Promise.all([
    check("job_title", "Job title is required").notEmpty().run(req),
    check("job_lead_statement", "Job Description is required").notEmpty().run(req),
    check("pay", "Salary is required").notEmpty().run(req),
    check("public_status", "Public status must be a valid number").isInt().run(req),
    // Add other rules here if needed
  ])
    .then(() => validate(req, res, next))
    .catch(next);
};

// Chat validation rules
const messageValidation = [
  check("body", "Message body is required").notEmpty(),
  check("chat_id", "Chat ID is required").isInt(),
  validate,
];

// ID validation
const idParamValidation = [
  param("id", "ID must be a valid integer").isInt(),
  validate,
];

// Feature validation
const featureValidation = [
  check("parent_id", "Parent_id is required").notEmpty(),
  check("type", "type is required").notEmpty(),
  check("name", "Name is required").notEmpty(),

  validate,
];

const columnValidation = [
  check("title", "Title is required").notEmpty(),
  check("category", "Category is required").notEmpty(),
  check("content", "Content is required").notEmpty(),

  validate,
];

// recrutingCriteria validation
const recruitingCriteriaValidation = [
  check("name", "Name is required").notEmpty(),
  check("display_order", "display_order is required").notEmpty(),

  validate,
];

export default {
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
