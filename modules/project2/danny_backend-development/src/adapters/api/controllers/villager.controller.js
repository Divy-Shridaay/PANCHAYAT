const { asyncHandler } = require("tranxpress");
const Villager = require("../../db/VillagerModel");
const LandMaangnu = require("../../db/LandMaangnuModel");
const LocalFundMaangnu = require("../../db/LocalFundMaangnuModel");
const EducationMaangnu = require("../../db/EducationMaangnuModel");
const SuccessResponse = require("../../../domain/Responses/SuccessResponse");
const Master = require("../../db/MasterModel");
const Village = require("../../db/VillageModel");
const Taluka = require("../../db/TalukaModel");

exports.fetchVillagerByAccountNo = asyncHandler(async (req, res, next) => {
  try {
    const { accountNo, village, financialYear } = JSON.parse(
      req.query.filter || "{}"
    );

    console.log("Filter:", { accountNo, village, financialYear });

    // 🟢 Utility to safely convert number to 2 decimals
    const formatRupee = (val) => {
      const num = Number(val || 0);
      return Number(num.toFixed(2));
    };

    // 🟢 Fetch master data
    const master = await Master.findOne({ status: 1 });
    if (!master) return next(new Error("Active master record not found"));

    // 🟢 Get Village & Taluka info
    const villageData = await Village.findById(village).lean({ getters: true });
    if (!villageData) return next(new Error("Village not found"));

    const taluka = await Taluka.findById(villageData.taluka).lean({ getters: true });
    if (!taluka) return next(new Error("Taluka not found"));

    // 🟢 Determine locality
    const talukaName = taluka.name?.trim() || "";
    const isLocal = ["માણસા", "વિજાપુર"].includes(talukaName);

    // 🟢 Find villager record
    const villager = await Villager.findOne({
      accountNo: accountNo?.toString(),
      village,
    }).lean({ getters: true });

    if (!villager) return next(new Error("Villager not found"));

    // 🧮 Compute cess and local values
    const sarkari = parseFloat(villager?.sarkari || 0);
    const sivay = parseFloat(villager?.sivay || 0);

    const localSarkari = (sarkari * master.lSarkari) / 100;
    const localSivay = (sivay * master.lSivay) / 100;

    const eduSarkari = (sarkari * master.sSarkari) / 100;
    const eduSivay = (sivay * master.sSivay) / 100;

    // 🟢 Determine "local" additional value
    let local = 0;
    if (isLocal) {
      if (talukaName === "વિજાપુર") {
        local = sarkari / 2 + sivay / 2;
      } else {
        local = sarkari * 2 + sivay * 2;
      }
    }

    // 🟢 Apply year filter if present
    const filterByYear = financialYear ? { financialYear } : {};

    // 🟢 Fetch all related maangnu data in parallel
    const [landMaangnu, localFundMaangnu, educationCessMaangnu] =
      await Promise.all([
        LandMaangnu.findOne({ villager: villager._id, ...filterByYear }).lean({ getters: true }),
        LocalFundMaangnu.findOne({
          villager: villager._id,
          ...filterByYear,
        }).lean({ getters: true }),
        EducationMaangnu.findOne({
          villager: villager._id,
          ...filterByYear,
        }).lean({ getters: true }),
      ]);

    // 🧩 Construct clean response
    const responseData = {
      ...villager,

      landMaangnu: {
        ...(landMaangnu || {}),
        left: toFixed2(landMaangnu?.left),
        pending: toFixed2(sivay + local),
      },

      localFundMaangnu: {
        ...(localFundMaangnu || {}),
        left: toFixed2(localFundMaangnu?.left),
        pending: toFixed2(localSarkari + localSivay),
      },

      educationCessMaangnu: {
        ...(educationCessMaangnu || {}),
        left: toFixed2(educationCessMaangnu?.left),
        pending: toFixed2(eduSarkari + eduSivay),
      },
    };

    // 🟢 Send success response
    res
      .status(200)
      .json(new SuccessResponse(responseData, "Villager fetched successfully"));
  } catch (error) {
    next(error);
  }
});
