export default (sequelize: any, DataTypes: any) => {
  const JobInfoWorkplaceIntroduction = sequelize.define('JobInfoWorkplaceIntroduction', {
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
    description: {
      type: DataTypes.TEXT,
      comment: 'description'
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
    tableName: 'job_info_workplace_introductions',
    timestamps: false,
    indexes: [
      {
        fields: ['job_info_id']
      }
    ]
  });

  JobInfoWorkplaceIntroduction.associate = function (models: any) {
    JobInfoWorkplaceIntroduction.belongsTo(models.JobInfo, {
      foreignKey: 'job_info_id',
      as: 'jobInfo'
    });
    JobInfoWorkplaceIntroduction.hasMany(models.ImagePath, {
      foreignKey: 'parent_id',
      as: 'images',
      scope: {
        posting_category: 13
      }
    });
  };

  return JobInfoWorkplaceIntroduction;
};