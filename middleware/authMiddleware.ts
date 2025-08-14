import jwt from 'jsonwebtoken';
import errorTypes from '../utils/errorTypes';
const { NotFoundError, BadRequestError, ForbiddenError, UnauthorizedError } = errorTypes;
import db from '../models';
const { Admin, Employer, JobSeeker, JobInfo } = db;


/**
 * Middleware to verify JWT token
 */
const verifyToken = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if ((error as any).name === "JsonWebTokenError") {
      next(new UnauthorizedError("Invalid token"));
    } else if ((error as any).name === "TokenExpiredError") {
      next(new UnauthorizedError("Token expired"));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to check if the user is an Admin
 */
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Not authenticated");
    }
    if (req.user.role !== "admin") {
      throw new ForbiddenError("Admin access required");
    }

    // Verify admin exists in database
    const admin = await Admin.findByPk(req.user.id);
    if (!admin) {
      throw new ForbiddenError("Admin account not found");
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if the user is an Employer
 */
const isEmployer = async (req: any, res: any, next: any) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Not authenticated");
    }
    if (req.user.role !== "employer") {
      throw new ForbiddenError("Employer access required");
    }
    // Verify employer exists in database
    const employer = await Employer.findByPk(req.user.id);
    if (!employer || employer.deleted) {
      throw new ForbiddenError("Employer account not found or deactivated");
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if the user is a JobSeeker
 */
const isJobSeeker = async (req: any, res: any, next: any) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Not authenticated");
    }
    if (req.user.role !== "jobseeker") {
      throw new ForbiddenError("Job seeker access required");
    }

    // Verify job seeker exists in database
    const jobSeeker = await JobSeeker.findByPk(req.user.id);
    if (!jobSeeker || jobSeeker.deleted) {
      throw new ForbiddenError("Job seeker account not found or deactivated");
    }

    next();
  } catch (error) {
    next(error);
  }
};

const isOwner = async (req: any, res: any, next: any) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Not authenticated");
    }

    if (req.user.role !== "employer" && req.user.role !== "admin") {
      throw new ForbiddenError("Owner access required");
    }

    // Verify job seeker exists in database
    if (req.user.role === "employer") {
      const employer = await Employer.findByPk(req.user.id);
      if (!employer || employer.deleted) {
        throw new ForbiddenError("Employer account not found or deactivated");
      }
    }

    if (req.user.role === "admin") {
      const admin = await Admin.findByPk(req.user.id);
      if (!admin || admin.deleted) {
        throw new ForbiddenError("Admin account not found or deactivated");
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if the employer is the owner of the job
 */
const isJobOwner = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const { id: employerId } = req.user;

    const job = await JobInfo.findByPk(id);

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    if (job.employer_id !== employerId) {
      throw new ForbiddenError("You do not have permission to modify this job");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default {
  verifyToken,
  isAdmin,
  isEmployer,
  isJobSeeker,
  isJobOwner,
  isOwner
};
