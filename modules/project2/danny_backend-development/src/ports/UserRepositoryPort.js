// Defines the abstract interface
class UserRepositoryPort {
    async getUsers(page, limit) { throw new Error('Not implemented'); }
    async getUserById(id) { throw new Error('Not implemented'); }
    async createUser(user) { throw new Error('Not implemented'); }
    async updateUser(id, user) { throw new Error('Not implemented'); }
    async deleteUser(id) { throw new Error('Not implemented'); }
  }
  
  module.exports = UserRepositoryPort;
  