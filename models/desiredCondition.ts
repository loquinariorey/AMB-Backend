export default (sequelize: any, DataTypes: any) => {
  const DesiredCondition = sequelize.define('DesiredCondition', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'id'
    },
    name: {
      type: DataTypes.STRING(255),
      comment: 'name'
    },
    additional_description: {
      type: DataTypes.TEXT,
      comment: 'additional_description'
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
    tableName: 'desired_conditions',
    timestamps: false
  });

  DesiredCondition.associate = function(models: any) {
    // Associations
    DesiredCondition.belongsToMany(models.JobSeeker, {
      through: models.JobSeekersDesiredCondition,
      foreignKey: 'desired_condition_id',
      as: 'jobSeekers'
    });
  };

  return DesiredCondition;
};