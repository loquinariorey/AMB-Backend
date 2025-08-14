import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';

// @ts-expect-error TS(7016): Could not find a declaration file for module 'comp... Remove this comment to see the full error message
import compression from 'compression';

// @ts-expect-error TS(7016): Could not find a declaration file for module 'morg... Remove this comment to see the full error message
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();

// Import custom middleware

import errorHandler from './middleware/errorHandler';

import log from './utils/logger';
const { logger, httpLogger } = log;

// Import routes

import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import employerRoutes from './routes/employer.routes';
import jobSeekerRoutes from './routes/jobSeeker.routes';
import applicationsRoutes from './routes/application.routes';
import adminRoutes from './routes/admin.routes';
import messageRoutes from './routes/message.routes';
import analyticsRoutes from './routes/analytics.routes';
import searchItemRoutes from './routes/searchItem.routes';
import clinicPointRoutes from './routes/jobInfoClinicPoint.routes';
import staffInfoRoutes from './routes/jobInfoStaffInfo.routes';
import featureRoutes from './routes/feature.routes';
import recruitingCriteriaRoutes from './routes/recruitingCriteria.routes';
import uploadRoutes from './routes/upload.routes';
import columnRoutes from './routes/column.routes';
import interviewRoutes from './routes/interview.routes';
import chatRoutes from './routes/chat.routes';
import companyApplicationRoutes from './routes/companyApplication.routes';
import careerConsultationRoutes from './routes/careerConsultation.routes';
import contactRoutes from './routes/contact.routes';
import chatUploadRoutes from './routes/chatUpload.routes';
// Database setup
import db from './models';

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: httpLogger }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);


app.use("/recruit/images", express.static("uploads/images"));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/job-seekers', jobSeekerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search-items', searchItemRoutes);
app.use('/api/clinic-points', clinicPointRoutes);
app.use('/api/staff-info', staffInfoRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/recruitingCriterias', recruitingCriteriaRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/company-applications', companyApplicationRoutes);
app.use('/api/career-consultations', careerConsultationRoutes);
app.use('/api', uploadRoutes);
app.use('/api/chat-upload', chatUploadRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Performance test endpoint
app.get('/api/performance-test', async (_req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    // Test database connection
    await db.sequelize.authenticate();
    const dbTime = Date.now() - startTime;
    
    res.status(200).json({ 
      status: 'ok', 
      database: 'connected',
      connectionTime: `${dbTime}ms`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
// Error middleware
app.use(errorHandler);



import http from 'http';
import { initSocketServer } from './utils/socketServer'; 
const server = http.createServer(app);

initSocketServer(server);



// Start the server
const startServer = async () => {
  try {

    await db.sequelize.authenticate();
    logger.info('Database connected.');

    // Uncomment if needed
    // await db.sequelize.sync({ alter: true });

    server.listen(PORT, () => {
      logger.info(`🚀 Server & WebSocket running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Global handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

startServer();

export default app;
