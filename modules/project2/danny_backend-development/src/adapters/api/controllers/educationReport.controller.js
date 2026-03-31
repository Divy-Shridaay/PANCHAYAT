const { asyncHandler } = require("tranxpress");
const Villager = require("../../db/VillagerModel");
const SuccessResponse = require("../../../domain/Responses/SuccessResponse");
const CustomError = require("../../../domain/CustomError");
const EducationRevenue = require("../../db/EducationRevenueModel");
const EducationMaangnu = require("../../db/EducationMaangnuModel");
const Master = require("../../db/MasterModel");

exports.getEducationReport = asyncHandler(async (req, res) => {
  const { village, page = 1, limit = 10, financialYear } = req.query;

  // ✅ Permanent decimal fix
  const fix2 = (num) => Number(parseFloat(num || 0).toFixed(2));

  if (!village) {
    throw new CustomError("કૃપા કરીને ગામ પસંદ કરો.", 400);
  }

  const totalDocs = await Villager.countDocuments({ village });

  const villagers = await Villager.find({ village })
    .sort({ importOrder: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const master = await Master.findOne({ status: 1 });

  const totals = {
    maangnuLeft: 0,
    maangnuRotating: 0,
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
          rotating: fix2(educationMaangnu.rotating),
          pending: fix2(educationMaangnu.pending),
          maangnuLeft: fix2(educationMaangnu.left),
          fajal: fix2(educationMaangnu.fajal),
        };
      }

      const educationRevenues = await EducationRevenue.find({
        villager: villager._id,
        financialYear,
      });

      if (educationRevenues.length > 0) {
        revenueData = {
          rotating: fix2(
            educationRevenues.reduce((sum, x) => sum + fix2(x.rotating), 0)
          ),

          pending: fix2(
            educationRevenues.reduce((sum, x) => sum + fix2(x.pending), 0)
          ),

          left: fix2(
            educationRevenues.reduce((sum, x) => sum + fix2(x.left), 0)
          ),

          billNo: educationRevenues[0].billNo || "",
          billDate: educationRevenues[0].billDate || "",
        };
      }

      villager._doc.maangnuLeft = maangnuData.maangnuLeft;
      villager._doc.maangnuRotating = maangnuData.rotating;
      villager._doc.fajal = maangnuData.fajal;

      villager._doc.pending = revenueData.pending;
      villager._doc.rotating = revenueData.rotating;
      villager._doc.left = revenueData.left;

      villager._doc.billNo = revenueData.billNo;
      villager._doc.billDate = revenueData.billDate;

      villager._doc.sarkari = fix2(
        (fix2(villager.sarkari) * fix2(master.sSarkari)) / 100
      );

      villager._doc.sivay = fix2(
        (fix2(villager.sivay) * fix2(master.sSivay)) / 100
      );

      // ✅ column calculation
      const totalCalculated = fix2(
        fix2(revenueData.left) +
        fix2(revenueData.pending) +
        fix2(maangnuData.fajal) +
        fix2(maangnuData.rotating)
      );

      const totalCalc = fix2(
        fix2(maangnuData.maangnuLeft) +
        fix2(villager._doc.sarkari) +
        fix2(villager._doc.sivay) +
        fix2(revenueData.rotating)
      );

      villager._doc.collumnFourteen =
        totalCalc > totalCalculated
          ? fix2(totalCalc - totalCalculated)
          : 0;

      villager._doc.collumnFifteen =
        totalCalculated > totalCalc
          ? fix2(totalCalculated - totalCalc)
          : 0;

      totals.maangnuLeft += maangnuData.maangnuLeft;
      totals.maangnuRotating += maangnuData.rotating;
      totals.fajal += maangnuData.fajal;
      totals.pending += revenueData.pending;
      totals.rotating += revenueData.rotating;
      totals.left += revenueData.left;
      totals.sarkari += villager._doc.sarkari;
      totals.sivay += villager._doc.sivay;
      totals.collumnFourteen += villager._doc.collumnFourteen;
      totals.collumnFifteen += villager._doc.collumnFifteen;
    })
  );

  totals.maangnuLeft = fix2(totals.maangnuLeft);
  totals.maangnuRotating = fix2(totals.maangnuRotating);
  totals.fajal = fix2(totals.fajal);
  totals.pending = fix2(totals.pending);
  totals.rotating = fix2(totals.rotating);
  totals.left = fix2(totals.left);
  totals.sarkari = fix2(totals.sarkari);
  totals.sivay = fix2(totals.sivay);
  totals.collumnFourteen = fix2(totals.collumnFourteen);
  totals.collumnFifteen = fix2(totals.collumnFifteen);

  // No manual sort needed, already sorted by importOrder

  villagers.push({
    isTotalRow: true,
    accountNo: "કુલ",
    name: "",
    maangnuLeft: totals.maangnuLeft,
    maangnuRotating: totals.maangnuRotating,
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
      "શિક્ષણ સેસ રિપોર્ટ સફળતાપૂર્વક મેળવાયો"
    )
  );
});