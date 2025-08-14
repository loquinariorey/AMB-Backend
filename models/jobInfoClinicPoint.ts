export default (sequelize: any, DataTypes: any) => {
  const JobInfoClinicPoint = sequelize.define('JobInfoClinicPoint', {
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
    title: {
      type: DataTypes.STRING(255),
      comment: 'title'
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
    tableName: 'job_info_clinic_points',
    timestamps: false,
    indexes: [
      {
        fields: ['job_info_id']
      }
    ]
  });

  JobInfoClinicPoint.associate = function(models: any) {
    JobInfoClinicPoint.belongsTo(models.JobInfo, {
      foreignKey: 'job_info_id',
      as: 'jobInfo'
    });
  };

  return JobInfoClinicPoint;
};