import log from '../utils/logger';
const { logger, httpLogger } = log;

/**
 * Log admin actions for auditing purposes
 * @param {Object} adminUser - Admin user who performed the action
 * @param {String} action - The action performed
 * @param {String} resourceType - Type of resource affected (e.g., 'user', 'job')
 * @param {Number|String} resourceId - ID of the resource affected
 * @param {Object} details - Additional details about the action
 */
const logAdminAction = (adminUser: any, action: any, resourceType: any, resourceId: any, details = {}) => {
  logger.info('Admin Audit Log', {
    adminId: adminUser.id,
    adminEmail: adminUser.email,
    action,
    resourceType,
    resourceId,
    details,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log sensitive data access
 * @param {Object} user - User who accessed the data
 * @param {String} role - Role of the user
 * @param {String} resourceType - Type of resource accessed
 * @param {Number|String} resourceId - ID of the resource accessed
 * @param {String} accessType - Type of access (e.g., 'view', 'download')
 */
const logSensitiveDataAccess = (user: any, role: any, resourceType: any, resourceId: any, accessType: any) => {
  logger.info('Sensitive Data Access Log', {
    userId: user.id,
    userEmail: user.email,
    role,
    resourceType,
    resourceId,
    accessType,
    timestamp: new Date().toISOString(),
    ip: user.ip || 'unknown'
  });
};

/**
 * Log authentication events
 * @param {String} event - Auth event type ('login', 'logout', 'failed_login')
 * @param {Object} user - User attempting authentication
 * @param {String} role - Role of the user
 * @param {String} status - Status of the event ('success', 'failure')
 * @param {Object} details - Additional details
 */
const logAuthEvent = (event: any, user: any, role: any, status: any, details = {}) => {
  logger.info('Auth Event Log', {
    event,
    userId: user?.id,
    userEmail: user?.email,
    role,
    status,
    details,
    timestamp: new Date().toISOString(),
    ip: user?.ip || 'unknown'
  });
};

export default {
  logAdminAction,
  logSensitiveDataAccess,
  logAuthEvent
};