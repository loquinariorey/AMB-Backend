export default (sequelize: any, DataTypes: any) => {
    const Column = sequelize.define('Column', {
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
        tableName: 'columns',
        timestamps: false,
        indexes: [
            {
                fields: ['title']
            },
        ]
    });

    Column.associate = function (models: any) {
        // Associate Column with its thumbnail image in ImagePath
        Column.hasOne(models.ImagePath, {
            foreignKey: 'parent_id',
            constraints: false,
            as: 'thumbnail', // used when including thumbnail in queries
        });
    };
    return Column;
};