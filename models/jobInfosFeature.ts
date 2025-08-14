export default (sequelize: any, DataTypes: any) => {
  const JobInfosFeature = sequelize.define('JobInfosFeature', 
    {
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
    feature_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'feature_id'
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
    tableName: 'job_infos_features',
    timestamps: false,
    indexes: [
      {
        fields: ['job_info_id']
      },
      {
        fields: ['feature_id']
      }
    ]
  });

  JobInfosFeature.associate = function(models: any) {
    // Associations are defined in the related models
  };

  return JobInfosFeature;
};