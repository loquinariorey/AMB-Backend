export default (sequelize: any, DataTypes: any) => {
  const FavoriteJob = sequelize.define('FavoriteJob', {
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
    job_info_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'job_info_id'
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
    tableName: 'favorite_jobs',
    timestamps: false,
    indexes: [
      {
        fields: ['job_seeker_id']
      },
      {
        fields: ['job_info_id']
      }
    ]
  });

  FavoriteJob.associate = function(models: any) {
    FavoriteJob.belongsTo(models.JobSeeker, {
      foreignKey: 'job_seeker_id',
      as: 'jobSeeker'
    });

    FavoriteJob.belongsTo(models.JobInfo, {
      foreignKey: 'job_info_id',
      as: 'jobInfo'
    });
  };

  return FavoriteJob;
};