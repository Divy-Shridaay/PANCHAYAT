// controllers/importData.controller.js
const xlsx = require("xlsx");
const { asyncHandler } = require("tranxpress");
const SuccessResponse = require("../../../domain/Responses/SuccessResponse");
const Villager = require("../../db/VillagerModel");
const LandMaangnu = require("../../db/LandMaangnuModel");
const LocalFundMaangnu = require("../../db/LocalFundMaangnuModel");
const EducationMaangnu = require("../../db/EducationMaangnuModel");
const Village = require("../../db/VillageModel");
const CustomError = require("../../../domain/CustomError");
const mongoose = require("mongoose");


exports.importData = asyncHandler(async (req, res) => {
  const { villageId, financialYear, rows } = req.body;

  if (!rows || !Array.isArray(rows) || rows.length === 0)
    throw new CustomError("No data found in request.", 400);

  if (!villageId || !financialYear)
    throw new CustomError("Missing villageId or financialYear", 400);

  const village = await Village.findById(villageId);
  if (!village) throw new CustomError("Please select a valid village.", 400);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB"); // dd/mm/yyyy

  // 🔹 Step 1: Extract account numbers and detect duplicates in rows
  const accountNos = rows
    .map((r) => r["ખાતા નંબર"]?.toString().trim())
    .filter(Boolean);

  const seen = new Set();
  for (const acc of accountNos) {
    if (seen.has(acc)) {
      throw new CustomError(`Duplicate account number found in uploaded data: ${acc}`, 400);
    }
    seen.add(acc);
  }

  // 🔹 Step 2: Fetch existing villagers from DB
  const villagerDocs = await Villager.find({
    village: villageId,
    accountNo: { $in: accountNos },
  });

  const existingVillagersMap = new Map();
  for (const v of villagerDocs) {
    existingVillagersMap.set(v.accountNo, v);
  }

  const newVillagers = [];
  const updatedVillagerPromises = [];
  const villagerIdMap = new Map(); // accountNo -> villagerId

  const landMaangnuBatch = [];
  const localFundMaangnuBatch = [];
  const educationMaangnuBatch = [];

  for (const row of rows) {
    const accountNo = row["ખાતા નંબર"]?.toString().trim();
    const name = row["નામ"]?.toString().trim();
    if (!accountNo) continue;

    const sarkari = parseFloat(row["સરકારી"]) || 0;
    const sivay = parseFloat(row["સિવાય"]) || 0;

    let villager = existingVillagersMap.get(accountNo);

    if (villager) {
      // Update existing villager
      villager.name = name;
      villager.sarkari = sarkari;
      villager.sivay = sivay;
      villager.status = 1;
      updatedVillagerPromises.push(villager.save());
    } else {
      // Create new villager
      newVillagers.push({
        village: villageId,
        accountNo,
        name,
        sarkari,
        sivay,
        status: 1,
      });
    }
  }

  // Insert new villagers and map their IDs
  const createdVillagers = await Villager.insertMany(newVillagers);
  createdVillagers.forEach((v) => {
    existingVillagersMap.set(v.accountNo, v);
  });

  // Wait for updated villagers
  await Promise.all(updatedVillagerPromises);

  // Prepare batch inserts for Maangnu models
  for (const row of rows) {
    const accountNo = row["ખાતા નંબર"]?.toString().trim();
    if (!accountNo) continue;

    const villager = existingVillagersMap.get(accountNo);
    if (!villager) continue;

    const commonPayload = {
      villager: villager._id,
      financialYear,
      date: formattedDate,
      status: 1,
    };

    landMaangnuBatch.push({
      ...commonPayload,
      left: parseFloat(row["જમીન પાછલી બાકી"]) || 0,
      fajal: parseFloat(row["જમીન ફાજલ"]) || 0,
      rotating: parseFloat(row["જમીન ફરતી"]) || 0,
    });

    localFundMaangnuBatch.push({
      ...commonPayload,
      left: parseFloat(row["લોકલ પાછલી બાકી"]) || 0,
      fajal: parseFloat(row["લોકલ ફાજલ"]) || 0,
      rotating: parseFloat(row["લોકલ ફરતી"]) || 0,
    });

    educationMaangnuBatch.push({
      ...commonPayload,
      left: parseFloat(row["શિક્ષણ પાછલી બાકી"]) || 0,
      fajal: parseFloat(row["શિક્ષણ ફાજલ"]) || 0,
      rotating: parseFloat(row["શિક્ષણ ફરતી"]) || 0,
    });
  }

  // Insert batches
  await Promise.all([
    LandMaangnu.insertMany(landMaangnuBatch),
    LocalFundMaangnu.insertMany(localFundMaangnuBatch),
    EducationMaangnu.insertMany(educationMaangnuBatch),
  ]);

  res
    .status(200)
    .json(new SuccessResponse(null, "Successfully imported JSON data."));
});

