export default (sequelize: any, DataTypes: any) => {
  const JobSeekersEmploymentType = sequelize.define('JobSeekersEmploymentType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'id'
    },
    job_seeker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'job_seeker_id'
    },
    employment_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'employment_type_id'
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
    tableName: 'job_seekers_employment_types',
    timestamps: false,
    indexes: [
      {
        fields: ['job_seeker_id']
      },
      {
        fields: ['employment_type_id']
      }
    ]
  });

  JobSeekersEmploymentType.associate = function(models: any) {
    // Associations are defined in the related models
  };

  return JobSeekersEmploymentType;
};