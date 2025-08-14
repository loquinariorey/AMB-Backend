export default (sequelize: any, DataTypes: any) => {
  const Chat = sequelize.define('Chat', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'id'
    },
    agency: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'agency'
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
    is_send_privacy: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
      comment: 'is_send_privacy'
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
    tableName: 'chats',
    timestamps: false,
    indexes: [
      {
        fields: ['job_info_id']
      },
      {
        fields: ['job_seeker_id']
      }
    ]
  });

  Chat.associate = function (models: any) {
    // Associations
    Chat.belongsTo(models.JobInfo, {
      foreignKey: 'job_info_id',
      as: 'jobInfo'
    });

    Chat.belongsTo(models.JobSeeker, {
      foreignKey: 'job_seeker_id',
      as: 'jobSeeker'
    });

    Chat.hasMany(models.ChatBody, {
      foreignKey: 'chat_id',
      as: 'messages'
    });

    Chat.hasOne(models.ApplicationHistory, {
      foreignKey: 'chat_id',
      as: 'application'
    });
  };

  return Chat;
};