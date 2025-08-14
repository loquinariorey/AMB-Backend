import winston from 'winston';
import path from 'path';
import fs from 'fs';
import util from 'util';

// Create logs directory if it doesn't exist
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define the Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "job-portal-api" },
  // @ts-expect-error TS(2322): Type '(ConsoleTransportInstance | FileTransportIns... Remove this comment to see the full error message
  transports: [
    // Log to the console in development
    process.env.NODE_ENV !== "production"
      ? new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              // (info) => `${info.timestamp} ${info.level}: ${info.message}`
              // (info) => `${info.level}: ${info.message}`
              (info) => {
                const msg =
                  typeof info.message === "object"
                    ? util.inspect(info.message, { depth: null, colors: true })
                    : info.message;
                return `${info.level}: ${msg}`;
              }
            )
          ),
        })
      : null,
    // Log errors to a separate file
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Log all levels to the combined file
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ].filter(Boolean),
});

// Custom stream for Morgan to log HTTP requests
const httpLogger = {
  write: (message: any) => {
    logger.info(message.trim());
  },
};

// Export both the logger and httpLogger
export default { logger, httpLogger };
