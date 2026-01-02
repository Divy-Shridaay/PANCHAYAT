const generateCrudRoutes = require("mongoose-crud-generator");
const Role = require("../../db/RoleModels");
const checkPermission = require("../middlewares/checkPermission");

const options = {
  model: Role,
  modelName: "Role",
  preHooksOptions: {
    create: async (req, res) => {
      const lastRole = await Role.findOne().sort({ roleId: -1 });
      req.body.roleId = lastRole.roleId + 1;
    },
  },
  middlewareOptions: {
    beforeGetAll: checkPermission("ROLES_AND_PERMISSIONS_READ"),
    beforeGetById: checkPermission("ROLES_AND_PERMISSIONS_READ"),
    beforeCreate: checkPermission("ROLES_AND_PERMISSIONS_CREATE"),
    beforeUpdate: checkPermission("ROLES_AND_PERMISSIONS_UPDATE"),
    beforeSoftDelete: checkPermission("ROLES_AND_PERMISSIONS_DELETE"),
  },
};

const rolesRoute = generateCrudRoutes(options);

module.exports = rolesRoute;
