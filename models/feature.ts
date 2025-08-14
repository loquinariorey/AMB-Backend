export default (sequelize: any, DataTypes: any) => {
  const Feature = sequelize.define('Feature', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'id'
    },
    parent_id: {
      type: DataTypes.INTEGER,
      comment: 'parent_id'
    },
    type: {
      type: DataTypes.TINYINT,
      comment: 'type'
    },
    name: {
      type: DataTypes.STRING(255),
      comment: 'name'
    },
    billing_flg: {
      type: DataTypes.BOOLEAN,
      comment: 'billing_flg'
    },
    price: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'price'
    },
    price_2: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'price_2'
    },
    price_3: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'price_3'
    },
    number_slot: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'number_slot'
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
    tableName: 'features',
    timestamps: false
  });

  Feature.associate = function(models: any) {
    // Self-reference for parent-child relationships
    Feature.belongsTo(Feature, {
      foreignKey: 'parent_id',
      as: 'parent'
    });
    
    Feature.hasMany(Feature, {
      foreignKey: 'parent_id',
      as: 'children'
    });

    // Associations with other models
    Feature.belongsToMany(models.JobInfo, {
      through: models.JobInfosFeature,
      foreignKey: 'feature_id',
      as: 'jobInfos'
    });

    Feature.hasMany(models.SearchItem, {
      foreignKey: 'feature_id',
      as: 'searchItems'
    });
  };

  return Feature;
};