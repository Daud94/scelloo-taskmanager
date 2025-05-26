import { Model, DataTypes } from 'sequelize'

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
            as: 'user',
        })
    }

    static initModel(sequelize) {
        Task.init(
            {
                userId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'Users',
                        key: 'id',
                    },
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
                    defaultValue: 'pending',
                },
                startDate: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                endDate: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                dueDate: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
            },
            {
                sequelize,
                modelName: 'Task',
                tableName: 'Tasks',
            }
        )

        return Task
    }
}
