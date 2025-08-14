export default (sequelize: any, DataTypes: any) => {
  const RecruitingCriteria = sequelize.define('RecruitingCriteria', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'id'
    },
    calling_name: {
      type: DataTypes.STRING(255),
      comment: 'calling_name'
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
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'display_order'
    },
    clinic_flg: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: 'clinic_flg'
    }
  }, {
    tableName: 'recruiting_criterias',
    timestamps: false
  });

  RecruitingCriteria.associate = function(models: any) {
    // Associations
    RecruitingCriteria.belongsToMany(models.JobInfo, {
      through: models.JobInfosRecruitingCriteria,
      foreignKey: 'recruiting_criteria_id',
      as: 'jobInfos'
    });
  };

  return RecruitingCriteria;
};