"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (sequelize, DataTypes) => {
    const Interview = sequelize.define('Interview', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'id'
        },
        title: {
            type: DataTypes.STRING(255),
            comment: 'title'
        },
        description: {
            type: DataTypes.STRING(255),
            comment: 'description'
        },
        tag: {
            type: DataTypes.INTEGER,
            comment: 'tag'
        },
        category: {
            type: DataTypes.STRING(255),
            comment: 'category'
        },
        content: {
            type: DataTypes.STRING(65535),
            allowNull: false,
            comment: 'content'
        },
        view_cnt: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'view_cnt'
        },
        search_cnt: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'search_cnt'
        },
        favourite_cnt: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'favourite_cnt'
        },
        custom_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            comment: 'Numeric custom article ID set by admin (required)'
        },
        is_published: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Article visibility status (true=public, false=private)'
        },
        created: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: 'created'
        },
        deleted: {
            type: DataTypes.DATE,
            comment: 'deleted'
        },
        modified: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: 'modified'
        }
    }, {
        tableName: 'interviews',
        timestamps: false,
        indexes: [
            {
                fields: ['title']
            },
        ]
    });
    Interview.associate = function (models) {
        // Associate Interview with its thumbnail image in ImagePath
        Interview.hasOne(models.ImagePath, {
            foreignKey: 'parent_id',
            constraints: false,
            as: 'thumbnail', // used when including thumbnail in queries
        });
    };
    return Interview;
};
