export default (sequelize: any, DataTypes: any) => {
  const JobInfoStaffInfo = sequelize.define('JobInfoStaffInfo', {
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
    post: {
      type: DataTypes.STRING(255),
      comment: 'post'
    },
    last_name: {
      type: DataTypes.STRING(255),
      comment: 'last_name'
    },
    first_name: {
      type: DataTypes.STRING(255),
      comment: 'first_name'
    },
    last_name_romaji: {
      type: DataTypes.STRING(255),
      comment: 'last_name_romaji'
    },
    first_name_romaji: {
      type: DataTypes.STRING(255),
      comment: 'first_name_romaji'
    },
    introduction_text: {
      type: DataTypes.TEXT,
      comment: 'introduction_text'
    },
    order_by: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'order_by'
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
    tableName: 'job_info_staff_infos',
    timestamps: false,
    indexes: [
      {
        fields: ['job_info_id']
      }
    ]
  });

  JobInfoStaffInfo.associate = function (models: any) {
    JobInfoStaffInfo.belongsTo(models.JobInfo, {
      foreignKey: 'job_info_id',
      as: 'jobInfo'
    });
    JobInfoStaffInfo.hasMany(models.ImagePath, {
      foreignKey: 'parent_id',
      as: 'images',
      scope: {
        posting_category: 14
      }
    });
  };

  return JobInfoStaffInfo;
};