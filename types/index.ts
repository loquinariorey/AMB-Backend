import { Request } from 'express';

// Extend Express Request to include user property added by auth middleware
export interface AuthenticatedRequest extends Request {
  user: {
    id: string | number;
    role: 'admin' | 'employer' | 'jobseeker';
    email: string;
    [key: string]: any;
  };
}
