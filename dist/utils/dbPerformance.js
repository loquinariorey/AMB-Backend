"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabasePerformanceMonitor = void 0;
const logger_1 = __importDefault(require("./logger"));
const { logger } = logger_1.default;
class DatabasePerformanceMonitor {
    constructor(sequelize) {
        this.startTime = 0;
        this.queryCount = 0;
        this.totalQueryTime = 0;
        this.sequelize = sequelize;
        this.setupMonitoring();
    }
    setupMonitoring() {
        // Monitor query performance
        this.sequelize.addHook('beforeQuery', (options) => {
            this.startTime = Date.now();
            this.queryCount++;
        });
        this.sequelize.addHook('afterQuery', (options) => {
            const queryTime = Date.now() - this.startTime;
            this.totalQueryTime += queryTime;
            // Log slow queries (> 1000ms)
            if (queryTime > 1000) {
                const sql = options?.sql;
                logger.warn(`Slow query detected: ${queryTime}ms`, {
                    query: sql,
                    time: queryTime,
                    timestamp: new Date().toISOString()
                });
            }
        });
        // Monitor connection pool status
        setInterval(() => {
            this.logPoolStatus();
        }, 30000); // Log every 30 seconds
    }
    logPoolStatus() {
        const pool = this.sequelize.connectionManager.pool;
        if (pool) {
            const poolStatus = {
                total: pool.size,
                idle: pool.idle,
                waiting: pool.waiting,
                averageQueryTime: this.queryCount > 0 ? Math.round(this.totalQueryTime / this.queryCount) : 0,
                timestamp: new Date().toISOString()
            };
            // logger.info('Database pool status:', poolStatus);
        }
    }
    getPerformanceMetrics() {
        return {
            totalQueries: this.queryCount,
            averageQueryTime: this.queryCount > 0 ? Math.round(this.totalQueryTime / this.queryCount) : 0,
            totalQueryTime: this.totalQueryTime
        };
    }
    resetMetrics() {
        this.queryCount = 0;
        this.totalQueryTime = 0;
    }
}
exports.DatabasePerformanceMonitor = DatabasePerformanceMonitor;
exports.default = DatabasePerformanceMonitor;
