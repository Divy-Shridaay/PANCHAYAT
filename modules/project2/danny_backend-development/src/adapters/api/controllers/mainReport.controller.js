const { asyncHandler } = require("tranxpress");
const Villager = require("../../db/VillagerModel");
const SuccessResponse = require("../../../domain/Responses/SuccessResponse");
const CustomError = require("../../../domain/CustomError");
const mongoose = require("mongoose");
const Master = require("../../db/MasterModel");

exports.getMainReport = asyncHandler(async (req, res, next) => {
  const { village, financialYear, noticeFees = 0, total = 0 } = req.query;

  if (!village) {
    throw new CustomError("Please Select Village.", 400);
  }

  if (!financialYear) {
    throw new CustomError("Please Select Financial Year.", 400);
  }

  const parsednoticeFees = parseFloat(noticeFees);
  const parsedTotal = parseFloat(total);
if (!mongoose.Types.ObjectId.isValid(village)) {
  throw new CustomError("Invalid village id", 400);
}

if (!mongoose.Types.ObjectId.isValid(financialYear)) {
  throw new CustomError("Invalid financial year id", 400);
}

const villageId = new mongoose.Types.ObjectId(village);
const financialYearId = new mongoose.Types.ObjectId(financialYear);


  const master = await Master.findOne({ status: 1 });

  let master_lSarkari = 0;
  let master_lSivay = 0;
  let master_sSarkari = 0;
  let master_sSivay = 0;
  if (master) {
    master_lSarkari = parseFloat(master.lSarkari) || 0;
    master_lSivay = parseFloat(master.lSivay) || 0;
    master_sSarkari = parseFloat(master.sSarkari) || 0;
    master_sSivay = parseFloat(master.sSivay) || 0;
  }

  const pipeline = [
    {
      $match: {
        village: villageId,
        // accountNo: "150",
        // financialYear: financialYearId,
      },
    },
    {
      $addFields: {
        sarkari: { $toDouble: "$sarkari" },
        sivay: { $toDouble: "$sivay" },
      },
    },

    // // 👉 Lookup latest LandMaangnu
    {
      $lookup: {
        from: "LandMaangnu",
        let: { villagerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$villager", "$$villagerId"] },
                  { $eq: ["$financialYear", financialYearId] },
                ],
              },
            },
          },
          { $sort: { updatedAt: -1 } },
          { $limit: 1 },
          {
            $project: {
              fajal: { $toDouble: "$fajal" },
              left: { $toDouble: "$left" },
              // sarkari: { $toDouble: "$sarkari" },
              // sivay: { $toDouble: "$sivay" },
            },
          },
        ],
        as: "landMaangnu",
      },
    },
    {
      $addFields: {
        landMaangnu: { $arrayElemAt: ["$landMaangnu", 0] },
      },
    },
    // // 👉 Lookup LandRevenue
    {
      $lookup: {
        from: "LandRevenue",
        let: { villagerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$villager", "$$villagerId"] },
                  { $eq: ["$financialYear", financialYearId] },
                ],
              },
            },
          },
          {
            $project: {
              rotating: { $toDouble: "$rotating" },
              total: { $toDouble: "$total" },
            },
          },
        ],
        as: "landRevenue",
      },
    },

    // // 👉 Sum LandRevenue
    {
      $addFields: {
        rotating: { $sum: "$landRevenue.rotating" },
        revenueTotal: { $sum: "$landRevenue.total" },
      },
    },

    // // 👉 Set basic land values
    {
      $addFields: {
        sivay: { $ifNull: ["$sivay", 0] },
        sarkari: { $ifNull: ["$sarkari", 0] },
        left: { $ifNull: ["$landMaangnu.left", 0] },
        fajal: { $ifNull: ["$landMaangnu.fajal", 0] },
        total: {
          $add: [{ $ifNull: ["$landMaangnu.fajal", 0] }, "$revenueTotal"],
        },
      },
    },

    // // 👉 Compute difference and collumnTwentyOne
    {
      $addFields: {
        totalCalculated: {
          $add: [
            { $ifNull: ["$left", 0] },
            { $ifNull: ["$sivay", 0] },
            { $ifNull: ["$sarkari", 0] },
            { $ifNull: ["$rotating", 0] },
          ],
        },
        difference: {
          $subtract: [
            {
              $subtract: [
                {
                  $add: [
                    { $ifNull: ["$left", 0] },
                    { $ifNull: ["$sivay", 0] },
                    { $ifNull: ["$sarkari", 0] },
                    { $ifNull: ["$rotating", 0] },
                  ],
                },
                "$total",
              ],
            },
            "$sarkari",
          ],
        },
      },
    },

    {
      $addFields: {
        collumnTwentyOne: {
          $cond: [
            { $gt: ["$difference", 0] },
            { $round: ["$difference", 2] },
            0,
          ],
        },
      },
    },

    // // 👉 Compute landTotal = collumnTwentyOne + rotating + sivay
    {
      $addFields: {
        landTotal: {
          $add: [
            { $ifNull: ["$collumnTwentyOne", 0] },
            { $ifNull: ["$rotating", 0] },
            { $ifNull: ["$sivay", 0] },
          ],
        },
      },
    },

    // // Lookup latest LandMaangnu
    {
      $lookup: {
        from: "LandMaangnu",
        let: { villagerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$villager", "$$villagerId"] },
                  { $eq: ["$financialYear", financialYearId] },
                ],
              },
            },
          },
          { $sort: { updatedAt: -1 } },
          { $limit: 1 },
          {
            $project: {
              fajal: { $toDouble: "$fajal" },
              left: { $toDouble: "$left" },
              sarkari: { $toDouble: "$sarkari" },
              sivay: { $toDouble: "$sivay" },
            },
          },
        ],
        as: "landMaangnu",
      },
    },
    { $addFields: { landMaangnu: { $arrayElemAt: ["$landMaangnu", 0] } } },
    // // Lookup all LandRevenue
    {
      $lookup: {
        from: "LandRevenue",
        let: { villagerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$villager", "$$villagerId"] },
                  { $eq: ["$financialYear", financialYearId] },
                ],
              },
            },
          },
          {
            $project: {
              rotating: { $toDouble: "$rotating" },
              total: { $toDouble: "$total" },
            },
          },
        ],
        as: "landRevenue",
      },
    },
    // // Sum LandRevenue
    {
      $addFields: {
        rotating: { $sum: "$landRevenue.rotating" },
        revenueTotal: { $sum: "$landRevenue.total" },
      },
    },
    // // Merge LandMaangnu values
    {
      $addFields: {
        fajal: { $ifNull: ["$landMaangnu.fajal", 0] },
        left: { $ifNull: ["$landMaangnu.left", 0] },
        // sivay: { $ifNull: ["$landMaangnu.sivay", 0] },
        // sarkari: { $ifNull: ["$landMaangnu.sarkari", 0] },
        total: {
          $add: [
            { $ifNull: ["$landMaangnu.fajal", 0] },
            { $sum: "$landRevenue.total" },
          ],
        },
      },
    },
    // // Calculate totalCalculated
    {
      $addFields: {
        totalCalculated: {
          $add: [
            { $ifNull: ["$left", 0] },
            { $ifNull: ["$sivay", 0] },
            { $ifNull: ["$sarkari", 0] },
            { $ifNull: ["$rotating", 0] },
          ],
        },
      },
    },
    // // Calculate difference
    {
      $addFields: {
        difference: {
          $subtract: [
            { $subtract: ["$totalCalculated", "$total"] },
            "$sarkari",
          ],
        },
      },
    },
    // // Assign to columns
    {
      $addFields: {
        collumnTwentyOne: {
          $cond: [
            { $gt: ["$difference", 0] },
            { $round: ["$difference", 2] },
            0,
          ],
        },
        collumnTwentyTwo: {
          $cond: [
            { $lt: ["$difference", 0] },
            { $round: ["$difference", 2] },
            0,
          ],
        },
        landTotal: {
          $add: [
            { $ifNull: ["$collumnTwentyOne", 0] },
            { $ifNull: ["$rotating", 0] },
            { $ifNull: ["$sivay", 0] },
          ],
        },
      },
    },
    // // Lookup LocalFundMaangnu
    {
      $lookup: {
        from: "LocalFundMaangnu",
        let: { villagerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$villager", "$$villagerId"] },
                  { $eq: ["$financialYear", financialYearId] },
                ],
              },
            },
          },
          { $sort: { updatedAt: -1 } },
          { $limit: 1 },
          {
            $project: {
              fajal: { $toDouble: "$fajal" },
              left: { $toDouble: "$left" },
              pending: { $toDouble: "$pending" },
              rotating: { $toDouble: "$rotating" },
            },
          },
        ],
        as: "localMaangnu",
      },
    },
    { $addFields: { localMaangnu: { $arrayElemAt: ["$localMaangnu", 0] } } },

    // // Lookup LocalFundRevenue
    {
      $lookup: {
        from: "LocalFundRevenue",
        let: { villagerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$villager", "$$villagerId"] },
                  { $eq: ["$financialYear", financialYearId] },
                ],
              },
            },
          },
          {
            $project: {
              rotating: { $toDouble: "$rotating" },
              pending: { $toDouble: "$pending" },
              left: { $toDouble: "$left" },
            },
          },
        ],
        as: "localRevenue",
      },
    },
    // // Sum LocalRevenue
    {
      $addFields: {
        localRotating: { $sum: "$localRevenue.rotating" },
        localPending: { $sum: "$localRevenue.pending" },
        localLeft: { $sum: "$localRevenue.left" },
      },
    },
    // // Clean nulls from Maangnu
    {
      $addFields: {
        localFajal: { $ifNull: ["$localMaangnu.fajal", 0] },
        localMaangnuLeft: { $ifNull: ["$localMaangnu.left", 0] },
        localMaangnuPending: { $ifNull: ["$localMaangnu.pending", 0] },
        localMaangnuRotating: { $ifNull: ["$localMaangnu.rotating", 0] },
      },
    },
    // // Calculate totals
    {
      $addFields: {
        totalCalculatedLocal: {
          $add: ["$localLeft", "$localPending", "$localFajal"],
        },
        totalCalcLocal: {
          $add: [
            "$localMaangnuLeft",
            { $divide: [{ $multiply: ["$sarkari", master_lSarkari] }, 100] },
            { $divide: [{ $multiply: ["$sivay", master_lSivay] }, 100] },
            "$localRotating",
          ],
        },
      },
    },
    // // Final columns
    {
      $addFields: {
        collumnFourteenlocal: {
          $cond: [
            { $lt: ["$totalCalculatedLocal", "$totalCalcLocal"] },
            {
              $round: [
                { $subtract: ["$totalCalcLocal", "$totalCalculatedLocal"] },
                2,
              ],
            },
            0,
          ],
        },
        // collumnFifteen: {
        //   $cond: [
        //     { $gt: ["$totalCalculatedLocal", "$totalCalcLocal"] },
        //     {
        //       $round: [
        //         { $subtract: ["$totalCalculatedLocal", "$totalCalcLocal"] },
        //         2,
        //       ],
        //     },
        //     0,
        //   ],
        // },
      },
    },
    {
      $addFields: {
        localFourFivePanding: {
          $add: [
            { $divide: [{ $multiply: ["$sarkari", master_lSarkari] }, 100] },
            { $divide: [{ $multiply: ["$sivay", master_lSivay] }, 100] },
          ],
        },
      },
    },
    {
      $addFields: {
        localTotal: {
          $add: [
            "$collumnFourteenlocal",
            "$localFourFivePanding",
            "$localRotating",
          ],
        },
      },
    },

    {
      $lookup: {
        from: "EducationMaangnu",
        let: { villagerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$villager", "$$villagerId"] },
                  { $eq: ["$financialYear", financialYearId] },
                ],
              },
            },
          },
          { $sort: { updatedAt: -1 } },
          { $limit: 1 },
          {
            $project: {
              fajal: { $toDouble: "$fajal" },
              left: { $toDouble: "$left" },
              pending: { $toDouble: "$pending" },
              rotating: { $toDouble: "$rotating" },
            },
          },
        ],
        as: "educationMaangnu",
      },
    },
    {
      $addFields: {
        educationMaangnu: { $arrayElemAt: ["$educationMaangnu", 0] },
      },
    },

    {
      $lookup: {
        from: "EducationRevenue",
        let: { villagerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$villager", "$$villagerId"] },
                  { $eq: ["$financialYear", financialYearId] },
                ],
              },
            },
          },
          {
            $project: {
              rotating: { $toDouble: "$rotating" },
              pending: { $toDouble: "$pending" },
              left: { $toDouble: "$left" },
            },
          },
        ],
        as: "educationRevenue",
      },
    },
    // // Sum LocalRevenue
    {
      $addFields: {
        educationRotating: { $sum: "$educationRevenue.rotating" },
        educationPending: { $sum: "$educationRevenue.pending" },
        educationLeft: { $sum: "$educationRevenue.left" },
      },
    },
    {
      $addFields: {
        educationFajal: { $ifNull: ["$educationMaangnu.fajal", 0] },
        educationMaangnuLeft: { $ifNull: ["$educationMaangnu.left", 0] },
        educationMaangnuPending: { $ifNull: ["$educationMaangnu.pending", 0] },
        educationMaangnuRotating: {
          $ifNull: ["$educationMaangnu.rotating", 0],
        },
      },
    },

    // // Calculate totals
    {
      $addFields: {
        totalCalculatedEducation: {
          $add: ["$educationLeft", "$educationPending", "$educationFajal"],
        },
        totalCalcEducation: {
          $add: [
            "$educationMaangnuLeft",
            { $divide: [{ $multiply: ["$sarkari", master_sSarkari] }, 100] },
            { $divide: [{ $multiply: ["$sivay", master_sSivay] }, 100] },
            "$educationRotating",
          ],
        },
      },
    },
    // // Final columns
    {
      $addFields: {
        collumnFourteenEducation: {
          $cond: [
            { $lt: ["$totalCalculatedEducation", "$totalCalcEducation"] },
            {
              $round: [
                {
                  $subtract: [
                    "$totalCalcEducation",
                    "$totalCalculatedEducation",
                  ],
                },
                2,
              ],
            },
            0,
          ],
        },
        // collumnFifteen: {
        //   $cond: [
        //     { $gt: ["$totalCalculatedLocal", "$totalCalcLocal"] },
        //     {
        //       $round: [
        //         { $subtract: ["$totalCalculatedLocal", "$totalCalcLocal"] },
        //         2,
        //       ],
        //     },
        //     0,
        //   ],
        // },
      },
    },
    {
      $addFields: {
        educationFourFivePanding: {
          $add: [
            { $divide: [{ $multiply: ["$sarkari", master_sSarkari] }, 100] },
            { $divide: [{ $multiply: ["$sivay", master_sSivay] }, 100] },
          ],
        },
      },
    },
    {
      $addFields: {
        educationTotal: {
          $add: [
            "$collumnFourteenEducation",
            "$educationFourFivePanding",
            "$educationRotating",
          ],
        },
      },
    },
    {
      $addFields: {
        allTotals: {
          $add: [
            { $ifNull: ["$landTotal", 0] },
            { $ifNull: ["$localTotal", 0] },
            { $ifNull: ["$educationTotal", 0] },
            1,
          ],
        },
      },
    },
    {
      $match: {
        allTotals: { $gt: parsedTotal }, // 👉 Convert query param to number
      },
    },
    {
      $project: {
        name: 1,
        accountNo: 1,
        village: 1,
        financialYear: 1,
        sarkari: 1,
        sivay: 1,
        landData: {
          collumnTwentyOne: "$collumnTwentyOne",
          rotating: "$rotating",
          sivay: "$sivay",
          landTotal: "$landTotal",
        },
        localFundData: {
          localFourFivePanding: "$localFourFivePanding",
          localRotating: "$localRotating",
          collumnFourteenlocal: "$collumnFourteenlocal",
          localTotal: "$localTotal",
        },
        educationData: {
          collumnFourteenEducation: "$collumnFourteenEducation",
          educationFourFivePanding: "$educationFourFivePanding",
          educationRotating: "$educationRotating",
          educationTotal: "$educationTotal",
        },
        allTotals: 1, // Optional: include in output for debugging
      },
    },
  ];

  const villagers = await Villager.aggregate(pipeline);

  res.status(200).json(
    new SuccessResponse(
      {
        data: villagers,
        totalDocs: villagers.length,
      },
      "Fetched main report with totals"
    )
  );
});
