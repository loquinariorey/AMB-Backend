import { Sequelize } from 'sequelize';
import log from './logger';

const { logger } = log;

export class DatabasePerformanceMonitor {
  private sequelize: Sequelize;
  private startTime: number = 0;
  private queryCount: number = 0;
  private totalQueryTime: number = 0;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
    this.setupMonitoring();
  }

  private setupMonitoring() {
    // Monitor query performance
    this.sequelize.addHook('beforeQuery', (options: any) => {
      this.startTime = Date.now();
      this.queryCount++;
    });

    this.sequelize.addHook('afterQuery', (options: any) => {
      const queryTime = Date.now() - this.startTime;
      this.totalQueryTime += queryTime;

      // Log slow queries (> 1000ms)
      if (queryTime > 1000) {
        const sql = (options as any)?.sql;
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

  private logPoolStatus() {
    const pool = (this.sequelize as any).connectionManager.pool;
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

  public getPerformanceMetrics() {
    return {
      totalQueries: this.queryCount,
      averageQueryTime: this.queryCount > 0 ? Math.round(this.totalQueryTime / this.queryCount) : 0,
      totalQueryTime: this.totalQueryTime
    };
  }

  public resetMetrics() {
    this.queryCount = 0;
    this.totalQueryTime = 0;
  }
}

export default DatabasePerformanceMonitor;
