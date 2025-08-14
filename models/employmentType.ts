export default (sequelize: any, DataTypes: any) => {
  const EmploymentType = sequelize.define('EmploymentType', {
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
    tableName: 'employment_types',
    timestamps: false
  });

  EmploymentType.associate = function(models: any) {
    // Associations
    EmploymentType.hasMany(models.JobInfo, {
      foreignKey: 'employment_type_id',
      as: 'jobInfos'
    });

    EmploymentType.belongsToMany(models.JobSeeker, {
      through: models.JobSeekersEmploymentType,
      foreignKey: 'employment_type_id',
      as: 'jobSeekers'
    });
  };

  return EmploymentType;
};