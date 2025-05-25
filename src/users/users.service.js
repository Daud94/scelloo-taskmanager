import db from "../database/models/index.js"
const {User} = db.sequelize.models;

class UsersService {
    async findOne({where}) {
        return await User.findOne(where);
    }

    async create(data) {
        return User.create(data);
    }

}

export default UsersService