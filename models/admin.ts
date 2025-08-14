export default (sequelize: any, DataTypes: any) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'id'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Please enter a valid email address'
        }
      },
      comment: 'email'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'password'
    },
    role: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'role'
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
    tableName: 'admins',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['email']
      }
    ]
  });

  Admin.associate = function (models: any) {
    // Add associations here if needed
  };

  // Instance methods
  Admin.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return Admin;
};