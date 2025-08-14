// @ts-expect-error TS(2614): Module '"../models"' has no exported member 'JobSe... Remove this comment to see the full error message
import { JobSeeker, Employer, JobInfo, Chat } from '../models';
import log from '../utils/logger';
const { logger, httpLogger } = log;

/**
 * Send a notification when a new message is received
 * @param {Object} message - The new message object
 * @param {Object} chat - The chat object
 */
const notifyNewMessage = async (message: any, chat: any) => {
  try {
    // Determine the recipient based on the sender
    const isSenderJobSeeker = message.sender === 0;
    
    if (isSenderJobSeeker) {
      // Message from job seeker, notify employer
      const jobInfo = await JobInfo.findByPk(chat.job_info_id, {
        include: [{
          model: Employer,
          as: 'employer',
          attributes: ['id', 'email']
        }]
      });
      
      if (!jobInfo || !jobInfo.employer) {
        logger.error('Could not find employer for notification', { 
          chatId: chat.id, 
          jobInfoId: chat.job_info_id 
        });
        return;
      }
      
      // Here you would send the actual email notification
      // This is a stub for where email sending would happen
      logger.info('Would send email to employer', {
        to: jobInfo.employer.email,
        subject: 'New message from job applicant',
        body: `You have a new message about "${chat.job_title}"`
      });
    } else {
      // Message from employer, notify job seeker
      const jobSeeker = await JobSeeker.findByPk(chat.job_seeker_id, {
        attributes: ['id', 'email', 'name']
      });
      
      if (!jobSeeker) {
        logger.error('Could not find job seeker for notification', { 
          chatId: chat.id, 
          jobSeekerId: chat.job_seeker_id 
        });
        return;
      }
      
      // Here you would send the actual email notification
      // This is a stub for where email sending would happen
      logger.info('Would send email to job seeker', {
        to: jobSeeker.email,
        subject: 'New message about your job application',
        body: `You have a new message about "${chat.job_title}"`
      });
    }
  } catch (error) {
    logger.error('Error sending notification', { error });
  }
};

/**
 * Send a notification when a job application is submitted
 * @param {Object} application - The new application object
 * @param {Object} jobInfo - The job info object
 * @param {Object} jobSeeker - The job seeker object
 */
const notifyNewApplication = async (application: any, jobInfo: any, jobSeeker: any) => {
  try {
    // Get employer
    const employer = await Employer.findByPk(jobInfo.employer_id, {
      attributes: ['id', 'email', 'clinic_name']
    });
    
    if (!employer) {
      logger.error('Could not find employer for application notification', { 
        applicationId: application.id, 
        employerId: jobInfo.employer_id 
      });
      return;
    }
    
    // Here you would send the actual email notification
    // This is a stub for where email sending would happen
    logger.info('Would send email to employer', {
      to: employer.email,
      subject: 'New job application',
      body: `${jobSeeker.name} has applied for "${jobInfo.job_title}"`
    });
    
    // Also notify job seeker of their submission
    logger.info('Would send email to job seeker', {
      to: jobSeeker.email,
      subject: 'Job Application Confirmation',
      body: `Your application for "${jobInfo.job_title}" at ${employer.clinic_name} has been submitted`
    });
  } catch (error) {
    logger.error('Error sending application notification', { error });
  }
};

export default {
  notifyNewMessage,
  notifyNewApplication
};