export default (sequelize: any, DataTypes: any) => {
  const JobSeekersDesiredCondition = sequelize.define('JobSeekersDesiredCondition', {
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
    desired_condition_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'desired_condition_id'
    },
    body: {
      type: DataTypes.TEXT,
      comment: 'body'
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
    tableName: 'job_seekers_desired_conditions',
    timestamps: false,
    indexes: [
      {
        fields: ['job_seeker_id']
      },
      {
        fields: ['desired_condition_id']
      }
    ]
  });

  JobSeekersDesiredCondition.associate = function(models: any) {
    // Associations are defined in the related models
  };

  return JobSeekersDesiredCondition;
};