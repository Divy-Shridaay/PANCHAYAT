const generateCrudRoutes = require("mongoose-crud-generator");
const Village = require("../../db/VillageModel");
const checkPermission = require("../middlewares/checkPermission");

const villageRouter = generateCrudRoutes({
  model: Village,
  modelName: "Village",
  middlewareOptions: {
    beforeGetAll: checkPermission("VILLAGES_READ"),
    beforeGetById: checkPermission("VILLAGES_READ"),
    beforeCreate: checkPermission("VILLAGES_CREATE"),
    beforeUpdate: checkPermission("VILLAGES_UPDATE"),
    beforeSoftDelete: checkPermission("VILLAGES_DELETE"),
  },
});

module.exports = villageRouter;
