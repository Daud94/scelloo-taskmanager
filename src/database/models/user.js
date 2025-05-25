import { Model, DataTypes } from 'sequelize';

export default class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        // define association here
    }

    static initModel(sequelize) {
        User.init({
            firstName: DataTypes.STRING,
            lastName: DataTypes.STRING,
            email: DataTypes.STRING,
            password: DataTypes.STRING,
            isEmailVerified: DataTypes.BOOLEAN,
            emailToken: DataTypes.STRING,
            tokenExpiry: DataTypes.DATE,
        }, {
            sequelize,
            modelName: 'User',
            tableName: 'Users',
        });

        return User;
    }
}