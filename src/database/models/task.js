import { Model, DataTypes } from 'sequelize';

export default class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        // define association here
        Task.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    }

    static initModel(sequelize) {
        Task.init({
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                }
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('pending', 'completed', 'in-progress'),
                allowNull: false,
                defaultValue: 'pending'
            },
            dueDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            startTime: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            endTime: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            timeSpent: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                comment: 'Time spent on task in minutes'
            }
        }, {
            sequelize,
            modelName: 'Task',
            tableName: 'Tasks',
        });

        return Task;
    }
}
