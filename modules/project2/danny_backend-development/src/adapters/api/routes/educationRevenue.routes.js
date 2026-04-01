const generateCrudRoutes = require("mongoose-crud-generator");
const EducationRevenue = require("../../db/EducationRevenueModel");
const checkPermission = require("../middlewares/checkPermission");
const { default: mongoose } = require("mongoose");
const Master = require("../../db/MasterModel");
const Villager = require("../../db/VillagerModel");

const educationRevenueRouter = generateCrudRoutes({
  model: EducationRevenue,
  modelName: "Education Revenue",
  middlewareOptions: {
    beforeGetAll: checkPermission("EDUCATION_REVENUE_READ"),
    beforeGetById: checkPermission("EDUCATION_REVENUE_READ"),
    beforeCreate: checkPermission("EDUCATION_REVENUE_CREATE"),
    beforeUpdate: checkPermission("EDUCATION_REVENUE_UPDATE"),
    beforeSoftDelete: checkPermission("EDUCATION_REVENUE_DELETE"),
  },
  preHooksOptions: {
    create: async (req, res) => {
      // const lastEntry = await mongoose
      //   .model("EducationRevenue")
      //   .findOne({})
      //   .sort({ billNo: -1 })
      //   .select("billNo bookNo")
      //   .lean();

      // // const nextBillNo = (parseInt(lastEntry?.billNo) || 0) + 1;
      // const nextBookNo = (parseInt(lastEntry?.bookNo) || 0) + 1;

      // req.body.billNo = nextBillNo;
      req.body.bookNo = 0;

      // const master = await Master.findOne({ status: 1 });

      // console.log(master);

      // const LIMIT_PER_BOOK = master.educationRevenueBookLimit;

      // const villageId = req.body.village;
      // const financialYearId = req.body.financialYear;

      // // Step 1: Get all villagers in this village
      // const villagersInVillage = await Villager.find({ village: villageId })
      //   .select("_id")
      //   .lean();
      // const villagerIds = villagersInVillage.map((v) => v._id);

      // // Step 2: Get the latest EducationRevenue entry in the village + financial year
      // const lastEntry = await EducationRevenue.findOne({
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

// Custom route for fetching education revenue by receipt number range
educationRevenueRouter.get('/range', checkPermission("EDUCATION_REVENUE_READ"), async (req, res) => {
  try {
    const { from, to, village, financialYear } = req.query;
    
    if (!from || !to || !village || !financialYear) {
      return res.status(400).json({ 
        status: false, 
        message: "from, to, village, and financialYear are required" 
      });
    }

    const records = await EducationRevenue.find({
      village,
      financialYear,
      billNo: { $gte: Number(from), $lte: Number(to) }
    }).lean();
    
    const left = records.reduce((sum, record) => sum + (record.left || 0), 0);
    const pending = records.reduce((sum, record) => sum + (record.pending || 0), 0);
    const rotating = records.reduce((sum, record) => sum + (record.rotating || 0), 0);
    
    res.json({ 
      status: true, 
      data: { 
        left, 
        pending, 
        rotating, 
        count: records.length 
      } 
    });
  } catch (error) {
    console.error("Error fetching education revenue range:", error);
    res.status(500).json({ 
      status: false, 
      message: "Internal server error" 
    });
  }
});

module.exports = educationRevenueRouter;
