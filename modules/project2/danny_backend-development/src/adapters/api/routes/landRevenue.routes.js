const generateCrudRoutes = require("mongoose-crud-generator");
const LandRevenue = require("../../db/LandRevenueModel");
const checkPermission = require("../middlewares/checkPermission");
const { default: mongoose } = require("mongoose");
const Villager = require("../../db/VillagerModel");
const Master = require("../../db/MasterModel");

const landRevenueRouter = generateCrudRoutes({
  model: LandRevenue,
  modelName: "Land Revenue",
  middlewareOptions: {
    beforeGetAll: checkPermission("LAND_REVENUE_READ"),
    beforeGetById: checkPermission("LAND_REVENUE_READ"),
    beforeCreate: checkPermission("LAND_REVENUE_CREATE"),
    beforeUpdate: checkPermission("LAND_REVENUE_UPDATE"),
    beforeSoftDelete: checkPermission("LAND_REVENUE_DELETE"),
  },
  preHooksOptions: {
    create: async (req, res) => {
      // const lastEntry = await mongoose
      //   .model("LandRevenue")
      //   .findOne({})
      //   .sort({ bookNo: -1 })
      //   .select("billNo bookNo")
      //   .lean();

      // // const nextBillNo = (parseInt(lastEntry?.billNo) || 0) + 1;
      // const nextBookNo = (parseInt(lastEntry?.bookNo) || 0) + 1;

      // req.body.billNo = nextBillNo;
      req.body.bookNo = 0;

      // const master = await Master.findOne({ status: 1 });

      // console.log(master);

      // const LIMIT_PER_BOOK = master.landRevenueBookLimit;

      // const villageId = req.body.village;
      // const financialYearId = req.body.financialYear;

      // // Step 1: Get all villagers in this village
      // const villagersInVillage = await Villager.find({ village: villageId })
      //   .select("_id")
      //   .lean();
      // const villagerIds = villagersInVillage.map((v) => v._id);

      // // Step 2: Get the latest LandRevenue entry in the village + financial year
      // const lastEntry = await LandRevenue.findOne({
      //   villager: { $in: villagerIds },
      //   financialYear: financialYearId,
      // })
      //   .sort({ bookNo: -1, billNo: -1 })
      //   .select("bookNo billNo")
      //   .lean();

      // // Step 3: Calculate next bookNo and billNo
      // let nextBookNo = 1;
      // let nextBillNo = 1;

      // if (lastEntry) {
      //   const lastBillNo = Number(lastEntry.billNo) || 0;
      //   const lastBookNo = Number(lastEntry.bookNo) || 1;

      //   if (lastBillNo >= LIMIT_PER_BOOK) {
      //     nextBookNo = lastBookNo + 1;
      //     nextBillNo = 1;
      //   } else {
      //     nextBookNo = lastBookNo;
      //     nextBillNo = lastBillNo + 1;
      //   }
      // }

      // console.log(lastEntry || "No previous entry found");
      // console.log("Next bookNo:", nextBookNo);
      // console.log("Next billNo:", nextBillNo);

      // req.body.bookNo = nextBookNo;
      // req.body.billNo = nextBillNo;
    },
  },
});

module.exports = landRevenueRouter;
