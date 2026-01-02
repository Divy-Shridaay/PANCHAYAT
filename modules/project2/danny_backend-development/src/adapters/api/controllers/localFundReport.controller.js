const { asyncHandler } = require("tranxpress");
const Villager = require("../../db/VillagerModel");
const SuccessResponse = require("../../../domain/Responses/SuccessResponse");
const CustomError = require("../../../domain/CustomError");
const LocalFundRevenue = require("../../db/LocalFundRevenueModel");
const LocalFundMaangnu = require("../../db/LocalFundMaangnuModel");
const Master = require("../../db/MasterModel");

exports.getLocalFundReport = asyncHandler(async (req, res) => {
  const { village, page = 1, limit = 10, financialYear } = req.query;
  if (!village) {
    throw new CustomError("Please Select Village.", 400);
  }

  const totalDocs = await Villager.countDocuments({ village });
  const villagers = await Villager.find({ village })
    .sort({ createdAt : 1 , accountNo: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const totals = {
    maangnuLeft: 0,
    maangnuRotating: 0, 
    fajal: 0,
    rotating: 0,
    pending: 0,
    left: 0,
    sarkari: 0,
    sivay: 0,
    collumnFourteen: 0,
    collumnFifteen: 0,
  };

  const master = await Master.findOne({ status: 1 });

  await Promise.all(
    villagers.map(async (villager) => {
      let maangnuData = {
        rotating: 0,
        pending: 0,
        maangnuLeft: 0,
        fajal: 0,
      };
      let revenueData = {
        rotating: 0,
        pending: 0,
        left: 0,
        billNo: "",
        billDate: "",
      };

      const localMaangnu = await LocalFundMaangnu.findOne({
        villager: villager._id,
        financialYear,
      }).sort({ updatedAt: -1 });

      if (localMaangnu) {
        maangnuData = {
          rotating: parseFloat(localMaangnu.rotating || 0),
          pending: parseFloat(localMaangnu.pending || 0),
          maangnuLeft: parseFloat(localMaangnu.left || 0),
          fajal: parseFloat(localMaangnu.fajal || 0),
        };
      }

      const localRevenue = await LocalFundRevenue.find({
        villager: villager._id,
        financialYear,
      });

      if (Array.isArray(localRevenue) && localRevenue.length > 0) {
        revenueData = {
          rotating: localRevenue.reduce(
            (sum, x) => sum + parseFloat(x.rotating || 0),
            0
          ),
          pending: localRevenue.reduce(
            (sum, x) => sum + parseFloat(x.pending || 0),
            0
          ),
          left: localRevenue.reduce(
            (sum, x) => sum + parseFloat(x.left || 0),
            0
          ),
          billNo: localRevenue[0].billNo || "",
          billDate: localRevenue[0].billDate || "",
        };
      }

      // Attach to villager object
      villager._doc.maangnuLeft = maangnuData.maangnuLeft;
      villager._doc.fajal = maangnuData.fajal;
      villager._doc.maangnuRotating = maangnuData.rotating
      villager._doc.billNo = revenueData.billNo;
      villager._doc.billDate = revenueData.billDate;
      villager._doc.rotating = revenueData.rotating;
      villager._doc.pending = revenueData.pending;
      villager._doc.left = revenueData.left;
      villager._doc.sarkari = ((villager.sarkari || 0) * master.lSarkari) / 100;
      villager._doc.sivay = ((villager.sivay || 0) * master.lSivay) / 100;

      const totalCalculated =
        revenueData.left + revenueData.pending + maangnuData.fajal + maangnuData.rotating;
        
      const totalCalc =
        maangnuData.maangnuLeft +
        villager._doc.sarkari +
        villager._doc.sivay +
        revenueData.rotating;

        
      // villager._doc.collumnFourteen =
      //   totalCalculated < totalCalc
      //     ? parseFloat((totalCalc - totalCalculated).toFixed(2))
      //     : 0;
      // villager._doc.collumnFifteen =
      //   totalCalculated > totalCalc
      //     ? parseFloat((totalCalculated - totalCalc).toFixed(2))
      //     : 0;
      villager._doc.collumnFourteen =
        totalCalculated < totalCalc
          ? parseFloat(totalCalc - totalCalculated)
          : 0;
      villager._doc.collumnFifteen =
        totalCalculated > totalCalc
          ? parseFloat(totalCalculated - totalCalc)
          : 0;

          console.log("parseFloat(totalCalc - totalCalculated)" , parseFloat(totalCalc - totalCalculated));
          
      // Add to totals
      totals.maangnuLeft += maangnuData.maangnuLeft;
      totals.maangnuRotating += maangnuData.rotating; 
      totals.fajal += maangnuData.fajal;
      totals.rotating += revenueData.rotating;
      totals.pending += revenueData.pending;
      totals.left += revenueData.left;
      totals.sarkari += villager._doc.sarkari;
      totals.sivay += villager._doc.sivay;

      // totals.collumnFourteen +=
      //   totalCalculated < totalCalc
      //     ? parseFloat((totalCalc - totalCalculated).toFixed(2))
      //     : 0;
      // totals.collumnFifteen +=
      //   totalCalculated > totalCalc
      //     ? parseFloat((totalCalculated - totalCalc).toFixed(2))
      //     : 0;
        totals.collumnFourteen +=
        totalCalculated < totalCalc
          ? parseFloat((totalCalc - totalCalculated))
          : 0;
      totals.collumnFifteen +=
        totalCalculated > totalCalc
          ? parseFloat((totalCalculated - totalCalc))
          : 0;
    })
  );

  villagers.sort((a, b) => {
  const na = parseInt(a.accountNo, 10);
  const nb = parseInt(b.accountNo, 10);

  // push NaN/non-numeric to the end
  const va = Number.isNaN(na) ? Number.POSITIVE_INFINITY : na;
  const vb = Number.isNaN(nb) ? Number.POSITIVE_INFINITY : nb;
  return va - vb;
});


  villagers.push({
    isTotalRow: true,
    accountNo: "કુલ",
    name: "",
    maangnuLeft: totals.maangnuLeft.toFixed(2),
    maangnuRotating : totals.maangnuRotating.toFixed(2), 
    fajal: totals.fajal.toFixed(2),
    rotating: totals.rotating.toFixed(2),
    pending: totals.pending.toFixed(2),
    left: totals.left.toFixed(2),
    billNo: "",
    billDate: "",
    sarkari: totals.sarkari.toFixed(2),
    sivay: totals.sivay.toFixed(2),
    collumnFourteen: totals.collumnFourteen,
    collumnFifteen: totals.collumnFifteen,
  });

  const lastPage = Math.ceil(totalDocs / limit);

  res.status(200).json(
    new SuccessResponse(
      {
        data: villagers,
        pagination: {
          totalDocs,
          lastPage,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
      "Fetched local fund report with totals"
    )
  );
});
