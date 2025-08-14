export default (sequelize: any, DataTypes: any) => {
  const JobAnalytic = sequelize.define('JobAnalytic', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'id'
    },
    job_info_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'job_info_id'
    },
    year: {
      type: DataTypes.STRING(4),
      comment: 'year'
    },
    month: {
      type: DataTypes.STRING(2),
      comment: 'month'
    },
    day: {
      type: DataTypes.STRING(2),
      comment: 'day'
    },
    search_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'search_count'
    },
    recruits_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'recruits_count'
    },
    deleted: {
      type: DataTypes.DATE,
      comment: 'deleted'
    },
    created: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'created'
    },
    modified: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'modified'
    }
  }, {
    tableName: 'job_analytics',
    timestamps: false,
    indexes: [
      {
        fields: ['job_info_id']
      },
      {
        fields: ['year', 'month', 'day']
      }
    ]
  });

  JobAnalytic.associate = function(models: any) {
    JobAnalytic.belongsTo(models.JobInfo, {
      foreignKey: 'job_info_id',
      as: 'jobInfo'
    });
  };

  return JobAnalytic;
};