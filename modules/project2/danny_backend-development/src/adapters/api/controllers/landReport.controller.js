const { asyncHandler } = require("tranxpress");
const Villager = require("../../db/VillagerModel");
const LandRevenue = require("../../db/LandRevenueModel");
const SuccessResponse = require("../../../domain/Responses/SuccessResponse");
const CustomError = require("../../../domain/CustomError");
const LandMaangnu = require("../../db/LandMaangnuModel");
const { default: mongoose } = require("mongoose");
const Taluka = require("../../db/TalukaModel");
const Village = require("../../db/VillageModel");

exports.getLandReport = asyncHandler(async (req, res, next) => {
  const { village, page = 1, limit = 10, financialYear } = req.query;

  if (!village) {
    throw new CustomError("Please Select Village.", 400);
  }

  const villageData = await Village.findById(village);

  const taluka = await Taluka.findById(villageData.taluka);

  let isLocal = false;

  if (["માણસા", "વિજાપુર"].includes(taluka.name.trim())) {
    isLocal = true;
  }

  const totalDocs = await Villager.countDocuments({ village });
  const villagers = await Villager.find({ village })
    .sort({ createdAt : 1 , accountNo: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const totals = {
    // Enriched fields
    left: 0,
    sarkari: 0,
    sivay: 0,
    rotating: 0,
    pending: 0,
    fajal: 0,
    total: 0,
    local: 0,
    // Schema fields
    j_a: 0,
    j_m: 0,
    l_m: 0,
    s_m: 0,
    baseSarkari: 0,
    baseSivay: 0,
    collumnTwentyOne: 0,
    collumnTwentyTwo: 0,
    collumnSevenTeen: 0,
  };

  await Promise.all(
    villagers.map(async (villager) => {
      // --- Aggregate pre-existing schema fields ---
      let local = 0;
      if (isLocal && !["વિજાપુર"].includes(taluka.name.trim())) {
        local = parseFloat(villager.sarkari * 2 + villager.sivay * 2);
        villager._doc.local = local;
        totals.local += parseFloat(local || 0);
      }

      if (isLocal && ["વિજાપુર"].includes(taluka.name.trim())) {
        local = parseFloat(villager.sarkari / 2 + villager.sivay / 2);
        villager._doc.local = local;
        totals.local += parseFloat(local || 0);
      }

      totals.baseSarkari += parseFloat(villager.sarkari || 0);
      totals.baseSivay += parseFloat(villager.sivay || 0);
      totals.j_a += parseFloat(villager.j_a || 0);
      totals.j_m += parseFloat(villager.j_m || 0);
      totals.l_m += parseFloat(villager.l_m || 0);
      totals.s_m += parseFloat(villager.s_m || 0);

      // --- Attach dynamic fields ---
      const landMaangnu = await LandMaangnu.findOne({
        villager: villager._id,
        financialYear: new mongoose.Types.ObjectId(financialYear),
      }).sort({ updatedAt: -1 });

      const landRevenue = await LandRevenue.find({
        villager: villager._id,
        financialYear,
      });

      if (Array.isArray(landRevenue) && landRevenue.length > 0) {
        const rotatingSum = landRevenue.reduce(
          (sum, x) => sum + parseFloat(x.rotating || 0),
          0
        );
        const totalSum = landRevenue.reduce(
          (sum, x) => sum + parseFloat(x.total || 0),
          0
        );
        const fajal = landMaangnu ? parseFloat(landMaangnu.fajal || 0) : 0;

        villager._doc.rotating = landMaangnu
          ? parseFloat(landMaangnu.rotating || 0)
          : 0;

        villager._doc.total = totalSum + fajal;
      } else {
        villager._doc.rotating = landMaangnu ? parseFloat(landMaangnu.rotating || 0) : 0;
        villager._doc.total = landMaangnu
          ? parseFloat(landMaangnu.fajal || 0)
          : 0;
      }

      if (landMaangnu) {
        // villager._doc.rotating = landMaangnu.rotating || 0;
        villager._doc.pending = landMaangnu.pending || 0;
        villager._doc.left = landMaangnu.left || 0;
        villager._doc.fajal = landMaangnu.fajal || 0;
      } else {
        // villager._doc.rotating = 0;
        villager._doc.pending = 0;
        villager._doc.left = 0;
        villager._doc.fajal = 0;
      }

      const left = parseFloat(villager._doc.left || 0);
      const sivay = parseFloat(villager.sivay || 0);
      const sarkari = parseFloat(villager.sarkari || 0);
      const rotating = parseFloat(villager._doc.rotating || 0);
      const total = parseFloat(villager._doc.total || 0);
      const sarkari2 = parseFloat(villager._doc.sarkari || 0); // if needed separately

      let totalCalculated = left + sivay + sarkari + rotating;

      if (isLocal) {
        totalCalculated = left + sivay + sarkari + rotating + local;
      } else {
        totalCalculated = left + sivay + sarkari + rotating;
      }

      // You want: (totalCalculated - total) - sarkari2
      const difference = totalCalculated - total - sarkari2;

      villager._doc.collumnTwentyTwo =
        difference < 0 ? parseFloat(difference) : 0;
      villager._doc.collumnTwentyOne =
        difference > 0 ? parseFloat(difference) : 0;

      villager._doc.collumnSevenTeen = totalCalculated;

      // --- Aggregate enriched values ---
      totals.left += parseFloat(villager._doc.left || 0);
      totals.sarkari += parseFloat(villager.sarkari || 0);
      totals.sivay += parseFloat(villager.sivay || 0);
      totals.rotating += parseFloat(villager._doc.rotating || 0);
      totals.pending += parseFloat(villager.pending || 0);
      totals.fajal += parseFloat(villager._doc.fajal || 0);
      totals.total += parseFloat(villager._doc.total || 0);

      totals.collumnTwentyTwo += parseFloat(villager._doc.collumnTwentyTwo);
      totals.collumnTwentyOne += parseFloat(villager._doc.collumnTwentyOne);
      totals.collumnSevenTeen += parseFloat(villager._doc.collumnSevenTeen);
    })
  );

  villagers.sort((a, b) => {
    const na = parseInt(a.accountNo, 10);
    const nb = parseInt(b.accountNo, 10);

    const va = Number.isNaN(na) ? Number.POSITIVE_INFINITY : na;
    const vb = Number.isNaN(nb) ? Number.POSITIVE_INFINITY : nb;
    return va - vb;
  });

  const lastPage = Math.ceil(totalDocs / limit);

  villagers.push({
    isTotalRow: true,
    accountNo: "કુલ",
    name: "",
    left: totals.left,
    sarkari: totals.sarkari,
    sivay: totals.sivay,
    rotating: totals.rotating,
    pending: totals.pending,
    fajal: totals.fajal,
    total: totals.total,

    // Original schema totals
    j_a: totals.j_a.toFixed(2),
    j_m: totals.j_m.toFixed(2),
    l_m: totals.l_m.toFixed(2),
    s_m: totals.s_m.toFixed(2),
    baseSarkari: totals.baseSarkari.toFixed(2),
    baseSivay: totals.baseSivay.toFixed(2),
    collumnTwentyOne: Math.abs(totals.collumnTwentyOne),
    collumnTwentyTwo: Math.abs(totals.collumnTwentyTwo),
    local: totals.local,
    collumnSevenTeen: totals.collumnSevenTeen,
  });

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
      "Fetched land report with totals"
    )
  );
});
