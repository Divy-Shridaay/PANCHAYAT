const generateCrudRoutes = require("mongoose-crud-generator");
const ReportRemark = require("../../db/ReportRemarksModel");

const checkPermission = require("../middlewares/checkPermission");

const ReportRemarkRouter = generateCrudRoutes({
  model: ReportRemark ,
  modelName: "Remark",
  middlewareOptions: {
    beforeGetAll: checkPermission("REPORTS_REMARK_READ"),
    beforeGetById: checkPermission("REPORTS_REMARK_READ"),
    beforeCreate: checkPermission("REPORTS_REMARK_CREATE"),
    beforeUpdate: checkPermission("REPORTS_REMARK_UPDATE"),
    beforeSoftDelete: checkPermission("REPORTS_REMARK_DELETE"),
  },
});

module.exports = ReportRemarkRouter;
