const express = require("express");
const mongoose = require("mongoose");
const { asyncHandler } = require("tranxpress");
const SuccessResponse = require("../../../domain/Responses/SuccessResponse");


const LocalFundMaangnu = require("../../db/LocalFundMaangnuModel");
const EducationCessMaangnu = require("../../db/EducationMaangnuModel");
const LandMaangnu = require("../../db/LandMaangnuModel");
const Villager = require("../../db/VillagerModel");
const LandRevenue = require("../../db/LandRevenueModel");
const LocalFundRevenue = require("../../db/LocalFundRevenueModel");
const EducationRevenue = require("../../db/EducationRevenueModel");

const allDeleteRouter = express.Router();

allDeleteRouter.delete(
  "/maangnu",
  asyncHandler(async (req, res, next) => {
    const { financialYear, village, type } = req.body;

    if (!financialYear || !village || !type) {
      return res
        .status(400)
        .json({ error: "financialYear, village and type are required" });
    }

    const financialYearId = new mongoose.Types.ObjectId(financialYear);
    const villageId = new mongoose.Types.ObjectId(village);

    let Model;

    if (type == "Land") {
      Model = LandMaangnu;
    } else if (type == "Local") {
      Model = LocalFundMaangnu; 
    } else if (type == "Education") {
      Model = EducationCessMaangnu; 
    } else {
      return res.status(400).json({ error: "Invalid type provided" });
    }

    const matches = await Model.aggregate([
      {
        $lookup: {
          from: "villagers",
          localField: "villager",
          foreignField: "_id",
          as: "villager",
        },
      },
      { $unwind: "$villager" },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$financialYear", financialYearId] },
              { $eq: ["$villager.village", villageId] },
            ],
          },
          status: 1,
        },
      },
      { $project: { _id: 1 } },
    ]);

    const idsToDelete = matches.map((m) => m._id);

    if (idsToDelete.length === 0) {
      return res
        .status(200)
        .json(
          new SuccessResponse({ data: null }, "No matching records found.")
        );
    }

    // Step 2: Delete matching records
    await Model.deleteMany({ _id: { $in: idsToDelete } });

    return res
      .status(200)
      .json(
        new SuccessResponse(
          { data: null },
          `${idsToDelete.length} records deleted successfully.`
        )
      );
  })
);

allDeleteRouter.delete(
  "/revenue",
  asyncHandler(async (req, res, next) => {
    const { financialYear, village, type } = req.body;

    if (!financialYear || !village || !type) {
      return res
        .status(400)
        .json({ error: "financialYear, village and type are required" });
    }

    const financialYearId = new mongoose.Types.ObjectId(financialYear);
    const villageId = new mongoose.Types.ObjectId(village);

    let Model;

    if (type == "Land") {
      Model = LandRevenue;
    } else if (type == "Local") {
      Model = LocalFundRevenue; 
    } else if (type == "Education") {
      Model = EducationRevenue; 
    } else {
      return res.status(400).json({ error: "Invalid type provided" });
    }

    const matches = await Model.aggregate([
      {
        $lookup: {
          from: "villagers",
          localField: "villager",
          foreignField: "_id",
          as: "villager",
        },
      },
      { $unwind: "$villager" },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$financialYear", financialYearId] },
              { $eq: ["$villager.village", villageId] },
            ],
          },
          status: 1,
        },
      },
      { $project: { _id: 1 } },
    ]);

    const idsToDelete = matches.map((m) => m._id);

    if (idsToDelete.length === 0) {
      return res
        .status(200)
        .json(
          new SuccessResponse({ data: null }, "No matching records found.")
        );
    }

    // Step 2: Delete matching records
    await Model.deleteMany({ _id: { $in: idsToDelete } });

    return res
      .status(200)
      .json(
        new SuccessResponse(
          { data: null },
          `${idsToDelete.length} records deleted successfully.`
        )
      );
  })
);

allDeleteRouter.delete(
  "/villager",
  asyncHandler(async (req, res, next) => {
    const { village } = req.body;

    if (!village) {
      return res
        .status(400)
        .json({ error: "village is required" });
    }

    const villageId = new mongoose.Types.ObjectId(village);

    // 1️⃣ Find all villagers in the given village
    const villagers = await Villager.find({ village: villageId }, { _id: 1 });
    const villagerIds = villagers.map(v => v._id);

    if (villagerIds.length === 0) {
      return res
        .status(200)
        .json(new SuccessResponse({ data: null }, "No villagers found for this village."));
    }

    // 2️⃣ Delete villagers
    await Villager.deleteMany({ _id: { $in: villagerIds } });

    // 3️⃣ Cascade delete in all Maangnu collections
    await Promise.all([
      LandMaangnu.deleteMany({ villager: { $in: villagerIds } }),
      LocalFundMaangnu.deleteMany({ villager: { $in: villagerIds } }),
      EducationCessMaangnu.deleteMany({ villager: { $in: villagerIds } }),
      LandRevenue.deleteMany({ villager: { $in: villagerIds } }),
      LocalFundRevenue.deleteMany({ villager: { $in: villagerIds } }),
      EducationRevenue.deleteMany({ villager: { $in: villagerIds } }),
    ]);

    return res
      .status(200)
      .json(
        new SuccessResponse(
          { data: null },
          `${villagerIds.length} villagers and related Maangnu and Vasulat records deleted successfully.`
        )
      );
  })
);

module.exports = allDeleteRouter;
