const { asyncHandler } = require("tranxpress");
const Villager = require("../../db/VillagerModel");
const SuccessResponse = require("../../../domain/Responses/SuccessResponse");
const CustomError = require("../../../domain/CustomError");
const EducationRevenue = require("../../db/EducationRevenueModel");
const EducationMaangnu = require("../../db/EducationMaangnuModel");
const Master = require("../../db/MasterModel");

exports.getEducationReport = asyncHandler(async (req, res) => {
  const { village, page = 1, limit = 10, financialYear } = req.query;
  if (!village) {
    throw new CustomError("Please Select Village.", 400);
  }

  const totalDocs = await Villager.countDocuments({ village });
  const villagers = await Villager.find({ village })
    .sort({ createdAt : 1 , accountNo: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const master = await Master.findOne({ status: 1 });

  const totals = {
    maangnuLeft: 0,
    maangnuRotating : 0,
    fajal: 0,
    pending: 0,
    rotating: 0,
    left: 0,
    sarkari: 0,
    sivay: 0,
    collumnFourteen: 0,
    collumnFifteen: 0,
  };

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

      const educationMaangnu = await EducationMaangnu.findOne({
        villager: villager._id,
        financialYear,
      }).sort({ updatedAt: -1 });


      

      if (educationMaangnu) {
        maangnuData = {
          rotating: parseFloat(educationMaangnu.rotating || 0),
          pending: parseFloat(educationMaangnu.pending || 0),
          maangnuLeft: parseFloat(educationMaangnu.left || 0),
          fajal: parseFloat(educationMaangnu.fajal || 0),
        };
      }

      // const educationRevenue = await EducationRevenue.findOne({
      //   villager: villager._id, financialYear
      // }).sort({ updatedAt: -1 });

      // if (educationRevenue) {
      //   revenueData = {
      //     rotating: parseFloat(educationRevenue.rotating || 0),
      //     pending: parseFloat(educationRevenue.pending || 0),
      //     left: parseFloat(educationRevenue.left || 0),
      //     billNo: educationRevenue.billNo || "",
      //     billDate: educationRevenue.billDate || "",
      //   };
      // }

      const educationRevenues = await EducationRevenue.find({
        villager: villager._id,
        financialYear,
      })

      if (Array.isArray(educationRevenues) && educationRevenues.length > 0) {
        revenueData = {
          rotating: educationRevenues.reduce(
            (sum, x) => sum + parseFloat(x.rotating || 0),
            0
          ),
          pending: educationRevenues.reduce(
            (sum, x) => sum + parseFloat(x.pending || 0),
            0
          ),
          left: educationRevenues.reduce(
            (sum, x) => sum + parseFloat(x.left || 0),
            0
          ),
          billNo: educationRevenues[0].billNo || "",
          billDate: educationRevenues[0].billDate || "",
        };
      }

      // Assign values to villager doc
      villager._doc.maangnuLeft = maangnuData.maangnuLeft;

      
      villager._doc.maangnuRotating = maangnuData.rotating; 
      villager._doc.fajal = maangnuData.fajal;
      villager._doc.billNo = revenueData.billNo;
      villager._doc.billDate = revenueData.billDate;
      villager._doc.pending = revenueData.pending;
      villager._doc.rotating = revenueData.rotating;
      villager._doc.left = revenueData.left;
      villager._doc.sarkari = parseFloat(
        ((parseFloat(villager.sarkari || 0) * master.sSarkari) / 100)
      );
      villager._doc.sivay = parseFloat(
        ((parseFloat(villager.sivay || 0) * master.sSivay) / 100)
      );

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
          ? parseFloat((totalCalc - totalCalculated))
          : 0;
      villager._doc.collumnFifteen =
        totalCalculated > totalCalc
          ? parseFloat((totalCalculated - totalCalc))
          : 0;

      // Totals
      totals.maangnuLeft += maangnuData.maangnuLeft;
      totals.maangnuRotating += maangnuData.rotating; 
      totals.fajal += maangnuData.fajal;
      totals.pending += revenueData.pending;
      totals.rotating += revenueData.rotating;
      totals.left += revenueData.left;
      totals.sarkari += parseFloat(villager._doc.sarkari);
      totals.sivay += parseFloat(villager._doc.sivay);

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



  // Add totals row
  villagers.push({
    isTotalRow: true,
    accountNo: "કુલ",
    name: "",
    maangnuLeft: totals.maangnuLeft,
    maangnuRotating : totals.maangnuRotating, 
    fajal: totals.fajal,
    pending: totals.pending,
    rotating: totals.rotating,
    left: totals.left,
    billNo: "",
    billDate: "",
    sarkari: totals.sarkari,
    sivay: totals.sivay,
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
      "Fetched education cess report with totals"
    )
  );
});
