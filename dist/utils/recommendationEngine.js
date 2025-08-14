"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
/**
 * Generate job recommendations for a job seeker
 * @param {Number} jobSeekerId - ID of the job seeker
 * @param {Number} limit - Max number of recommendations to return
 * @returns {Array} Array of recommended jobs
 */
const generateRecommendations = async (jobSeekerId, limit = 10) => {
    // Get job seeker with relations to find preferences
    const jobSeeker = await models_1.JobSeeker.findByPk(jobSeekerId, {
        include: [
            {
                model: models_1.EmploymentType,
                as: 'employmentTypes',
                through: { attributes: [] }
            },
            {
                model: models_1.DesiredCondition,
                as: 'desiredConditions',
                through: { attributes: [] }
            }
        ]
    });
    if (!jobSeeker) {
        throw new Error('Job seeker not found');
    }
    // Extract preferences
    const employmentTypeIds = jobSeeker.employmentTypes.map((type) => type.id);
    const desiredConditionIds = jobSeeker.desiredConditions.map((condition) => condition.id);
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
    }).map((app) => app.job_info_id);
    // Exclude applied jobs
    if (appliedJobIds.length > 0) {
        // @ts-expect-error TS(2339): Property 'id' does not exist on type '{ deleted: n... Remove this comment to see the full error message
        baseConditions.id = { [sequelize_1.Op.notIn]: appliedJobIds };
    }
    // Get exact match recommendations
    let exactMatches = [];
    if (employmentTypeIds.length > 0) {
        exactMatches = await models_1.JobInfo.findAll({
            where: {
                ...baseConditions,
                employment_type_id: { [sequelize_1.Op.in]: employmentTypeIds }
            },
            include: [
                {
                    model: models_1.Employer,
                    as: 'employer',
                    where: employerConditions
                },
                {
                    model: models_1.EmploymentType,
                    as: 'employmentType'
                },
                {
                    model: models_1.Feature,
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
                [sequelize_1.Op.or]: [
                    { short_appeal: { [sequelize_1.Op.like]: `%${location}%` } },
                    { job_lead_statement: { [sequelize_1.Op.like]: `%${location}%` } }
                ]
            };
        });
        broadMatches = await models_1.JobInfo.findAll({
            where: {
                ...baseConditions,
                [sequelize_1.Op.or]: locationQueries,
                id: { [sequelize_1.Op.notIn]: exactMatches.map((job) => job.id) }
            },
            include: [
                {
                    model: models_1.Employer,
                    as: 'employer'
                },
                {
                    model: models_1.EmploymentType,
                    as: 'employmentType'
                },
                {
                    model: models_1.Feature,
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
        const recentJobs = await models_1.JobInfo.findAll({
            where: {
                ...baseConditions,
                id: { [sequelize_1.Op.notIn]: [...existingJobIds, ...appliedJobIds] }
            },
            include: [
                {
                    model: models_1.Employer,
                    as: 'employer'
                },
                {
                    model: models_1.EmploymentType,
                    as: 'employmentType'
                },
                {
                    model: models_1.Feature,
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
exports.default = {
    generateRecommendations
};
