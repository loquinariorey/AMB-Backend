import { Op } from 'sequelize';
import { 
  // @ts-expect-error TS(2614): Module '"../models"' has no exported member 'JobSe... Remove this comment to see the full error message
  JobSeeker, 
  // @ts-expect-error TS(2614): Module '"../models"' has no exported member 'JobIn... Remove this comment to see the full error message
  JobInfo, 
  // @ts-expect-error TS(2614): Module '"../models"' has no exported member 'Emplo... Remove this comment to see the full error message
  Employer, 
  // @ts-expect-error TS(2614): Module '"../models"' has no exported member 'Emplo... Remove this comment to see the full error message
  EmploymentType, 
  // @ts-expect-error TS(2614): Module '"../models"' has no exported member 'Desir... Remove this comment to see the full error message
  DesiredCondition, 
  // @ts-expect-error TS(2614): Module '"../models"' has no exported member 'Featu... Remove this comment to see the full error message
  Feature 
} from '../models';

/**
 * Generate job recommendations for a job seeker
 * @param {Number} jobSeekerId - ID of the job seeker
 * @param {Number} limit - Max number of recommendations to return
 * @returns {Array} Array of recommended jobs
 */
const generateRecommendations = async (jobSeekerId: any, limit = 10) => {
  // Get job seeker with relations to find preferences
  const jobSeeker = await JobSeeker.findByPk(jobSeekerId, {
    include: [
      {
        model: EmploymentType,
        as: 'employmentTypes',
        through: { attributes: [] }
      },
      {
        model: DesiredCondition,
        as: 'desiredConditions',
        through: { attributes: [] }
      }
    ]
  });
  
  if (!jobSeeker) {
    throw new Error('Job seeker not found');
  }
  
  // Extract preferences
  const employmentTypeIds = jobSeeker.employmentTypes.map((type: any) => type.id);
  const desiredConditionIds = jobSeeker.desiredConditions.map((condition: any) => condition.id);
  const preferredPrefectures = jobSeeker.prefectures;
  const desiredLocations = [
    jobSeeker.desired_working_place_1,
    jobSeeker.desired_working_place_2
  ].filter(Boolean);
  
  // Build base query conditions
  const baseConditions = {
    deleted: null,
    public_status: 1
  };
  
  // Build Employer conditions
  const employerConditions = {};
  
  if (preferredPrefectures) {
    // @ts-expect-error TS(2339): Property 'prefectures' does not exist on type '{}'... Remove this comment to see the full error message
    employerConditions.prefectures = preferredPrefectures;
  }
  
  // Get list of previously applied jobs
  // @ts-expect-error TS(2304): Cannot find name 'ApplicationHistory'.
  const appliedJobIds = await ApplicationHistory.findAll({
    attributes: ['job_info_id'],
    where: { job_seeker_id: jobSeekerId },
    raw: true
  }).map((app: any) => app.job_info_id);
  
  // Exclude applied jobs
  if (appliedJobIds.length > 0) {
    // @ts-expect-error TS(2339): Property 'id' does not exist on type '{ deleted: n... Remove this comment to see the full error message
    baseConditions.id = { [Op.notIn]: appliedJobIds };
  }
  
  // Get exact match recommendations
  let exactMatches = [];
  if (employmentTypeIds.length > 0) {
    exactMatches = await JobInfo.findAll({
      where: {
        ...baseConditions,
        employment_type_id: { [Op.in]: employmentTypeIds }
      },
      include: [
        {
          model: Employer,
          as: 'employer',
          where: employerConditions
        },
        {
          model: EmploymentType,
          as: 'employmentType'
        },
        {
          model: Feature,
          as: 'features',
          through: { attributes: [] }
        },
        {
          // @ts-expect-error TS(2304): Cannot find name 'ImagePath'.
          model: ImagePath,
          as: 'images',
          limit: 1
        }
      ],
      limit: limit,
      order: [['created', 'DESC']]
    });
  }
  
  // If we have enough exact matches, return them
  if (exactMatches.length >= limit) {
    return exactMatches;
  }
  
  // Otherwise get broader recommendations
  const remainingLimit = limit - exactMatches.length;
  let broadMatches = [];
  
  // Get jobs based on location
  if (desiredLocations.length > 0) {
    const locationQueries = desiredLocations.map(location => {
      return {
        [Op.or]: [
          { short_appeal: { [Op.like]: `%${location}%` } },
          { job_lead_statement: { [Op.like]: `%${location}%` } }
        ]
      };
    });
    
    broadMatches = await JobInfo.findAll({
      where: {
        ...baseConditions,
        [Op.or]: locationQueries,
        id: { [Op.notIn]: exactMatches.map((job: any) => job.id) }
      },
      include: [
        {
          model: Employer,
          as: 'employer'
        },
        {
          model: EmploymentType,
          as: 'employmentType'
        },
        {
          model: Feature,
          as: 'features',
          through: { attributes: [] }
        },
        {
          // @ts-expect-error TS(2304): Cannot find name 'ImagePath'.
          model: ImagePath,
          as: 'images',
          limit: 1
        }
      ],
      limit: remainingLimit,
      order: [['created', 'DESC']]
    });
  }
  
  // Combine results
  const recommendations = [...exactMatches, ...broadMatches];
  
  // If we still don't have enough, get most recent jobs
  if (recommendations.length < limit) {
    const finalRemainingLimit = limit - recommendations.length;
    const existingJobIds = recommendations.map(job => job.id);
    
    const recentJobs = await JobInfo.findAll({
      where: {
        ...baseConditions,
        id: { [Op.notIn]: [...existingJobIds, ...appliedJobIds] }
      },
      include: [
        {
          model: Employer,
          as: 'employer'
        },
        {
          model: EmploymentType,
          as: 'employmentType'
        },
        {
          model: Feature,
          as: 'features',
          through: { attributes: [] }
        },
        {
          // @ts-expect-error TS(2304): Cannot find name 'ImagePath'.
          model: ImagePath,
          as: 'images',
          limit: 1
        }
      ],
      limit: finalRemainingLimit,
      order: [['created', 'DESC']]
    });
    
    recommendations.push(...recentJobs);
  }
  
  return recommendations;
};

export default {
  generateRecommendations
};