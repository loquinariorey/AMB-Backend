export default (sequelize: any, DataTypes: any) => {
  const JobInfosRecruitingCriteria = sequelize.define('JobInfosRecruitingCriteria', {
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
    recruiting_criteria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'recruiting_criteria_id'
    },
    body: {
      type: DataTypes.TEXT,
      comment: 'body'
    },
    public_status: {
      type: DataTypes.TINYINT,
      comment: 'public_status'
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
    tableName: 'job_infos_recruiting_criterias',
    timestamps: false,
    indexes: [
      {
        fields: ['job_info_id']
      },
      {
        fields: ['recruiting_criteria_id']
      }
    ]
  });

  JobInfosRecruitingCriteria.associate = function(models: any) {
    // Associations are defined in the related models
  };

  return JobInfosRecruitingCriteria;
};