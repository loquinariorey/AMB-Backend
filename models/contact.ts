export default (sequelize: any, DataTypes: any) => {
  const Contact = sequelize.define('Contact', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'id'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'name'
    },
    company_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'company_name'
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
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'inquiry'
    },
    inquiry_detail: {
      type: DataTypes.STRING(512),
      comment: 'inquiry_detail'
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
    tableName: 'contacts',
    timestamps: false,
  });

  return Contact;
};