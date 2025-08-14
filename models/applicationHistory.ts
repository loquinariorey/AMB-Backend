export default (sequelize: any, DataTypes: any) => {
  const ApplicationHistory = sequelize.define('ApplicationHistory', {
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
    job_seeker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'job_seeker_id'
    },
    job_title: {
      type: DataTypes.STRING(255),
      comment: 'job_title'
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
    },
    chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'chat_id'
    }
  }, {
    tableName: 'application_histories',
    timestamps: false,
    indexes: [
      {
        fields: ['job_info_id']
      },
      {
        fields: ['job_seeker_id']
      },
      {
        fields: ['chat_id']
      }
    ]
  });

  ApplicationHistory.associate = function(models: any) {
    // Associations
    ApplicationHistory.belongsTo(models.JobInfo, {
      foreignKey: 'job_info_id',
      as: 'jobInfo'
    });

    ApplicationHistory.belongsTo(models.JobSeeker, {
      foreignKey: 'job_seeker_id',
      as: 'jobSeeker'
    });

    ApplicationHistory.belongsTo(models.Chat, {
      foreignKey: 'chat_id',
      as: 'chat'
    });
  };

  return ApplicationHistory;
};