const generateCrudRoutes = require("mongoose-crud-generator");
const Master = require("../../db/MasterModel");
const checkPermission = require("../middlewares/checkPermission");

const masterRouter = generateCrudRoutes({
  model: Master,
  modelName: "Master",
  middlewareOptions: {
    beforeGetAll: checkPermission("MASTER_READ"),
    beforeGetById: checkPermission("MASTER_READ"),
    beforeCreate: checkPermission("MASTER_CREATE"),
    beforeUpdate: checkPermission("MASTER_UPDATE"),
    beforeSoftDelete: checkPermission("MASTER_DELETE"),
  },
});

module.exports = masterRouter;
