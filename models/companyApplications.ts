export default (sequelize: any, DataTypes: any) => {
  const CompanyApplication = sequelize.define('CompanyApplication', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'id'
    },
    company_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'company_name'
    },
    department_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'department_name'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'name'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'email'
    },
    telephone: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'telephone'
    },
    inquiry: {
      type: DataTypes.STRING(512),
      comment: 'inquiry'
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
  }, {
    tableName: 'company_applications',
    timestamps: false,
  });

  return CompanyApplication;
};