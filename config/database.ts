require('dotenv').config();

export default {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 20,           // Increased from 5 to handle more concurrent requests
      min: 5,            // Maintain minimum connections to avoid connection overhead
      acquire: 10000,    // Reduced from 30000 to 10000ms (10 seconds)
      idle: 30000,       // Increased from 10000 to 30000ms (30 seconds)
      evict: 60000       // Check for dead connections every 60 seconds
    },
    define: {
      timestamps: true,
      underscored: true
    },
    // Additional optimizations for AWS RDS
    dialectOptions: {
      connectTimeout: 60000,    // Connection timeout
      acquireTimeout: 60000,    // Acquire timeout
      timeout: 60000,           // Query timeout
      // Enable connection compression for better performance over network
      compress: true,
      // Enable SSL if required by AWS RDS
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false
    }
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: `${process.env.DB_NAME || 'job_portal'}_test`,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 10000,
      idle: 30000,
      evict: 60000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 50,           // Increased for production load
      min: 10,           // Maintain more connections
      acquire: 10000,    // Faster connection acquisition
      idle: 30000,       // Longer idle time
      evict: 60000       // Dead connection cleanup
    },
    define: {
      timestamps: true,
      underscored: true
    },
    dialectOptions: {
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
      compress: true,
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false
    }
  }
};