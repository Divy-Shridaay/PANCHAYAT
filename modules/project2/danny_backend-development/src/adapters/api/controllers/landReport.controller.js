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

  // Define taluka IDs for local fund logic
  const MANSA_TALUKA_ID = "685bcc702ce99c46af25d53a";
  // TODO: Find and replace with actual Vijapur taluka ID
  const VIJAPUR_TALUKA_ID = "find_vijapur_taluka_id_in_database";

  let isLocal = false;
  // Check by taluka ID for more reliability
  if ([MANSA_TALUKA_ID, VIJAPUR_TALUKA_ID].includes(villageData.taluka.toString())) {
    isLocal = true;
  }

  // DEBUG: Check MongoDB collection names
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("🔍 Available collections:", collections.map(c => c.name));

  // Get total count
  const totalDocs = await Villager.countDocuments({ village });

  // Convert to ObjectIds for aggregation
  const villageObjectId = new mongoose.Types.ObjectId(village);
  const financialYearObjectId = new mongoose.Types.ObjectId(financialYear);

  // Single aggregation pipeline with $lookup - eliminates N+1 queries
  const villagers = await Villager.aggregate([
    // Match village
    { $match: { village: villageObjectId } },
    
    // Join with LandMaangnu
    {
      $lookup: {
        from: "LandMaangnu",
        let: { villager_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$villager", "$$villager_id"] },
                  { $eq: ["$financialYear", financialYearObjectId] },
                ],
              },
            },
          },
          { $sort: { updatedAt: -1 } },
          { $limit: 1 },
        ],
        as: "landMaangnu",
      },
    },
    
    // Join with LandRevenue
    {
      $lookup: {
        from: "LandRevenue",
        let: { villager_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$villager", "$$villager_id"] },
                  { $eq: ["$financialYear", financialYearObjectId] },
                ],
              },
            },
          },
        ],
        as: "landRevenue",
      },
    },
    
    // Sort
    { $sort: { importOrder: 1 } },
    
    // Pagination
    { $skip: (parseInt(page) - 1) * parseInt(limit) },
    { $limit: parseInt(limit) },
  ]);

  // Calculate totals using map
  const totals = {
    left: 0,
    sarkari: 0,
    sivay: 0,
    rotating: 0,
    pending: 0,
    fajal: 0,
    total: 0,
    local: 0,
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

  villagers.forEach((villager) => {
    // Local fund calculation
    let local = 0;
    if (isLocal && !["વિજાપુર"].includes(taluka.name.trim())) {
      local = parseFloat(villager.sarkari * 2 + villager.sivay * 2);
    } else if (isLocal && ["વિજાપુર"].includes(taluka.name.trim())) {
      local = parseFloat(villager.sarkari / 2 + villager.sivay / 2);
    }
    villager.local = local;
    totals.local += parseFloat(local || 0);

    // Base values
    totals.baseSarkari += parseFloat(villager.sarkari || 0);
    totals.baseSivay += parseFloat(villager.sivay || 0);
    totals.j_a += parseFloat(villager.j_a || 0);
    totals.j_m += parseFloat(villager.j_m || 0);
    totals.l_m += parseFloat(villager.l_m || 0);
    totals.s_m += parseFloat(villager.s_m || 0);

    // Extract landMaangnu (always array with 0 or 1 element due to pipeline)
    const landMaangnu = villager.landMaangnu?.[0];

    // Calculate rotating and total
    if (Array.isArray(villager.landRevenue) && villager.landRevenue.length > 0) {
      const rotatingSum = villager.landRevenue.reduce(
        (sum, x) => sum + parseFloat(x.rotating || 0),
        0
      );
      const totalSum = villager.landRevenue.reduce(
        (sum, x) => sum + parseFloat(x.total || 0),
        0
      );
      const fajal = landMaangnu ? parseFloat(landMaangnu.fajal || 0) : 0;

      villager.rotating = landMaangnu ? parseFloat(landMaangnu.rotating || 0) : 0;
      villager.total = totalSum + fajal;

      // Get left from LandRevenue, but fallback to LandMaangnu if 0
      villager.left = villager.landRevenue.reduce(
        (sum, x) => sum + parseFloat(x.left || 0), 0
      );
      if (villager.left === 0) {
        villager.left = landMaangnu ? parseFloat(landMaangnu.left || 0) : 0;
      }
    } else {
      villager.rotating = landMaangnu ? parseFloat(landMaangnu.rotating || 0) : 0;
      villager.total = landMaangnu ? parseFloat(landMaangnu.fajal || 0) : 0;
      // Get left from LandMaangnu when no LandRevenue records
      villager.left = landMaangnu ? parseFloat(landMaangnu.left || 0) : 0;
    }

    // Set pending and fajal from LandMaangnu
    villager.pending = landMaangnu ? parseFloat(landMaangnu.pending || 0) : 0;
    villager.fajal = landMaangnu ? parseFloat(landMaangnu.fajal || 0) : 0;

    // Calculate totals for aggregation
    const left = parseFloat(villager.left || 0);
    const sivay = parseFloat(villager.sivay || 0);
    const sarkari = parseFloat(villager.sarkari || 0);
    const rotating = parseFloat(villager.rotating || 0);
    const total = parseFloat(villager.total || 0);

    let totalCalculated = left + sivay + sarkari + rotating;
    if (isLocal) {
      totalCalculated = left + sivay + sarkari + rotating + local;
    }

    const difference = totalCalculated - total - sarkari;
    villager.collumnTwentyTwo = difference < 0 ? parseFloat(difference) : 0;
    villager.collumnTwentyOne = difference > 0 ? parseFloat(difference) : 0;
    villager.collumnSevenTeen = totalCalculated;

    // Accumulate totals
    totals.left += left;
    totals.sarkari += sarkari;
    totals.sivay += sivay;
    totals.rotating += rotating;
    totals.pending += parseFloat(villager.pending || 0);
    totals.fajal += parseFloat(villager.fajal || 0);
    totals.total += total;
    totals.collumnTwentyTwo += parseFloat(villager.collumnTwentyTwo);
    totals.collumnTwentyOne += parseFloat(villager.collumnTwentyOne);
    totals.collumnSevenTeen += totalCalculated;
  });

  // Add totals row
  const lastPage = Math.ceil(totalDocs / parseInt(limit));
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
