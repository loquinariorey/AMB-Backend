export default (sequelize: any, DataTypes: any) => {
  const Employer = sequelize.define('Employer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'id'
    },
    clinic_name: {
      type: DataTypes.STRING(255),
      comment: 'clinic_name'
    },
    clinic_name_kana: {
      type: DataTypes.STRING(255),
      comment: 'clinic_name_kana'
    },
    paying_status: {
      type: DataTypes.TINYINT,
      defaultValue: 2,
      comment: 'paying_status'
    },
    subscription_id: {
      type: DataTypes.TEXT,
      comment: 'subscription_id'
    },
    subscription_regist_date: {
      type: DataTypes.STRING(8),
      comment: 'subscription_regist_date'
    },
    subscription_release_date: {
      type: DataTypes.STRING(8),
      comment: 'subscription_release_date'
    },
    business_form: {
      type: DataTypes.TINYINT,
      defaultValue: 2,
      comment: 'business_form'
    },
    zip: {
      type: DataTypes.STRING(8),
      comment: 'zip'
    },
    prefectures: {
      type: DataTypes.TINYINT,
      comment: 'prefectures'
    },
    city: {
      type: DataTypes.TEXT,
      comment: 'city'
    },
    closest_station: {
      type: DataTypes.TEXT,
      comment: 'closest_station'
    },
    tel: {
      type: DataTypes.STRING(20),
      comment: 'tel'
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
    home_page_url: {
      type: DataTypes.TEXT,
      comment: 'home_page_url'
    },
    access: {
      type: DataTypes.TEXT,
      comment: 'access'
    },
    director_name: {
      type: DataTypes.STRING(255),
      comment: 'director_name'
    },
    employee_number: {
      type: DataTypes.INTEGER,
      comment: 'employee_number'
    },
    establishment_year: {
      type: DataTypes.TEXT,
      comment: 'establishment_year'
    },
    customer_id: {
      type: DataTypes.STRING(255),
      comment: 'customer_id'
    },
    business: {
      type: DataTypes.TEXT,
      comment: 'business'
    },
    capital_stock: {
      type: DataTypes.STRING(100),
      comment: 'capital_stock'
    },
    reset_token: { type: DataTypes.STRING, allowNull: true },
    token_expiry: { type: DataTypes.DATE, allowNull: true },
    email_confirm_token: { type: DataTypes.STRING, allowNull: true },
    email_confirm_token_expiry: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: true },
    deleted: {
      type: DataTypes.DATE,
      comment: 'deleted'
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
    tableName: 'employers',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['email']
      }
    ]
  });

  Employer.associate = function (models: any) {
    // Associations
    Employer.hasMany(models.JobInfo, {
      foreignKey: 'employer_id',
      as: 'jobInfos'
    });


    Employer.hasOne(models.ImagePath, {
      foreignKey: 'parent_id',
      constraints: false,
      as: 'avatar', // used when including thumbnail in queries
    });
  };

  // Instance methods
  Employer.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return Employer;
};