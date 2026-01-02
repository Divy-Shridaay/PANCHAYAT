const generateCrudRoutes = require("mongoose-crud-generator");
const Taluka = require("../../db/TalukaModel");
const checkPermission = require("../middlewares/checkPermission");

const talukaRouter = generateCrudRoutes({
  model: Taluka,
  modelName: "Taluka",
  middlewareOptions: {
    beforeGetAll: checkPermission("TALUKAS_READ"),
    beforeGetById: checkPermission("TALUKAS_READ"),
    beforeCreate: checkPermission("TALUKAS_CREATE"),
    beforeUpdate: checkPermission("TALUKAS_UPDATE"),
    beforeSoftDelete: checkPermission("TALUKAS_DELETE"),
  },
});

module.exports = talukaRouter;
