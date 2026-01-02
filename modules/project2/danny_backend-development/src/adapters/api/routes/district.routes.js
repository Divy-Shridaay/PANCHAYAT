const generateCrudRoutes = require("mongoose-crud-generator");
const District = require("../../db/DistrictModel");
const checkPermission = require("../middlewares/checkPermission");

const districtRouter = generateCrudRoutes({
  model: District,
  modelName: "Districts",
  middlewareOptions: {
    beforeGetAll: checkPermission("DISTRICTS_READ"),
    beforeGetById: checkPermission("DISTRICTS_READ"),
    beforeCreate: checkPermission("DISTRICTS_CREATE"),
    beforeUpdate: checkPermission("DISTRICTS_UPDATE"),
    beforeSoftDelete: checkPermission("DISTRICTS_DELETE"),
  },
});

module.exports = districtRouter;
