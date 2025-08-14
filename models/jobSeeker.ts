export default (sequelize: any, DataTypes: any) => {
  const JobSeeker = sequelize.define('JobSeeker', {
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
    name_kana: {
      type: DataTypes.STRING(255),
      comment: 'name_kana'
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      comment: 'birthdate'
    },
    sex: {
      type: DataTypes.TINYINT,
      comment: 'sex'
    },
    zip: {
      type: DataTypes.STRING(8),
      comment: 'zip'
    },
    prefectures: {
      type: DataTypes.TINYINT,
      comment: 'prefectures'
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
    desired_working_place_1: {
      type: DataTypes.TEXT,
      comment: 'desired_working_place_1'
    },
    desired_working_place_2: {
      type: DataTypes.TEXT,
      comment: 'desired_working_place_2'
    },
    other_desired_criteria: {
      type: DataTypes.TEXT,
      comment: 'other_desired_criteria'
    },
    reset_token: { type: DataTypes.STRING, allowNull: true },
    token_expiry: { type: DataTypes.DATE, allowNull: true },
    email_confirm_token: { type: DataTypes.STRING, allowNull: true },
    email_confirm_token_expiry: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: true },
    service_content: { type: DataTypes.INTEGER, allowNull: true },
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
    tableName: 'job_seekers',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['email']
      }
    ]
  });

  JobSeeker.associate = function (models: any) {
    // Associations
    JobSeeker.belongsToMany(models.EmploymentType, {
      through: models.JobSeekersEmploymentType,
      foreignKey: 'job_seeker_id',
      as: 'employmentTypes'
    });

    JobSeeker.belongsToMany(models.DesiredCondition, {
      through: models.JobSeekersDesiredCondition,
      foreignKey: 'job_seeker_id',
      as: 'desiredConditions'
    });

    JobSeeker.hasMany(models.ApplicationHistory, {
      foreignKey: 'job_seeker_id',
      as: 'applications'
    });

    JobSeeker.hasMany(models.FavoriteJob, {
      foreignKey: 'job_seeker_id',
      as: 'favoriteJobs'
    });

    JobSeeker.hasMany(models.Chat, {
      foreignKey: 'job_seeker_id',
      as: 'chats'
    });

    JobSeeker.hasOne(models.ImagePath, {
      foreignKey: 'parent_id',
      constraints: false,
      as: 'avatar', // used when including thumbnail in queries
    });

    // JobSeeker.hasMany(models.JobSeekerJobMemo, {
    //   foreignKey: 'job_seeker_id',
    //   as: 'jobMemos'
    // });
  };


  // Instance methods
  JobSeeker.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return JobSeeker;
};