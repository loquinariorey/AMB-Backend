export default (sequelize: any, DataTypes: any) => {
  const JobInfo = sequelize.define(
    "JobInfo",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "id",
      },
      employer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "employer_id",
      },
      job_detail_page_template_id: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: "job_detail_page_template_id",
      },
      job_title: {
        type: DataTypes.STRING(255),
        comment: "job_title",
      },
      job_lead_statement: {
        type: DataTypes.TEXT,
        comment: "job_lead_statement",
      },
      public_status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        comment: "public_status",
      },
      short_appeal: {
        type: DataTypes.TEXT,
        comment: "short_appeal",
      },
      continuation_gift_money: {
        type: DataTypes.TEXT,
        comment: "continuation_gift_money",
      },
      job_posting_date: {
        type: DataTypes.DATE,
        comment: "job_posting_date",
      },
      header_image_catch_copy: {
        type: DataTypes.TEXT,
        comment: "header_image_catch_copy",
      },
      header_image_sub_catch_copy: {
        type: DataTypes.TEXT,
        comment: "header_image_sub_catch_copy",
      },
      comment: {
        type: DataTypes.TEXT,
        comment: "comment",
      },
      comment_public_status: {
        type: DataTypes.TINYINT,
        defaultValue: 2,
        comment: "comment_public_status",
      },
      clinic_points_public_status: {
        type: DataTypes.TINYINT,
        comment: "clinic_points_public_status",
      },
      youtube_url: {
        type: DataTypes.TEXT,
        comment: "youtube_url",
      },
      employment_type_id: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: "employment_type_id",
      },
      pay: {
        type: DataTypes.TEXT,
        comment: "pay",
      },
      job_category: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        comment: "job_category",
      },
      publication_only_flg: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "publication_only_flg",
      },
      clinic_form_public_status: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        comment: "clinic_form_public_status",
      },
      clinic_public_form_url: {
        type: DataTypes.STRING(255),
        comment: "clinic_public_form_url",
      },
      clinic_public_date_start: {
        type: DataTypes.STRING(8),
        allowNull: false,
        comment: "clinic_public_date_start",
      },
      clinic_public_date_end: {
        type: DataTypes.STRING(8),
        comment: "clinic_public_date_end",
      },
      another_url_text: {
        type: DataTypes.TEXT,
        comment: "another_url_text",
      },
      deleted: {
        type: DataTypes.DATE,
        comment: "deleted",
      },
      created: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: "created",
      },
      modified: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: "modified",
      },
    },
    {
      tableName: "job_infos",
      timestamps: false,
      indexes: [
        {
          fields: ["employer_id"],
        },
        {
          fields: ["employment_type_id"],
        },
        {
          fields: ["public_status"],
        },
        {
          fields: ["job_posting_date"],
        },
      ],
    }
  );

  JobInfo.associate = function (models: any) {
    // Associations
    JobInfo.belongsTo(models.Employer, {
      foreignKey: "employer_id",
      as: "employer",
    });

    JobInfo.belongsTo(models.EmploymentType, {
      foreignKey: "employment_type_id",
      as: "employmentType",
    });

    JobInfo.belongsToMany(models.Feature, {
      through: models.JobInfosFeature,
      foreignKey: "job_info_id",
      as: "features",
    });

    JobInfo.belongsToMany(models.RecruitingCriteria, {
      through: models.JobInfosRecruitingCriteria,
      foreignKey: "job_info_id",
      as: "recruitingCriterias",
    });

    JobInfo.hasMany(models.ApplicationHistory, {
      foreignKey: "job_info_id",
      as: "applications",
    });

    JobInfo.hasMany(models.FavoriteJob, {
      foreignKey: "job_info_id",
      as: "favorites",
    });

    JobInfo.hasMany(models.JobInfoClinicPoint, {
      foreignKey: "job_info_id",
      as: "clinicPoints",
    });

    JobInfo.hasMany(models.JobInfoStaffInfo, {
      foreignKey: "job_info_id",
      as: "staffInfos",
    });

    JobInfo.hasMany(models.JobInfoWorkplaceIntroduction, {
      foreignKey: "job_info_id",
      as: "workplaceIntroductions",
    });

    JobInfo.hasMany(models.ImagePath, {
      foreignKey: 'parent_id',
      as: 'jobThumbnails',
      scope: {
        posting_category: 11
      }
    });

    JobInfo.hasMany(models.Chat, {
      foreignKey: "job_info_id",
      as: "chats",
    });

    JobInfo.hasOne(models.JobAnalytic, {
      foreignKey: "job_info_id",
      as: "job_analytics",
    });

    // JobInfo.hasMany(models.JobSeekerJobMemo, {
    //   foreignKey: 'job_info_id',
    //   as: 'jobSeekerMemos'
    // });

    // JobInfo.hasMany(models.EmployerJobMemo, {
    //   foreignKey: 'job_info_id',
    //   as: 'employerMemos'
    // });
  };

  return JobInfo;
};
