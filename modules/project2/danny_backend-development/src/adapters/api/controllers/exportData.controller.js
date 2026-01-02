const ExcelJS = require("exceljs");
const { asyncHandler } = require("tranxpress");
const CustomError = require("../../../domain/CustomError");
const Village = require("../../db/VillageModel");
const Villager = require("../../db/VillagerModel");
const FinancialYear = require("../../db/FinancialYearModel");

const LandMaangnu = require("../../db/LandMaangnuModel");
const LocalFundMaangnu = require("../../db/LocalFundMaangnuModel");
const EducationMaangnu = require("../../db/EducationMaangnuModel");
const { convertEngToGujNumber } = require("../../../utils/convertEngToGujNum");
const Master = require("../../db/MasterModel");
const Taluka = require("../../db/TalukaModel");
const District = require("../../db/DistrictModel");
const LandRevenue = require("../../db/LandRevenueModel");
const { default: mongoose } = require("mongoose");
const LocalFundRevenue = require("../../db/LocalFundRevenueModel");
const EducationRevenue = require("../../db/EducationRevenueModel");
const SuccessResponse = require("../../../domain/Responses/SuccessResponse");

// exports.exportData = asyncHandler(async (req, res) => {
//   const { villageId, taluka, district, financialYear } = req.body;

//   if (!villageId || !financialYear || !taluka || !district)
//     throw new CustomError("Missing villageId or financialYear or taluka or district", 400);

//   const village = await Village.findById(villageId);
//   const talukaData = await Taluka.findById(taluka);
//   let isLocal = false;

//   if (["માણસા", "વિજાપુર"].includes(talukaData.name.trim())) {
//     isLocal = true;
//   }

//   const districtData = await District.findById(district);
//   const financialYearData = await FinancialYear.findById(financialYear);

//   // --- villagers with sivay > 0 ---
//   const villagers = await Villager.find({
//     village: village._id,
//     sivay: { $exists: true, $ne: 0 },
//   }).sort({ createdAt : 1 , accountNo: 1 });

//   const master = await Master.findOne({ status: 1 });

//   // Totals accumulator
//   let totals = {
//     "જમીન પાછલી બાકી": 0,
//     "જમીન સરકારી/સિવાય": 0,
//     "જમીન ફાજલ": 0,

//     "લોકલ પાછલી બાકી": 0,
//     "લોકલ ચાલુ": 0,
//     "લોકલ ફાજલ": 0,

//     "શિક્ષણ પાછલી બાકી": 0,
//     "શિક્ષણ ચાલુ": 0,
//     "શિક્ષણ ફાજલ": 0,

//   };

//   const rows = [];

//   for (const v of villagers) {
//     // Aggregate Land

//     let local = 0;
//     if (isLocal && !["વિજાપુર"].includes(taluka.name.trim())) {
//       local = parseFloat(v.sarkari * 2 + v.sivay * 2);
//       v._doc.local = local;
//       totals.local += parseFloat(local || 0);
//     }

//     if (isLocal && ["વિજાપુર"].includes(taluka.name.trim())) {
//       local = parseFloat(v.sarkari / 2 + v.sivay / 2);
//       v._doc.local = local;
//       totals.local += parseFloat(local || 0);
//     }
//     const landMaangnu = await LandMaangnu.findOne({
//       villager: v._id,
//       financialYear: new mongoose.Types.ObjectId(financialYear),
//     }).sort({ updatedAt: -1 });

//     const landRevenue = await LandRevenue.find({
//       villager: v._id,
//       financialYear,
//     });

//     if (Array.isArray(landRevenue) && landRevenue.length > 0) {
//       const rotatingSum = landRevenue.reduce(
//         (sum, x) => sum + parseFloat(x.rotating || 0),
//         0
//       );
//       const totalSum = landRevenue.reduce(
//         (sum, x) => sum + parseFloat(x.total || 0),
//         0
//       );
//       const fajal = landMaangnu ? parseFloat(landMaangnu.fajal || 0) : 0;

//       v._doc.rotating = rotatingSum;
//       v._doc.total = totalSum + fajal;
//     } else {
//       v._doc.rotating = 0;
//       v._doc.total = landMaangnu
//         ? parseFloat(landMaangnu.fajal || 0)
//         : 0;
//     }

//     if (landMaangnu) {
//       // v._doc.rotating = landMaangnu.rotating || 0;
//       v._doc.pending = landMaangnu.pending || 0;
//       v._doc.left = landMaangnu.left || 0;
//       v._doc.fajal = landMaangnu.fajal || 0;
//     } else {
//       // v._doc.rotating = 0;
//       v._doc.pending = 0;
//       v._doc.left = 0;
//       v._doc.fajal = 0;
//     }

//     const landleft = parseFloat(v._doc.left || 0);
//     const Landsivay = parseFloat(v.sivay || 0);
//     const sarkari = parseFloat(v.sarkari || 0);
//     const rotating = parseFloat(v._doc.rotating || 0);
//     const total = parseFloat(v._doc.total || 0);
//     const sarkari2 = parseFloat(v.sarkari || 0); // if needed separately

//     let totalCalculated = landleft + Landsivay + sarkari + rotating;

//     if (isLocal) {
//       totalCalculated = landleft + Landsivay + sarkari + rotating + local;
//     } else {
//       totalCalculated = landleft + Landsivay + sarkari + rotating;
//     }

//     const difference = totalCalculated - total - sarkari2;

//     let landCollumnTwentyTwo =
//       difference < 0 ? Math.abs(parseFloat(difference)) : 0;
//     let landCollumnTwentyOne =
//       difference > 0 ? parseFloat(difference) : 0;

//     let localMaangnuData = {
//       rotating: 0,
//       pending: 0,
//       maangnuLeft: 0,
//       fajal: 0,
//     };
//     let localRevenueData = {
//       rotating: 0,
//       pending: 0,
//       left: 0,
//       billNo: "",
//       billDate: "",
//     };

//     const localMaangnu = await LocalFundMaangnu.findOne({
//       villager: v._id,
//       financialYear,
//     }).sort({ updatedAt: -1 });

//     if (localMaangnu) {
//       localMaangnuData = {
//         rotating: parseFloat(localMaangnu.rotating || 0),
//         pending: parseFloat(localMaangnu.pending || 0),
//         maangnuLeft: parseFloat(localMaangnu.left || 0),
//         fajal: parseFloat(localMaangnu.fajal || 0),
//       };
//     }

//     const localRevenue = await LocalFundRevenue.find({
//       villager: v._id,
//       financialYear,
//     });

//     if (Array.isArray(localRevenue) && localRevenue.length > 0) {
//       localRevenueData = {
//         rotating: localRevenue.reduce(
//           (sum, x) => sum + parseFloat(x.rotating || 0),
//           0
//         ),
//         pending: localRevenue.reduce(
//           (sum, x) => sum + parseFloat(x.pending || 0),
//           0
//         ),
//         left: localRevenue.reduce(
//           (sum, x) => sum + parseFloat(x.left || 0),
//           0
//         ),
//         billNo: localRevenue[0].billNo || "",
//         billDate: localRevenue[0].billDate || "",
//       };
//     }

//     v._doc.maangnuLeft = localMaangnuData.maangnuLeft;
//     v._doc.fajal = localMaangnuData.fajal;
//     v._doc.maangnuRotating = localMaangnuData.rotating
//     v._doc.rotating = localRevenueData.rotating;
//     v._doc.pending = localRevenueData.pending;
//     v._doc.left = localRevenueData.left;
//     let localSarkari = ((v.sarkari || 0) * master.lSarkari) / 100;
//     let localSivay = ((v.sivay || 0) * master.lSivay) / 100;

//     const localTotalCalculated =
//       localRevenueData.left + localRevenueData.pending + localMaangnuData.fajal + localMaangnuData.rotating;

//     const localTotalCalc =
//       localMaangnuData.maangnuLeft +
//       localSarkari +
//       localSivay +
//       localRevenueData.rotating;

//     const localCollumnFourteen =
//       localTotalCalculated < localTotalCalc
//         ? parseFloat(localTotalCalc - localTotalCalculated)
//         : 0;
//     const localCollumnFifteen =
//       localTotalCalculated > localTotalCalc
//         ? parseFloat(localTotalCalculated - localTotalCalc)
//         : 0;

//     let eduMaangnuData = {
//       rotating: 0,
//       pending: 0,
//       maangnuLeft: 0,
//       fajal: 0,
//     };
//     let revenueData = {
//       rotating: 0,
//       pending: 0,
//       left: 0,
//       billNo: "",
//       billDate: "",
//     };

//     const educationMaangnu = await EducationMaangnu.findOne({
//       villager: v._id,
//       financialYear,
//     }).sort({ updatedAt: -1 });

//     if (educationMaangnu) {
//       eduMaangnuData = {
//         rotating: parseFloat(educationMaangnu.rotating || 0),
//         pending: parseFloat(educationMaangnu.pending || 0),
//         maangnuLeft: parseFloat(educationMaangnu.left || 0),
//         fajal: parseFloat(educationMaangnu.fajal || 0),
//       };
//     }

//     // const educationRevenue = await EducationRevenue.findOne({
//     //   villager: v._id, financialYear
//     // }).sort({ updatedAt: -1 });

//     // if (educationRevenue) {
//     //   revenueData = {
//     //     rotating: parseFloat(educationRevenue.rotating || 0),
//     //     pending: parseFloat(educationRevenue.pending || 0),
//     //     left: parseFloat(educationRevenue.left || 0),
//     //     billNo: educationRevenue.billNo || "",
//     //     billDate: educationRevenue.billDate || "",
//     //   };
//     // }

//     const educationRevenues = await EducationRevenue.find({
//       villager: v._id,
//       financialYear,
//     })

//     if (Array.isArray(educationRevenues) && educationRevenues.length > 0) {
//       revenueData = {
//         rotating: educationRevenues.reduce(
//           (sum, x) => sum + parseFloat(x.rotating || 0),
//           0
//         ),
//         pending: educationRevenues.reduce(
//           (sum, x) => sum + parseFloat(x.pending || 0),
//           0
//         ),
//         left: educationRevenues.reduce(
//           (sum, x) => sum + parseFloat(x.left || 0),
//           0
//         ),
//         billNo: educationRevenues[0].billNo || "",
//         billDate: educationRevenues[0].billDate || "",
//       };
//     }

//     v._doc.maangnuLeft = eduMaangnuData.maangnuLeft;

//     v._doc.maangnuRotating = eduMaangnuData.rotating;
//     v._doc.fajal = eduMaangnuData.fajal;

//     v._doc.pending = revenueData.pending;
//     v._doc.rotating = revenueData.rotating;
//     v._doc.left = revenueData.left;
//     let eduSarkari = parseFloat(
//       ((parseFloat(v.sarkari || 0) * master.sSarkari) / 100)
//     );
//     let eduSivay = parseFloat(
//       ((parseFloat(v.sivay || 0) * master.sSivay) / 100)
//     );

//     const EduTotalCalculated =
//       revenueData.left + revenueData.pending + eduMaangnuData.fajal + eduMaangnuData.rotating;
//     const EduTotalCalc =
//       eduMaangnuData.maangnuLeft +
//       eduSarkari +
//       eduSivay +
//       revenueData.rotating;

//     let eduCollumnFourteen =
//       EduTotalCalculated < EduTotalCalc
//         ? parseFloat((EduTotalCalc - EduTotalCalculated))
//         : 0;
//     let eduCollumnFifteen =
//       EduTotalCalculated > EduTotalCalc
//         ? parseFloat((EduTotalCalculated - EduTotalCalc))
//         : 0;

//     const land = {
//       // left: landCollumnTwentyOne,
//       left : landMaangnu.left ,
//       sivay: Landsivay,
//       // fajal: landCollumnTwentyTwo
//       fajal : landMaangnu.fajal
//     }

//     const localFund = {
//       // left: localCollumnFourteen,
//       left : localMaangnuData.maangnuLeft,
//       // fajal: localCollumnFifteen
//       fajal : localMaangnuData.fajal

//     };
//     const edu = {
//       // left: eduCollumnFourteen,
//       left : eduMaangnuData.maangnuLeft,
//       // fajal: eduCollumnFifteen
//       fajal : eduMaangnuData.fajal
//     };

//     const hasLand =
//       (land.left && land.left !== 0) || (land.fajal && land.fajal !== 0);
//     const hasLocal =
//       (local.left && local.left !== 0) || (local.fajal && local.fajal !== 0);
//     const hasEdu =
//       (edu.left && edu.left !== 0) || (edu.fajal && edu.fajal !== 0);

//     if (!hasLand && !hasLocal && !hasEdu) {
//       // console.log("v.accountNo" , v.accountNo);
//       continue;
//     }

//     let localPending = localSarkari + localSivay;

//     let educationPending = eduSarkari + eduSivay;

//     let landRevenueTotal =
//       land.left + land.sivay > land.fajal ? land.left + land.sivay - land.fajal : 0;

//     let localRevenueTotal =
//       localFund.left + localPending > localFund.fajal
//         ? localFund.left + localPending - localFund.fajal
//         : 0;

//     let eduRevenueTotal =
//       edu.left + educationPending > edu.fajal
//         ? edu.left + educationPending - edu.fajal
//         : 0;

//     const row = {
//       "ખાતા નંબર": v.accountNo || "",
//       "ખાતેદાર નું નામ": v.name || "",

//       "જમીન પાછલી બાકી": land.left || 0,
//       "જમીન સરકારી/સિવાય": land.sivay,
//       "જમીન ફાજલ": land.fajal || 0,

//       "લોકલ પાછલી બાકી": localFund.left || 0,
//       "લોકલ ચાલુ": localPending || 0,
//       "લોકલ ફાજલ": localFund.fajal || 0,

//       "શિક્ષણ પાછલી બાકી": edu.left || 0,
//       "શિક્ષણ ચાલુ": educationPending || 0,
//       "શિક્ષણ ફાજલ": edu.fajal || 0,

//     };

//     rows.push(row);

//     // Update totals
//     for (let key in totals) {
//       totals[key] += row[key] || 0;
//     }
//   }

//   // Add totals row
//   rows.push({
//     "ખાતા નંબર": "કુલ",
//     "ખાતેદાર નું નામ": "",
//     ...totals,
//   });

//   // --- Create Excel workbook ---
//   const workbook = new ExcelJS.Workbook();
//   const sheet = workbook.addWorksheet("ExportData");

//   // Title Row
//   sheet.mergeCells("A1", "K1");
//   sheet.getCell("A1").value = `${village.name} ગ્રામ પંચાયત, તા. ${talukaData.name} જી. ${districtData.name} બિન ખેતી શીટ`;
//   sheet.getCell("A1").alignment = { horizontal: "center" };
//   sheet.getCell("A1").font = { bold: true, size: 14 };

//   // Header Rows
//   sheet.mergeCells("A2", "A3");
//   sheet.getCell("A2").value = "ખાતા નંબર";

//   sheet.mergeCells("B2", "B3");
//   sheet.getCell("B2").value = "ખાતેદાર નું નામ";

//   sheet.mergeCells("C2", "E2");
//   sheet.getCell("C2").value = "જમીન મહેસુલ";
//   sheet.getCell("C3").value = "પાછલી બાકી";
//   sheet.getCell("D3").value = "ખેતી સિવાય/ચાલુ";
//   sheet.getCell("E3").value = "ફાજલ";

//   sheet.mergeCells("F2", "H2");
//   sheet.getCell("F2").value = "લોકલ કંડ ";
//   sheet.getCell("F3").value = "પાછલી બાકી";
//   sheet.getCell("G3").value = "ચાલુ";
//   sheet.getCell("H3").value = "ફાજલ";

//   sheet.mergeCells("I2", "K2");
//   sheet.getCell("I2").value = "શિક્ષણ ઉપકર";
//   sheet.getCell("I3").value = "પાછલી બાકી";
//   sheet.getCell("J3").value = "ચાલુ";
//   sheet.getCell("K3").value = "ફાજલ";

//   // Insert Rows
//   rows.forEach((r) => {
//     sheet.addRow(Object.values(r));
//   });

//   // Bold Last Row (Totals)
//   const lastRow = sheet.lastRow;
//   lastRow.font = { bold: true };

//   // Auto column width
//   // sheet.columns.forEach((col) => {
//   //   let maxLength = 0;
//   //   col.eachCell({ includeEmpty: true }, (cell) => {
//   //     maxLength = Math.max(maxLength, (cell.value ? cell.value.toString().length : 0));
//   //   });
//   //   col.width = maxLength + 2;
//   // });

//   // Safe filename with Gujarati
//   const safeFileName = `export_${village.name}_${convertEngToGujNumber(
//     financialYearData.financialYear
//   )}.xlsx`;

//   res.setHeader(
//     "Content-Disposition",
//     `attachment; filename="export.xlsx"; filename*=UTF-8''${encodeURIComponent(
//       safeFileName
//     )}`
//   );
//   res.setHeader(
//     "Content-Type",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );

//   await workbook.xlsx.write(res);
//   res.end();
// });

exports.exportData = asyncHandler(async (req, res) => {
  const { villageId, taluka, district, financialYear } = req.body;
  if (!villageId || !financialYear || !taluka || !district)
    throw new CustomError("Missing required fields", 400);

  // Fetch static data in parallel
  const [village, talukaData, districtData, financialYearData, master] =
    await Promise.all([
      Village.findById(villageId).lean(),
      Taluka.findById(taluka).lean(),
      District.findById(district).lean(),
      FinancialYear.findById(financialYear).lean(),
      Master.findOne({ status: 1 }).lean(),
    ]);

  const isLocal = ["માણસા", "વિજાપુર"].includes(talukaData.name.trim());

  // Fetch villagers
  const villagers = await Villager.find({
    village: village._id,
    sivay: { $exists: true, $ne: 0 },
  })
    .sort({ createdAt: 1, accountNo: 1 })
    .lean();

  if (!villagers.length) throw new CustomError("No villagers found", 404);

  const villagerIds = villagers.map((v) => v._id);

  // --- Batch fetch related collections ---
  const [
    landMaangnus,
    landRevenues,
    localMaangnus,
    localRevenues,
    eduMaangnus,
    eduRevenues,
  ] = await Promise.all([
    LandMaangnu.find({ villager: { $in: villagerIds }, financialYear }).lean(),
    LandRevenue.find({ villager: { $in: villagerIds }, financialYear }).lean(),
    LocalFundMaangnu.find({
      villager: { $in: villagerIds },
      financialYear,
    }).lean(),
    LocalFundRevenue.find({
      villager: { $in: villagerIds },
      financialYear,
    }).lean(),
    EducationMaangnu.find({
      villager: { $in: villagerIds },
      financialYear,
    }).lean(),
    EducationRevenue.find({
      villager: { $in: villagerIds },
      financialYear,
    }).lean(),
  ]);

  // --- Group by villagerId for quick access ---
  const groupBy = (arr, key) =>
    arr.reduce((map, item) => {
      const id = item[key].toString();
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(item);
      return map;
    }, new Map());

  const landMaangnuMap = groupBy(landMaangnus, "villager");
  const landRevenueMap = groupBy(landRevenues, "villager");
  const localMaangnuMap = groupBy(localMaangnus, "villager");
  const localRevenueMap = groupBy(localRevenues, "villager");
  const eduMaangnuMap = groupBy(eduMaangnus, "villager");
  const eduRevenueMap = groupBy(eduRevenues, "villager");

  // --- Totals accumulator ---
  const totals = {
    "જમીન પાછલી બાકી": 0,
    "જમીન સરકારી/સિવાય": 0,
    "જમીન ફાજલ": 0,
    "લોકલ પાછલી બાકી": 0,
    "લોકલ ચાલુ": 0,
    "લોકલ ફાજલ": 0,
    "શિક્ષણ પાછલી બાકી": 0,
    "શિક્ષણ ચાલુ": 0,
    "શિક્ષણ ફાજલ": 0,
  };

  const rows = [];

  // --- Compute per villager ---
  for (const v of villagers) {
    const id = v._id.toString();

    const lm = landMaangnuMap.get(id)?.[0] || {};
    const lr = landRevenueMap.get(id) || [];
    const lfm = localMaangnuMap.get(id)?.[0] || {};
    const lfr = localRevenueMap.get(id) || [];
    const em = eduMaangnuMap.get(id)?.[0] || {};
    const er = eduRevenueMap.get(id) || [];

    // Pre-sum revenues
    const sumByKey = (arr, key) =>
      arr.reduce((s, x) => s + parseFloat(x[key] || 0), 0);

    const land = {
      left: parseFloat(lm.left || 0),
      sivay: parseFloat(v.sivay || 0),
      fajal: parseFloat(lm.fajal || 0),
    };

    const localFund = {
      left: parseFloat(lfm.left || 0),
      fajal: parseFloat(lfm.fajal || 0),
    };

    const edu = {
      left: parseFloat(em.left || 0),
      fajal: parseFloat(em.fajal || 0),
    };

    // Skip if all zero
    if (
      !land.left &&
      !land.fajal &&
      !localFund.left &&
      !localFund.fajal &&
      !edu.left &&
      !edu.fajal
    )
      continue;

    // Local + Edu calculated
    const localPending =
      ((v.sarkari || 0) * master.lSarkari) / 100 +
      ((v.sivay || 0) * master.lSivay) / 100;
    const eduPending =
      ((v.sarkari || 0) * master.sSarkari) / 100 +
      ((v.sivay || 0) * master.sSivay) / 100;

    const row = {
      "ખાતા નંબર": v.accountNo || "",
      "ખાતેદાર નું નામ": v.name || "",
      "જમીન પાછલી બાકી": land.left,
      "જમીન સરકારી/સિવાય": land.sivay,
      "જમીન ફાજલ": land.fajal,
      "લોકલ પાછલી બાકી": localFund.left,
      "લોકલ ચાલુ": localPending,
      "લોકલ ફાજલ": localFund.fajal,
      "શિક્ષણ પાછલી બાકી": edu.left,
      "શિક્ષણ ચાલુ": eduPending,
      "શિક્ષણ ફાજલ": edu.fajal,
    };

    rows.push(row);
    Object.keys(totals).forEach((key) => (totals[key] += row[key] || 0));
  }

  // Add totals row
  rows.push({ "ખાતા નંબર": "કુલ", "ખાતેદાર નું નામ": "", ...totals });

  // --- Excel ---
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("ExportData");

  sheet.mergeCells("A1", "K1");
  sheet.getCell(
    "A1"
  ).value = `${village.name} ગ્રામ પંચાયત, તા. ${talukaData.name} જી. ${districtData.name} બિન ખેતી શીટ`;
  sheet.getCell("A1").alignment = { horizontal: "center" };
  sheet.getCell("A1").font = { bold: true, size: 14 };

  // Headers
  sheet.addRows([
    [
      "ખાતા નંબર",
      "ખાતેદાર નું નામ",
      "જમીન પાછલી બાકી",
      "જમીન સરકારી/સિવાય",
      "જમીન ફાજલ",
      "લોકલ પાછલી બાકી",
      "લોકલ ચાલુ",
      "લોકલ ફાજલ",
      "શિક્ષણ પાછલી બાકી",
      "શિક્ષણ ચાલુ",
      "શિક્ષણ ફાજલ",
    ],
  ]);

  rows.forEach((r) => sheet.addRow(Object.values(r)));
  sheet.lastRow.font = { bold: true };

  const safeFileName = `export_${village.name}_${convertEngToGujNumber(
    financialYearData.financialYear
  )}.xlsx`;

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="export.xlsx"; filename*=UTF-8''${encodeURIComponent(
      safeFileName
    )}`
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  await workbook.xlsx.write(res);
  res.end();
});

// exports.exportVasulatPatrakData = asyncHandler(async (req, res) => {
//   const { villageId, taluka, district, financialYear } = req.body;

//   if (!villageId || !financialYear || !taluka || !district)
//     throw new CustomError("Missing villageId or financialYear or taluka or district", 400);

//   const village = await Village.findById(villageId);
//   const talukaData = await Taluka.findById(taluka);
//   let isLocal = false;

//   if (["માણસા", "વિજાપુર"].includes(talukaData.name.trim())) {
//     isLocal = true;
//   }

//   const districtData = await District.findById(district);
//   const financialYearData = await FinancialYear.findById(financialYear);

//   // --- villagers with sivay > 0 ---
//   const villagers = await Villager.find({
//     village: village._id  ,
//   }).sort({ createdAt : 1 , accountNo: 1 });

//   const master = await Master.findOne({ status: 1 });

//   // Totals accumulator
//   let totals = {
//     "જમીન પાછલી બાકી": 0,
//     "જમીન સરકારી/સિવાય": 0,
//     "જમીન ફાજલ": 0,
//     "જમીન વસુલ કરવા પાત્ર કરમ": 0,
//     "જમીન જમા ફાજલ": 0,

//     "લોકલ પાછલી બાકી": 0,
//     "લોકલ ચાલુ": 0,
//     "લોકલ ફાજલ": 0,
//     "લોકલ વસુલ કરવા પાત્ર કરમ": 0,
//     "લોકલ જમા ફાજલ": 0,

//     "શિક્ષણ પાછલી બાકી": 0,
//     "શિક્ષણ ચાલુ": 0,
//     "શિક્ષણ ફાજલ": 0,
//     "શિક્ષણ વસુલ કરવા પાત્ર કરમ": 0,
//     "શિક્ષણ જમા ફાજલ": 0,

//     "એકંદર કુલ ": 0,
//   };

//   const rows = [];

//   for (const v of villagers) {
//     // Aggregate Land

//     let local = 0;
//     if (isLocal && !["વિજાપુર"].includes(taluka.name.trim())) {
//       local = parseFloat(v.sarkari * 2 + v.sivay * 2);
//       v._doc.local = local;
//       totals.local += parseFloat(local || 0);
//     }

//     if (isLocal && ["વિજાપુર"].includes(taluka.name.trim())) {
//       local = parseFloat(v.sarkari / 2 + v.sivay / 2);
//       v._doc.local = local;
//       totals.local += parseFloat(local || 0);
//     }
//     const landMaangnu = await LandMaangnu.findOne({
//       villager: v._id,
//       financialYear: new mongoose.Types.ObjectId(financialYear),
//     }).sort({ updatedAt: -1 });

//     const landRevenue = await LandRevenue.find({
//       villager: v._id,
//       financialYear,
//     });

//     if (Array.isArray(landRevenue) && landRevenue.length > 0) {
//       const rotatingSum = landRevenue.reduce(
//         (sum, x) => sum + parseFloat(x.rotating || 0),
//         0
//       );
//       const totalSum = landRevenue.reduce(
//         (sum, x) => sum + parseFloat(x.total || 0),
//         0
//       );
//       const fajal = landMaangnu ? parseFloat(landMaangnu.fajal || 0) : 0;

//       v._doc.rotating = rotatingSum;
//       v._doc.total = totalSum + fajal;
//     } else {
//       v._doc.rotating = 0;
//       v._doc.total = landMaangnu
//         ? parseFloat(landMaangnu.fajal || 0)
//         : 0;
//     }

//     if (landMaangnu) {
//       // v._doc.rotating = landMaangnu.rotating || 0;
//       v._doc.pending = landMaangnu.pending || 0;
//       v._doc.left = landMaangnu.left || 0;
//       v._doc.fajal = landMaangnu.fajal || 0;
//     } else {
//       // v._doc.rotating = 0;
//       v._doc.pending = 0;
//       v._doc.left = 0;
//       v._doc.fajal = 0;
//     }

//     const landleft = parseFloat(v._doc.left || 0);
//     const Landsivay = parseFloat(v.sivay || 0);
//     const sarkari = parseFloat(v.sarkari || 0);
//     const rotating = parseFloat(v._doc.rotating || 0);
//     const total = parseFloat(v._doc.total || 0);
//     const sarkari2 = parseFloat(v.sarkari || 0); // if needed separately

//     let totalCalculated = landleft + Landsivay + sarkari + rotating;

//     if (isLocal) {
//       totalCalculated = landleft + Landsivay + sarkari + rotating + local;
//     } else {
//       totalCalculated = landleft + Landsivay + sarkari + rotating;
//     }

//     const difference = totalCalculated - total - sarkari2;

//     let landCollumnTwentyTwo =
//       difference < 0 ? Math.abs(parseFloat(difference)) : 0;
//     let landCollumnTwentyOne =
//       difference > 0 ? parseFloat(difference) : 0;

//     let localMaangnuData = {
//       rotating: 0,
//       pending: 0,
//       maangnuLeft: 0,
//       fajal: 0,
//     };
//     let localRevenueData = {
//       rotating: 0,
//       pending: 0,
//       left: 0,
//       billNo: "",
//       billDate: "",
//     };

//     const localMaangnu = await LocalFundMaangnu.findOne({
//       villager: v._id,
//       financialYear,
//     }).sort({ updatedAt: -1 });

//     if (localMaangnu) {
//       localMaangnuData = {
//         rotating: parseFloat(localMaangnu.rotating || 0),
//         pending: parseFloat(localMaangnu.pending || 0),
//         maangnuLeft: parseFloat(localMaangnu.left || 0),
//         fajal: parseFloat(localMaangnu.fajal || 0),
//       };
//     }

//     const localRevenue = await LocalFundRevenue.find({
//       villager: v._id,
//       financialYear,
//     });

//     if (Array.isArray(localRevenue) && localRevenue.length > 0) {
//       localRevenueData = {
//         rotating: localRevenue.reduce(
//           (sum, x) => sum + parseFloat(x.rotating || 0),
//           0
//         ),
//         pending: localRevenue.reduce(
//           (sum, x) => sum + parseFloat(x.pending || 0),
//           0
//         ),
//         left: localRevenue.reduce(
//           (sum, x) => sum + parseFloat(x.left || 0),
//           0
//         ),
//         billNo: localRevenue[0].billNo || "",
//         billDate: localRevenue[0].billDate || "",
//       };
//     }

//     v._doc.maangnuLeft = localMaangnuData.maangnuLeft;
//     v._doc.fajal = localMaangnuData.fajal;
//     v._doc.maangnuRotating = localMaangnuData.rotating
//     v._doc.rotating = localRevenueData.rotating;
//     v._doc.pending = localRevenueData.pending;
//     v._doc.left = localRevenueData.left;
//     let localSarkari = ((v.sarkari || 0) * master.lSarkari) / 100;
//     let localSivay = ((v.sivay || 0) * master.lSivay) / 100;

//     const localTotalCalculated =
//       localRevenueData.left + localRevenueData.pending + localMaangnuData.fajal + localMaangnuData.rotating;

//     const localTotalCalc =
//       localMaangnuData.maangnuLeft +
//       localSarkari +
//       localSivay +
//       localRevenueData.rotating;

//     const localCollumnFourteen =
//       localTotalCalculated < localTotalCalc
//         ? parseFloat(localTotalCalc - localTotalCalculated)
//         : 0;
//     const localCollumnFifteen =
//       localTotalCalculated > localTotalCalc
//         ? parseFloat(localTotalCalculated - localTotalCalc)
//         : 0;

//     let eduMaangnuData = {
//       rotating: 0,
//       pending: 0,
//       maangnuLeft: 0,
//       fajal: 0,
//     };
//     let revenueData = {
//       rotating: 0,
//       pending: 0,
//       left: 0,
//       billNo: "",
//       billDate: "",
//     };

//     const educationMaangnu = await EducationMaangnu.findOne({
//       villager: v._id,
//       financialYear,
//     }).sort({ updatedAt: -1 });

//     if (educationMaangnu) {
//       eduMaangnuData = {
//         rotating: parseFloat(educationMaangnu.rotating || 0),
//         pending: parseFloat(educationMaangnu.pending || 0),
//         maangnuLeft: parseFloat(educationMaangnu.left || 0),
//         fajal: parseFloat(educationMaangnu.fajal || 0),
//       };
//     }

//     // const educationRevenue = await EducationRevenue.findOne({
//     //   villager: v._id, financialYear
//     // }).sort({ updatedAt: -1 });

//     // if (educationRevenue) {
//     //   revenueData = {
//     //     rotating: parseFloat(educationRevenue.rotating || 0),
//     //     pending: parseFloat(educationRevenue.pending || 0),
//     //     left: parseFloat(educationRevenue.left || 0),
//     //     billNo: educationRevenue.billNo || "",
//     //     billDate: educationRevenue.billDate || "",
//     //   };
//     // }

//     const educationRevenues = await EducationRevenue.find({
//       villager: v._id,
//       financialYear,
//     })

//     if (Array.isArray(educationRevenues) && educationRevenues.length > 0) {
//       revenueData = {
//         rotating: educationRevenues.reduce(
//           (sum, x) => sum + parseFloat(x.rotating || 0),
//           0
//         ),
//         pending: educationRevenues.reduce(
//           (sum, x) => sum + parseFloat(x.pending || 0),
//           0
//         ),
//         left: educationRevenues.reduce(
//           (sum, x) => sum + parseFloat(x.left || 0),
//           0
//         ),
//         billNo: educationRevenues[0].billNo || "",
//         billDate: educationRevenues[0].billDate || "",
//       };
//     }

//     v._doc.maangnuLeft = eduMaangnuData.maangnuLeft;

//     v._doc.maangnuRotating = eduMaangnuData.rotating;
//     v._doc.fajal = eduMaangnuData.fajal;

//     v._doc.pending = revenueData.pending;
//     v._doc.rotating = revenueData.rotating;
//     v._doc.left = revenueData.left;
//     let eduSarkari = parseFloat(
//       ((parseFloat(v.sarkari || 0) * master.sSarkari) / 100)
//     );
//     let eduSivay = parseFloat(
//       ((parseFloat(v.sivay || 0) * master.sSivay) / 100)
//     );

//     const EduTotalCalculated =
//       revenueData.left + revenueData.pending + eduMaangnuData.fajal + eduMaangnuData.rotating;
//     const EduTotalCalc =
//       eduMaangnuData.maangnuLeft +
//       eduSarkari +
//       eduSivay +
//       revenueData.rotating;

//     let eduCollumnFourteen =
//       EduTotalCalculated < EduTotalCalc
//         ? parseFloat((EduTotalCalc - EduTotalCalculated))
//         : 0;
//     let eduCollumnFifteen =
//       EduTotalCalculated > EduTotalCalc
//         ? parseFloat((EduTotalCalculated - EduTotalCalc))
//         : 0;

//     const land = {
//       // left: landCollumnTwentyOne,
//       left : landleft ,
//       sivay: Landsivay,
//       // fajal: landCollumnTwentyTwo
//      fajal : total
//     }

//     const localFund = {
//       // left: localCollumnFourteen,
//       left : localMaangnuData.maangnuLeft,
//       // fajal: localCollumnFifteen,
//       fajal : localMaangnuData.fajal

//     };
//     const edu = {
//       // left: eduCollumnFourteen,
//       left : eduMaangnuData.maangnuLeft,
//       // fajal: eduCollumnFifteen
//       fajal : eduMaangnuData.fajal
//     };

//     // const hasLand =
//     //   (land.left && land.left !== 0) || (land.fajal && land.fajal !== 0);
//     // const hasLocal =
//     //   (local.left && local.left !== 0) || (local.fajal && local.fajal !== 0);
//     // const hasEdu =
//     //   (edu.left && edu.left !== 0) || (edu.fajal && edu.fajal !== 0);

//     // // console.log("hasLand" , hasLand  );
//     // // console.log("hasLocal" , hasLocal);
//     // // console.log("hasEdu", hasEdu);

//     // if (!hasLand && !hasLocal && !hasEdu) {
//     //   // console.log("v.accountNo" , v.accountNo);
//     //   continue;
//     // }

//     let localPending = localSarkari + localSivay;

//     let educationPending = eduSarkari + eduSivay;

//     let landRevenueTotal =
//       land.left + land.sivay > land.fajal ? land.left + land.sivay - land.fajal : 0;

//     let localRevenueTotal =
//       localFund.left + localPending > localFund.fajal
//         ? localFund.left + localPending - localFund.fajal
//         : 0;

//     let eduRevenueTotal =
//       edu.left + educationPending > edu.fajal
//         ? edu.left + educationPending - edu.fajal
//         : 0;

//     const row = {
//       "ખાતા નંબર": v.accountNo || "",
//       "ખાતેદાર નું નામ": v.name || "",

//       "જમીન પાછલી બાકી": land.left || 0,
//       "જમીન સરકારી/સિવાય": land.sivay,
//       "જમીન ફાજલ": land.fajal || 0,
//       "જમીન વસુલ કરવા પાત્ર રકમ": landRevenueTotal,
//       "જમીન જમા ફાજલ":
//         land.left + land.sivay < land.fajal ? (land.fajal - (land.left + land.sivay)) : 0,

//       "લોકલ પાછલી બાકી": localFund.left || 0,
//       "લોકલ ચાલુ": localPending || 0,
//       "લોકલ ફાજલ": localFund.fajal || 0,
//       "લોકલ વસુલ કરવા પાત્ર રકમ": localRevenueTotal,
//       "લોકલ જમા ફાજલ":
//         localFund.left + localPending < localFund.fajal
//           ? localFund.fajal - (localFund.left + localPending)
//           : 0,

//       "શિક્ષણ પાછલી બાકી": edu.left || 0,
//       "શિક્ષણ ચાલુ": educationPending || 0,
//       "શિક્ષણ ફાજલ": edu.fajal || 0,
//       "શિક્ષણ વસુલ કરવા પાત્ર રકમ": eduRevenueTotal,
//       "શિક્ષણ જમા ફાજલ":
//         edu.left + educationPending < edu.fajal
//           ? (edu.fajal - (edu.left + educationPending))
//           : 0,

//       "એકંદર કુલ ": landRevenueTotal + localRevenueTotal + eduRevenueTotal,
//     };

//     rows.push(row);

//     // Update totals
//     for (let key in totals) {
//       totals[key] += row[key] || 0;
//     }
//   }

//   console.log("totals" , totals);

//   // Add totals row
//   rows.push({
//     "ખાતા નંબર": "કુલ",
//     "ખાતેદાર નું નામ": "",
//     ...totals,
//   });

//   // --- Create Excel workbook ---
//   const workbook = new ExcelJS.Workbook();
//   const sheet = workbook.addWorksheet("ExportData");

//   // Title Row
//   sheet.mergeCells("A1", "R1");
//   sheet.getCell("A1").value = `${village.name
//     } ગ્રામ પંચાયત, તા. ${talukaData.name} જી. ${districtData.name}  વસુલાત પત્રક  સને ${convertEngToGujNumber(
//       financialYearData.financialYear
//     )}`;
//   sheet.getCell("A1").alignment = { horizontal: "center" };
//   sheet.getCell("A1").font = { bold: true, size: 14 };

//   // Header Rows
//   sheet.mergeCells("A2", "A3");
//   sheet.getCell("A2").value = "ખાતા નંબર";

//   sheet.mergeCells("B2", "B3");
//   sheet.getCell("B2").value = "ખાતેદાર નું નામ";

//   sheet.mergeCells("C2", "G2");
//   sheet.getCell("C2").value = "જમીન મહેસુલ";
//   sheet.getCell("C3").value = "પાછલી બાકી";
//   sheet.getCell("D3").value = "ખેતી સિવાય/ચાલુ";
//   sheet.getCell("E3").value = "ફાજલ";
//   sheet.getCell("F3").value = "વસુલ કરવા પાત્ર કરમ";
//   sheet.getCell("G3").value = "જમા ફાજલ";

//   sheet.mergeCells("H2", "L2");
//   sheet.getCell("H2").value = "લોકલ કંડ ";
//   sheet.getCell("H3").value = "પાછલી બાકી";
//   sheet.getCell("I3").value = "ચાલુ";
//   sheet.getCell("J3").value = "ફાજલ";
//   sheet.getCell("K3").value = "વસુલ કરવા પાત્ર કરમ";
//   sheet.getCell("L3").value = "જમા ફાજલ";

//   sheet.mergeCells("M2", "Q2");
//   sheet.getCell("M2").value = "શિક્ષણ ઉપકર";
//   sheet.getCell("M3").value = "પાછલી બાકી";
//   sheet.getCell("N3").value = "ચાલુ";
//   sheet.getCell("O3").value = "ફાજલ";
//   sheet.getCell("P3").value = "વસુલ કરવા પાત્ર કરમ";
//   sheet.getCell("Q3").value = "જમા ફાજલ";

//   sheet.mergeCells("R2", "R3");
//   sheet.getCell("R2").value = "એકંદર કુલ";

//   // Insert Rows
//   rows.forEach((r) => {
//     sheet.addRow(Object.values(r));
//   });

//   // Bold Last Row (Totals)
//   const lastRow = sheet.lastRow;
//   lastRow.font = { bold: true };

//   // Auto column width
//   // sheet.columns.forEach((col) => {
//   //   let maxLength = 0;
//   //   col.eachCell({ includeEmpty: true }, (cell) => {
//   //     maxLength = Math.max(maxLength, (cell.value ? cell.value.toString().length : 0));
//   //   });
//   //   col.width = maxLength + 2;
//   // });

//   // Safe filename with Gujarati
//   const safeFileName = `export_${village.name}_${convertEngToGujNumber(
//     financialYearData.financialYear
//   )}.xlsx`;

//   res.setHeader(
//     "Content-Disposition",
//     `attachment; filename="export.xlsx"; filename*=UTF-8''${encodeURIComponent(
//       safeFileName
//     )}`
//   );
//   res.setHeader(
//     "Content-Type",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );

//   await workbook.xlsx.write(res);
//   res.end();
// });

exports.exportVasulatPatrakData = asyncHandler(async (req, res) => {
  const { villageId, taluka, district, financialYear } = req.body;
  const { format = "excel" } = req.query;

  if (!villageId || !financialYear || !taluka || !district)
    throw new CustomError("Missing required fields", 400);

  // Parallel fetching base data
  const [village, talukaData, districtData, financialYearData, master] =
    await Promise.all([
      Village.findById(villageId),
      Taluka.findById(taluka),
      District.findById(district),
      FinancialYear.findById(financialYear),
      Master.findOne({ status: 1 }),
    ]);

  const isLocal = ["માણસા", "વિજાપુર"].includes(talukaData.name.trim());

  // Preload villagers
  const villagers = await Villager.find({ village: village._id })
    .sort({ createdAt: 1, accountNo: 1 })
    .lean();

  const villagerIds = villagers.map((v) => v._id);

  // Preload all relevant data in parallel
  const [
    landMaangnus,
    landRevenues,
    localMaangnus,
    localRevenues,
    eduMaangnus,
    eduRevenues,
  ] = await Promise.all([
    LandMaangnu.find({ villager: { $in: villagerIds }, financialYear })
      .sort({ updatedAt: -1 })
      .lean(),
    LandRevenue.find({ villager: { $in: villagerIds }, financialYear }).lean(),
    LocalFundMaangnu.find({ villager: { $in: villagerIds }, financialYear })
      .sort({ updatedAt: -1 })
      .lean(),
    LocalFundRevenue.find({
      villager: { $in: villagerIds },
      financialYear,
    }).lean(),
    EducationMaangnu.find({ villager: { $in: villagerIds }, financialYear })
      .sort({ updatedAt: -1 })
      .lean(),
    EducationRevenue.find({
      villager: { $in: villagerIds },
      financialYear,
    }).lean(),
  ]);

  // Group by villagerId for fast lookup
  const groupBy = (arr, key) => {
    const map = new Map();
    for (const item of arr) {
      const id = item[key].toString();
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(item);
    }
    return map;
  };

  const landMaangnuMap = groupBy(landMaangnus, "villager");
  const landRevenueMap = groupBy(landRevenues, "villager");
  const localMaangnuMap = groupBy(localMaangnus, "villager");
  const localRevenueMap = groupBy(localRevenues, "villager");
  const eduMaangnuMap = groupBy(eduMaangnus, "villager");
  const eduRevenueMap = groupBy(eduRevenues, "villager");

  // Totals accumulator
  const totals = {
    "જમીન પાછલી બાકી": 0,
    "જમીન સરકારી/સિવાય": 0,
    "જમીન ફાજલ": 0,
    "જમીન વસુલ કરવા પાત્ર કરમ": 0,
    "જમીન જમા ફાજલ": 0,
    "લોકલ પાછલી બાકી": 0,
    "લોકલ ચાલુ": 0,
    "લોકલ ફાજલ": 0,
    "લોકલ વસુલ કરવા પાત્ર કરમ": 0,
    "લોકલ જમા ફાજલ": 0,
    "શિક્ષણ પાછલી બાકી": 0,
    "શિક્ષણ ચાલુ": 0,
    "શિક્ષણ ફાજલ": 0,
    "શિક્ષણ વસુલ કરવા પાત્ર કરમ": 0,
    "શિક્ષણ જમા ફાજલ": 0,
    "એકંદર કુલ ": 0,
  };

  const rows = [];

  for (const v of villagers) {
    const id = v._id.toString();

    // --- Land ---
    const landM = landMaangnuMap.get(id)?.[0];
    const landR = landRevenueMap.get(id) || [];
    const landRotating = landR.reduce(
      (s, x) => s + (parseFloat(x.rotating) || 0),
      0
    );
    const landTotal =
      landR.reduce((s, x) => s + (parseFloat(x.total) || 0), 0) +
      (parseFloat(landM?.fajal) || 0);
    const landLeft = parseFloat(landM?.left || 0);
    const landSivay = parseFloat(v.sivay || 0);
    const landSarkari = parseFloat(v.sarkari || 0);

    const landRevenueTotal =
      landLeft + landSivay > landTotal ? landLeft + landSivay - landTotal : 0;
    const landDeposit =
      landLeft + landSivay < landTotal ? landTotal - (landLeft + landSivay) : 0;

    // --- Local ---
    const localM = localMaangnuMap.get(id)?.[0];
    const localR = localRevenueMap.get(id) || [];
    const localRotating = localR.reduce(
      (s, x) => s + (parseFloat(x.rotating) || 0),
      0
    );
    const localLeft = parseFloat(localM?.left || 0);
    const localFajal = parseFloat(localM?.fajal || 0);
    const localSarkari = (v.sarkari * master.lSarkari) / 100;
    const localSivay = (v.sivay * master.lSivay) / 100;
    const localPending = localSarkari + localSivay;
    const localRevenueTotal =
      localLeft + localPending > localFajal
        ? localLeft + localPending - localFajal
        : 0;
    const localDeposit =
      localLeft + localPending < localFajal
        ? localFajal - (localLeft + localPending)
        : 0;

    // --- Education ---
    const eduM = eduMaangnuMap.get(id)?.[0];
    const eduR = eduRevenueMap.get(id) || [];
    const eduRotating = eduR.reduce(
      (s, x) => s + (parseFloat(x.rotating) || 0),
      0
    );
    const eduLeft = parseFloat(eduM?.left || 0);
    const eduFajal = parseFloat(eduM?.fajal || 0);
    const eduSarkari = (v.sarkari * master.sSarkari) / 100;
    const eduSivay = (v.sivay * master.sSivay) / 100;
    const eduPending = eduSarkari + eduSivay;
    const eduRevenueTotal =
      eduLeft + eduPending > eduFajal ? eduLeft + eduPending - eduFajal : 0;
    const eduDeposit =
      eduLeft + eduPending < eduFajal ? eduFajal - (eduLeft + eduPending) : 0;

    const row = {
      "ખાતા નંબર": v.accountNo || "",
      "ખાતેદાર નું નામ": v.name || "",
      "જમીન પાછલી બાકી": landLeft,
      "જમીન સરકારી/સિવાય": landSivay,
      "જમીન ફાજલ": landTotal,
      "જમીન વસુલ કરવા પાત્ર કરમ": landRevenueTotal,
      "જમીન જમા ફાજલ": landDeposit,
      "લોકલ પાછલી બાકી": localLeft,
      "લોકલ ચાલુ": localPending,
      "લોકલ ફાજલ": localFajal,
      "લોકલ વસુલ કરવા પાત્ર કરમ": localRevenueTotal,
      "લોકલ જમા ફાજલ": localDeposit,
      "શિક્ષણ પાછલી બાકી": eduLeft,
      "શિક્ષણ ચાલુ": eduPending,
      "શિક્ષણ ફાજલ": eduFajal,
      "શિક્ષણ વસુલ કરવા પાત્ર કરમ": eduRevenueTotal,
      "શિક્ષણ જમા ફાજલ": eduDeposit,
      "એકંદર કુલ ": landRevenueTotal + localRevenueTotal + eduRevenueTotal,
    };

    rows.push(row);
    for (let key in totals) totals[key] += row[key] || 0;
  }

  rows.push({ "ખાતા નંબર": "કુલ", "ખાતેદાર નું નામ": "", ...totals });

if (format === "pdf") {
  console.log("Returning PDF JSON data...");

  // Map Gujarati column names to English
  const fieldMap = {
    "ખાતા નંબર": "accountNo",
    "ખાતેદાર નું નામ": "name",
    "જમીન પાછલી બાકી": "landLeft",
    "જમીન સરકારી/સિવાય": "landPending",
    "જમીન ફાજલ": "landFajal",
    "જમીન વસુલ કરવા પાત્ર કરમ": "landRecoverable",
    "જમીન જમા ફાજલ": "landDeposit",
    "લોકલ પાછલી બાકી": "localLeft",
    "લોકલ ચાલુ": "localPending",
    "લોકલ ફાજલ": "localFajal",
    "લોકલ વસુલ કરવા પાત્ર કરમ": "localRecoverable",
    "લોકલ જમા ફાજલ": "localDeposit",
    "શિક્ષણ પાછલી બાકી": "eduLeft",
    "શિક્ષણ ચાલુ": "eduPending",
    "શિક્ષણ ફાજલ": "eduFajal",
    "શિક્ષણ વસુલ કરવા પાત્ર કરમ": "eduRecoverable",
    "શિક્ષણ જમા ફાજલ": "eduDeposit",
    "એકંદર કુલ ": "grandTotal",
  };

  // Convert Gujarati keys → English keys
  const englishRows = rows.map((row) => {
    const converted = {};
    for (const [gujKey, value] of Object.entries(row)) {
      converted[fieldMap[gujKey] || gujKey] = value;
    }
    if (converted.accountNo === "કુલ") {
      converted.isTotalRow = true;
    }
    return converted;
  });

  return res.status(200).json(
    new SuccessResponse(
      {
        data: englishRows,
      },
      "Fetched land report with totals (English keys)"
    )
  );
}


  // --- Excel Export ---
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("ExportData");
  // ... reuse your existing Excel header and merge logic ...

  // --- Create Excel workbook ---
  //   const workbook = new ExcelJS.Workbook();
  //   const sheet = workbook.addWorksheet("ExportData");

  // Title Row
  sheet.mergeCells("A1", "R1");
  sheet.getCell("A1").value = `${village.name} ગ્રામ પંચાયત, તા. ${
    talukaData.name
  } જી. ${districtData.name}  વસુલાત પત્રક  સને ${convertEngToGujNumber(
    financialYearData.financialYear
  )}`;
  sheet.getCell("A1").alignment = { horizontal: "center" };
  sheet.getCell("A1").font = { bold: true, size: 14 };

  // Header Rows
  sheet.mergeCells("A2", "A3");
  sheet.getCell("A2").value = "ખાતા નંબર";

  sheet.mergeCells("B2", "B3");
  sheet.getCell("B2").value = "ખાતેદાર નું નામ";

  sheet.mergeCells("C2", "G2");
  sheet.getCell("C2").value = "જમીન મહેસુલ";
  sheet.getCell("C3").value = "પાછલી બાકી";
  sheet.getCell("D3").value = "ખેતી સિવાય/ચાલુ";
  sheet.getCell("E3").value = "ફાજલ";
  sheet.getCell("F3").value = "વસુલ કરવા પાત્ર રકમ";
  sheet.getCell("G3").value = "જમા ફાજલ";

  sheet.mergeCells("H2", "L2");
  sheet.getCell("H2").value = "લોકલ ફંડ ";
  sheet.getCell("H3").value = "પાછલી બાકી";
  sheet.getCell("I3").value = "ચાલુ";
  sheet.getCell("J3").value = "ફાજલ";
  sheet.getCell("K3").value = "વસુલ કરવા પાત્ર રકમ";
  sheet.getCell("L3").value = "જમા ફાજલ"; 

  sheet.mergeCells("M2", "Q2");
  sheet.getCell("M2").value = "શિક્ષણ ઉપકર";
  sheet.getCell("M3").value = "પાછલી બાકી";
  sheet.getCell("N3").value = "ચાલુ";
  sheet.getCell("O3").value = "ફાજલ";
  sheet.getCell("P3").value = "વસુલ કરવા પાત્ર રકમ";
  sheet.getCell("Q3").value = "જમા ફાજલ";

  sheet.mergeCells("R2", "R3");
  sheet.getCell("R2").value = "એકંદર કુલ";

  // Insert Rows
  rows.forEach((r) => {
    sheet.addRow(Object.values(r));
  });

  // Bold Last Row (Totals)
  const lastRow = sheet.lastRow;
  lastRow.font = { bold: true };

  // Auto column width
  // sheet.columns.forEach((col) => {
  //   let maxLength = 0;
  //   col.eachCell({ includeEmpty: true }, (cell) => {
  //     maxLength = Math.max(maxLength, (cell.value ? cell.value.toString().length : 0));
  //   });
  //   col.width = maxLength + 2;
  // });

  // rows.forEach(r => sheet.addRow(Object.values(r)));
  // sheet.lastRow.font = { bold: true };

  const safeFileName = `export_${village.name}_${convertEngToGujNumber(
    financialYearData.financialYear
  )}.xlsx`;

  res.setHeader(
    "Content-Disposition",
    `attachment; filename*=UTF-8''${encodeURIComponent(safeFileName)}`
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  await workbook.xlsx.write(res);
  res.end();
});
