const generateCrudRoutes = require("mongoose-crud-generator");
const LocalFundRevenue = require("../../db/LocalFundRevenueModel");
const checkPermission = require("../middlewares/checkPermission");
const { default: mongoose } = require("mongoose");
const Master = require("../../db/MasterModel");
const Villager = require("../../db/VillagerModel");

const localFundRevenueRouter = generateCrudRoutes({
  model: LocalFundRevenue,
  modelName: "Local Fund Revenue",
  middlewareOptions: {
    beforeGetAll: checkPermission("LOCAL_FUND_REVENUE_READ"),
    beforeGetById: checkPermission("LOCAL_FUND_REVENUE_READ"),
    beforeCreate: checkPermission("LOCAL_FUND_REVENUE_CREATE"),
    beforeUpdate: checkPermission("LOCAL_FUND_REVENUE_UPDATE"),
    beforeSoftDelete: checkPermission("LOCAL_FUND_REVENUE_DELETE"),
  },
  preHooksOptions: {
    create: async (req, res) => {
      //   const lastEntry = await mongoose
      //     .model("LocalFundRevenue")
      //     .findOne({})
      //     .sort({ billNo: -1 })
      //     .select("billNo bookNo")
      //     .lean();

      // // const nextBillNo = (parseInt(lastEntry?.billNo) || 0) + 1;
      //   const nextBookNo = (parseInt(lastEntry?.bookNo )|| 0) + 1;

        // req.body.billNo = nextBillNo;
        req.body.bookNo = 0;

      // const master = await Master.findOne({ status: 1 });

      // console.log(master);

      // const LIMIT_PER_BOOK = master.localFundRevenueBookLimit;

      // const villageId = req.body.village;
      // const financialYearId = req.body.financialYear;

      // console.log(villageId);
      // console.log(financialYearId);

      // // Step 1: Get all villagers in this village
      // const villagersInVillage = await Villager.find({ village: villageId })
      //   .select("_id")
      //   .lean();
      // const villagerIds = villagersInVillage.map((v) => v._id);

      // console.log(villagerIds);

      // // Step 2: Get the latest LocalFundRevenue entry in the village + financial year
      // const lastEntry = await LocalFundRevenue.findOne({
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

module.exports = localFundRevenueRouter;
