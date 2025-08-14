export default (sequelize: any, DataTypes: any) => {
  const ChatBody = sequelize.define('ChatBody', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'id'
    },
    chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'chat_id'
    },
    is_readed: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
      comment: 'is_readed'
    },
    no: {
      type: DataTypes.INTEGER,
      comment: 'no'
    },
    sender: {
      type: DataTypes.TINYINT,
      comment: 'sender'
    },
    body: {
      type: DataTypes.TEXT,
      comment: 'body'
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
    deleted: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'deleted'
    },
    mail_send: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: 'mail_send'
    },
    chat_flg: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: 'chat_flg'
    },
    file_path: {
      type: DataTypes.STRING(255),
      comment: 'file_path'
    },
    file_name: {
      type: DataTypes.STRING(255),
      comment: 'file_name'
    }
  }, {
    tableName: 'chat_bodys',
    timestamps: false,
    indexes: [
      {
        fields: ['chat_id']
      },
      {
        fields: ['is_readed']
      }
    ]
  });

  ChatBody.associate = function(models: any) {
    // Associations
    ChatBody.belongsTo(models.Chat, {
      foreignKey: 'chat_id',
      as: 'chat'
    });
  };

  return ChatBody;
};