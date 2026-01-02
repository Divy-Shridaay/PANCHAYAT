const generateCrudRoutes = require("mongoose-crud-generator");
const Permission = require("../../db/PermissionModel");
const checkPermission = require("../middlewares/checkPermission");

const options = {
  model: Permission,
  modelName: "Permission",
  middlewareOptions: {
    beforeGetAll: checkPermission("ROLES_AND_PERMISSIONS_READ"),
    beforeGetById: checkPermission("ROLES_AND_PERMISSIONS_READ"),
    beforeCreate: checkPermission("ROLES_AND_PERMISSIONS_CREATE"),
    beforeUpdate: checkPermission("ROLES_AND_PERMISSIONS_UPDATE"),
    beforeSoftDelete: checkPermission("ROLES_AND_PERMISSIONS_DELETE"),
  },
  preHooksOptions: {
    create: async (req, _) => {
      req.body.createdBy = req.user;
      req.body.updatedBy = req.user;
    },
    update: async (req, _) => {
      req.body.updatedBy = req.user;
    },
  },
};

const permissionRoute = generateCrudRoutes(options);

module.exports = permissionRoute;
