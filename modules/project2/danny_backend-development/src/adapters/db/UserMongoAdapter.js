const UserRepositoryPort = require('../../ports/UserRepositoryPort');
const UserModel = require('./UserModel');

class UserMongoAdapter extends UserRepositoryPort {
  async getUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const users = await UserModel.find().skip(skip).limit(limit);
    const total = await UserModel.countDocuments();
    return { data: users, total };
  }

  async getUserById(id) {
    return UserModel.findById(id);
  }

  async createUser(user) {
    return UserModel.create(user);
  }

  async updateUser(id, user) {
    return UserModel.findByIdAndUpdate(id, user, { new: true });
  }

  async deleteUser(id) {
    return UserModel.findByIdAndDelete(id);
  }
}

module.exports = UserMongoAdapter;
