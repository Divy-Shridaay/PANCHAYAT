const generateCrudRoutes = require("mongoose-crud-generator");
const FinancialYear = require("../../db/FinancialYearModel");
const checkPermission = require("../middlewares/checkPermission");

const financialYearRouter = generateCrudRoutes({
  model: FinancialYear,
  modelName: "Financial Year",
  middlewareOptions: {
    beforeGetAll: checkPermission("FINANCIAL_YEAR_READ"),
    beforeGetById: checkPermission("FINANCIAL_YEAR_READ"),
    beforeCreate: checkPermission("FINANCIAL_YEAR_CREATE"),
    beforeUpdate: checkPermission("FINANCIAL_YEAR_UPDATE"),
    beforeSoftDelete: checkPermission("FINANCIAL_YEAR_DELETE"),
  },
  postHooksOptions: {
    getAll: (req, res, response) => {

          response.data.data.sort((a, b) => {
        const yearA = parseInt(a.financialYear.split("-")[0], 10);
        const yearB = parseInt(b.financialYear.split("-")[0], 10);
        return yearA - yearB;
      });

      // response.data.data.sort((a, b) => {
      //   const yearA = parseInt(a.financialYear.split("-")[0], 10);
      //   const yearB = parseInt(b.financialYear.split("-")[0], 10);
      //   return yearB - yearA; // swap for descending
      // });
    },
  },
});

module.exports = financialYearRouter;
