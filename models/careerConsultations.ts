export default (sequelize: any, DataTypes: any) => {
  const CareerConsultation = sequelize.define('CareerConsultation', {
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
    birthday: {
      type: DataTypes.STRING(255),
      comment: 'birthday'
    },
    prefectures: {
      type: DataTypes.STRING(255),
      comment: 'prefectures'
    },
    experience: {
      type: DataTypes.INTEGER,
      comment: 'experience'
    },
    inquiry: {
      type: DataTypes.STRING(512),
      comment: 'inquiry'
    },
    desired_job_type: {
      type: DataTypes.STRING(255),
      comment: 'desired_job_type'
    },
    request: {
      type: DataTypes.STRING(512),
      comment: 'request'
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
    tableName: 'career_consultations',
    timestamps: false,
  });

  return CareerConsultation;
};