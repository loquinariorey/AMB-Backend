export default (sequelize: any, DataTypes: any) => {
  const ImagePath = sequelize.define('ImagePath', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'id'
    },
    image_name: {
      type: DataTypes.STRING(255),
      comment: 'image_name'
    },
    entity_path: {
      type: DataTypes.STRING(255),
      comment: 'entity_path'
    },
    posting_category: {
      type: DataTypes.TINYINT,
      comment: 'posting_category'
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'parent_id'
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
    tableName: 'image_paths',
    timestamps: false,
    indexes: [
      {
        fields: ['parent_id', 'posting_category']
      }
    ]
  });

  ImagePath.associate = function (models: any) {
    // The association will depend on posting_category
    // For job postings (posting_category = 1)
    ImagePath.belongsTo(models.JobInfo, {
      foreignKey: 'parent_id',
      constraints: false,
      as: 'jobInfo'
    });
    ImagePath.belongsTo(models.JobInfoStaffInfo, {
      foreignKey: 'parent_id',
      constraints: false,
      as: 'jobInfoStaffInfo'
    });
    ImagePath.belongsTo(models.JobInfoWorkplaceIntroduction, {
      foreignKey: 'parent_id',
      constraints: false,
      as: 'jobInfoWorkplaceIntroduction'
    });
    ImagePath.belongsTo(models.Column, {
      foreignKey: 'parent_id',
      constraints: false,
      as: 'columnThumbnail'
    });
    ImagePath.belongsTo(models.JobSeeker, {
      foreignKey: 'parent_id',
      constraints: false,
      as: 'avatar'
    });
  };

  return ImagePath;
};