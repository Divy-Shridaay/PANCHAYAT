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
    .sort({ createdAt: 1, accountNo: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

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

  const master = await Master.findOne({ status: 1 }).lean();

  const villagerIds = villagers.map((v) => v._id);

  const [localMaangnus, localRevenues] = await Promise.all([
    LocalFundMaangnu.find({
      villager: { $in: villagerIds },
      financialYear,
    })
      .sort({ updatedAt: -1 })
      .lean(),
    LocalFundRevenue.find({
      villager: { $in: villagerIds },
      financialYear,
    }).lean(),
  ]);

  const localMaangnuMap = new Map();
  for (const doc of localMaangnus) {
    const id = doc.villager.toString();
    if (!localMaangnuMap.has(id)) localMaangnuMap.set(id, doc);
  }

  const localRevenueMap = new Map();
  for (const doc of localRevenues) {
    const id = doc.villager.toString();
    let agg = localRevenueMap.get(id);
    if (!agg) {
      agg = {
        rotating: 0,
        pending: 0,
        left: 0,
        billNo: doc.billNo || "",
        billDate: doc.billDate || "",
      };
      localRevenueMap.set(id, agg);
    }
    agg.rotating += parseFloat(doc.rotating || 0);
    agg.pending += parseFloat(doc.pending || 0);
    agg.left += parseFloat(doc.left || 0);
  }

  for (const villager of villagers) {
    const id = villager._id.toString();
    const localMaangnu = localMaangnuMap.get(id);
    const revenueAgg = localRevenueMap.get(id);

    const maangnuData = localMaangnu
      ? {
          rotating: parseFloat(localMaangnu.rotating || 0),
          pending: parseFloat(localMaangnu.pending || 0),
          maangnuLeft: parseFloat(localMaangnu.left || 0),
          fajal: parseFloat(localMaangnu.fajal || 0),
        }
      : {
          rotating: 0,
          pending: 0,
          maangnuLeft: 0,
          fajal: 0,
        };

    const revenueData = revenueAgg
      ? {
          rotating: revenueAgg.rotating,
          pending: revenueAgg.pending,
          left: revenueAgg.left,
          billNo: revenueAgg.billNo,
          billDate: revenueAgg.billDate,
        }
      : {
          rotating: 0,
          pending: 0,
          left: 0,
          billNo: "",
          billDate: "",
        };

    // Attach to villager object
    villager.maangnuLeft = maangnuData.maangnuLeft;
    villager.fajal = maangnuData.fajal;
    villager.maangnuRotating = maangnuData.rotating;
    villager.billNo = revenueData.billNo;
    villager.billDate = revenueData.billDate;
    villager.rotating = revenueData.rotating;
    villager.pending = revenueData.pending;
    villager.left = revenueData.left;
    villager.sarkari = ((villager.sarkari || 0) * master.lSarkari) / 100;
    villager.sivay = ((villager.sivay || 0) * master.lSivay) / 100;

    const totalCalculated =
      revenueData.left +
      revenueData.pending +
      maangnuData.fajal +
      maangnuData.rotating;

    const totalCalc =
      maangnuData.maangnuLeft +
      villager.sarkari +
      villager.sivay +
      revenueData.rotating;

    villager.collumnFourteen =
      totalCalculated < totalCalc ? parseFloat(totalCalc - totalCalculated) : 0;
    villager.collumnFifteen =
      totalCalculated > totalCalc ? parseFloat(totalCalculated - totalCalc) : 0;

    // Add to totals
    totals.maangnuLeft += maangnuData.maangnuLeft;
    totals.maangnuRotating += maangnuData.rotating;
    totals.fajal += maangnuData.fajal;
    totals.rotating += revenueData.rotating;
    totals.pending += revenueData.pending;
    totals.left += revenueData.left;
    totals.sarkari += villager.sarkari;
    totals.sivay += villager.sivay;
    totals.collumnFourteen +=
      totalCalculated < totalCalc ? parseFloat(totalCalc - totalCalculated) : 0;
    totals.collumnFifteen +=
      totalCalculated > totalCalc ? parseFloat(totalCalculated - totalCalc) : 0;
  }

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
