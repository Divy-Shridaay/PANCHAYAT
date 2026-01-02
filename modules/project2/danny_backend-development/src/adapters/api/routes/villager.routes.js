const generateCrudRoutes = require("mongoose-crud-generator");
const Villager = require("../../db/VillagerModel");
const checkPermission = require("../middlewares/checkPermission");
const FinancialYear = require("../../db/FinancialYearModel");
const LandMaangnu = require("../../db/LandMaangnuModel");
const LocalFundMaangnu = require("../../db/LocalFundMaangnuModel");
const EducationMaangnu = require("../../db/EducationMaangnuModel");

const villagerRouter = generateCrudRoutes({
  model: Villager,
  modelName: "Villagers",
  preHooksOptions: {
    create: async (req, _) => {
      req.body.createdBy = req.user;
      req.body.updatedBy = req.user;
    },
    update: async (req, _) => {
      req.body.updatedBy = req.user;
    },
  },
  middlewareOptions: {
    beforeGetAll: checkPermission("VILLAGERS_READ"),
    beforeGetById: checkPermission("VILLAGERS_READ"),
    beforeCreate: checkPermission("VILLAGERS_CREATE"),
    beforeUpdate: checkPermission("VILLAGERS_UPDATE"),
    beforeSoftDelete: checkPermission("VILLAGERS_DELETE"),
  },
  preHooksOptions: {
    getAll: async (req, res, response) => {
      console.log(req.query.filter);
    },
  },
  postHooksOptions: {
    create: async (req, res, response) => {
      let data = response.data;

      const financialYears = await FinancialYear.find({ status: 1 });
      const financialYearIds = financialYears.map((f) => f._id);

      const today = new Date();
      const formattedDate = today.toLocaleDateString("en-GB");

      // Prepare bulk arrays
      const landDocs = [];
      const localDocs = [];
      const educationDocs = [];

      for (const f of financialYearIds) {
        landDocs.push({
          villager: data._id,
          financialYear: f,
          date: formattedDate,
        });
        localDocs.push({
          villager: data._id,
          financialYear: f,
          date: formattedDate,
        });
        educationDocs.push({
          villager: data._id,
          financialYear: f,
          date: formattedDate,
        });
      }

      // Insert in bulk (parallel)
      await Promise.all([
        LandMaangnu.insertMany(landDocs),
        LocalFundMaangnu.insertMany(localDocs),
        EducationMaangnu.insertMany(educationDocs),
      ]);
    },
  },
});

module.exports = villagerRouter;
