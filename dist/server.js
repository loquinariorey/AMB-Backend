"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
// @ts-expect-error TS(7016): Could not find a declaration file for module 'comp... Remove this comment to see the full error message
const compression_1 = __importDefault(require("compression"));
// @ts-expect-error TS(7016): Could not find a declaration file for module 'morg... Remove this comment to see the full error message
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Import custom middleware
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const logger_1 = __importDefault(require("./utils/logger"));
const { logger, httpLogger } = logger_1.default;
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const employer_routes_1 = __importDefault(require("./routes/employer.routes"));
const jobSeeker_routes_1 = __importDefault(require("./routes/jobSeeker.routes"));
const application_routes_1 = __importDefault(require("./routes/application.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const searchItem_routes_1 = __importDefault(require("./routes/searchItem.routes"));
const jobInfoClinicPoint_routes_1 = __importDefault(require("./routes/jobInfoClinicPoint.routes"));
const jobInfoStaffInfo_routes_1 = __importDefault(require("./routes/jobInfoStaffInfo.routes"));
const feature_routes_1 = __importDefault(require("./routes/feature.routes"));
const recruitingCriteria_routes_1 = __importDefault(require("./routes/recruitingCriteria.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const column_routes_1 = __importDefault(require("./routes/column.routes"));
const interview_routes_1 = __importDefault(require("./routes/interview.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const companyApplication_routes_1 = __importDefault(require("./routes/companyApplication.routes"));
const careerConsultation_routes_1 = __importDefault(require("./routes/careerConsultation.routes"));
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
const chatUpload_routes_1 = __importDefault(require("./routes/chatUpload.routes"));
// Database setup
const models_1 = __importDefault(require("./models"));
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: (Number(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 10000,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
});
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined', { stream: httpLogger }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(limiter);
app.use("/recruit/images", express_1.default.static("uploads/images"));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/jobs', job_routes_1.default);
app.use('/api/employers', employer_routes_1.default);
app.use('/api/applications', application_routes_1.default);
app.use('/api/job-seekers', jobSeeker_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/messages', message_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/search-items', searchItem_routes_1.default);
app.use('/api/clinic-points', jobInfoClinicPoint_routes_1.default);
app.use('/api/staff-info', jobInfoStaffInfo_routes_1.default);
app.use('/api/features', feature_routes_1.default);
app.use('/api/columns', column_routes_1.default);
app.use('/api/interviews', interview_routes_1.default);
app.use('/api/chats', chat_routes_1.default);
app.use('/api/recruitingCriterias', recruitingCriteria_routes_1.default);
app.use('/api/contacts', contact_routes_1.default);
app.use('/api/company-applications', companyApplication_routes_1.default);
app.use('/api/career-consultations', careerConsultation_routes_1.default);
app.use('/api', upload_routes_1.default);
app.use('/api/chat-upload', chatUpload_routes_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error middleware
app.use(errorHandler_1.default);
const http_1 = __importDefault(require("http"));
const socketServer_1 = require("./utils/socketServer");
const server = http_1.default.createServer(app);
(0, socketServer_1.initSocketServer)(server);
// Start the server
const startServer = async () => {
    try {
        await models_1.default.sequelize.authenticate();
        logger.info('Database connected.');
        // Uncomment if needed
        // await db.sequelize.sync({ alter: true });
        server.listen(PORT, () => {
            logger.info(`🚀 Server & WebSocket running on port ${PORT}`);
        });
    }
    catch (error) {
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
exports.default = app;
