"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
// Create logs directory if it doesn't exist
const logDir = "logs";
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir);
}
// Define the Winston logger configuration
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json()),
    defaultMeta: { service: "job-portal-api" },
    // @ts-expect-error TS(2322): Type '(ConsoleTransportInstance | FileTransportIns... Remove this comment to see the full error message
    transports: [
        // Log to the console in development
        process.env.NODE_ENV !== "production"
            ? new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(
                // (info) => `${info.timestamp} ${info.level}: ${info.message}`
                // (info) => `${info.level}: ${info.message}`
                (info) => {
                    const msg = typeof info.message === "object"
                        ? util_1.default.inspect(info.message, { depth: null, colors: true })
                        : info.message;
                    return `${info.level}: ${msg}`;
                })),
            })
            : null,
        // Log errors to a separate file
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, "error.log"),
            level: "error",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Log all levels to the combined file
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, "combined.log"),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ].filter(Boolean),
});
// Custom stream for Morgan to log HTTP requests
const httpLogger = {
    write: (message) => {
        logger.info(message.trim());
    },
};
// Export both the logger and httpLogger
exports.default = { logger, httpLogger };
