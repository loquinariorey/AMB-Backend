export default (sequelize: any, DataTypes: any) => {
  const SearchItem = sequelize.define('SearchItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'id'
    },
    feature_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'feature_id'
    },
    display_flg: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: 'display_flg'
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
    tableName: 'search_items',
    timestamps: false,
    indexes: [
      {
        fields: ['feature_id']
      }
    ]
  });

  SearchItem.associate = function(models: any) {
    SearchItem.belongsTo(models.Feature, {
      foreignKey: 'feature_id',
      as: 'feature'
    });
  };

  return SearchItem;
};