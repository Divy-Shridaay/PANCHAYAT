const { asyncHandler } = require("tranxpress");
const Villager = require("../../db/VillagerModel");
const SuccessResponse = require("../../../domain/Responses/SuccessResponse");
const CustomError = require("../../../domain/CustomError");
const EducationRevenue = require("../../db/EducationRevenueModel");
const EducationMaangnu = require("../../db/EducationMaangnuModel");
const Master = require("../../db/MasterModel");

exports.getEducationReport = asyncHandler(async (req, res) => {
  const { village, page = 1, limit = 10, financialYear } = req.query;

  // 👉 જો ગામ પસંદ ન કરવામાં આવ્યું હોય તો error આપવી
  if (!village) {
    throw new CustomError("કૃપા કરીને ગામ પસંદ કરો.", 400);
  }

  // 👉 પસંદ કરેલા ગામના કુલ વીલેજર (pagination માટે)
  const totalDocs = await Villager.countDocuments({ village });

  // 👉 વીલેજર લિસ્ટ લાવવી (accountNo અને createdAt પ્રમાણે)
  const villagers = await Villager.find({ village })
    .sort({ createdAt: 1, accountNo: 1 })
    .skip((page - 1) * limit) // pagination skip
    .limit(parseInt(limit)); // pagination limit

  // 👉 Master table માંથી ટકા (percentage) સેટિંગ્સ લાવવી
  const master = await Master.findOne({ status: 1 });

  // ==================================================
  // 👉 કુલ રકમ માટેના variables (Last Row : કુલ)
  // ==================================================
  const totals = {
    maangnuLeft: 0,        // કુલ માંગણું બાકી
    maangnuRotating: 0,   // કુલ માંગણું ચલ
    fajal: 0,             // કુલ ફાજલ
    pending: 0,           // કુલ બાકી
    rotating: 0,          // કુલ ચલ
    left: 0,              // કુલ બાકી
    sarkari: 0,           // કુલ સરકાર
    sivay: 0,             // કુલ સિવાય
    collumnFourteen: 0,   // કુલ કોલમ 14
    collumnFifteen: 0,    // કુલ કોલમ 15
  };

  // ==================================================
  // 👉 દરેક વીલેજર પર loop
  // ==================================================
  await Promise.all(
    villagers.map(async (villager) => {

      // ----------------------------------------------
      // 👉 માંગણું (Maangnu) ની શરૂઆતની values
      // ----------------------------------------------
      let maangnuData = {
        rotating: 0,      // માંગણું ચલ
        pending: 0,       // માંગણું બાકી
        maangnuLeft: 0,   // માંગણું બાકી (Left)
        fajal: 0,         // ફાજલ
      };

      // ----------------------------------------------
      // 👉 વસુલાત (Revenue) ની શરૂઆતની values
      // ----------------------------------------------
      let revenueData = {
        rotating: 0,      // વસુલાત ચલ
        pending: 0,       // વસુલાત બાકી
        left: 0,          // વસુલાત બાકી
        billNo: "",
        billDate: "",
      };

      // 👉 આ વીલેજર માટેનું છેલ્લું માંગણું (financial year પ્રમાણે)
      const educationMaangnu = await EducationMaangnu.findOne({
        villager: villager._id,
        financialYear,
      }).sort({ updatedAt: -1 });

      // 👉 જો માંગણું હાજર હોય તો values assign કરવી
      if (educationMaangnu) {
        maangnuData = {
          rotating: parseFloat(educationMaangnu.rotating || 0),
          pending: parseFloat(educationMaangnu.pending || 0),
          maangnuLeft: parseFloat(educationMaangnu.left || 0),
          fajal: parseFloat(educationMaangnu.fajal || 0),
        };
      }

      // 👉 આ વીલેજર માટેની બધી વસુલાત entries લાવવી
      const educationRevenues = await EducationRevenue.find({
        villager: villager._id,
        financialYear,
      });

      // 👉 જો વસુલાત entries હોય તો બધાનો સરવાળો કરવો
      if (Array.isArray(educationRevenues) && educationRevenues.length > 0) {
        revenueData = {
          // ✔ વસુલાત ચલ = બધી entries નો કુલ
          rotating: educationRevenues.reduce(
            (sum, x) => sum + parseFloat(x.rotating || 0),
            0
          ),

          // ✔ વસુલાત બાકી = બધી entries નો કુલ
          pending: educationRevenues.reduce(
            (sum, x) => sum + parseFloat(x.pending || 0),
            0
          ),

          // ✔ વસુલાત બાકી (Left) = બધી entries નો કુલ
          left: educationRevenues.reduce(
            (sum, x) => sum + parseFloat(x.left || 0),
            0
          ),

          // ✔ Bill નંબર અને તારીખ (પ્રથમ entry માંથી)
          billNo: educationRevenues[0].billNo || "",
          billDate: educationRevenues[0].billDate || "",
        };
      }

      // ==================================================
      // 👉 Report ના columns માં values નાખવી
      // ==================================================
      villager._doc.maangnuLeft = maangnuData.maangnuLeft;      // કોલમ: માંગણું બાકી
      villager._doc.maangnuRotating = maangnuData.rotating;    // કોલમ: માંગણું ચલ
      villager._doc.fajal = maangnuData.fajal;                 // કોલમ: ફાજલ

      villager._doc.pending = revenueData.pending;             // કોલમ: બાકી
      villager._doc.rotating = revenueData.rotating;           // કોલમ: ચલ
      villager._doc.left = revenueData.left;                   // કોલમ: બાકી

      villager._doc.billNo = revenueData.billNo;
      villager._doc.billDate = revenueData.billDate;

      // ✔ સરકાર = (વીલેજર સરકાર * master ટકાવારી) / 100
      villager._doc.sarkari = parseFloat(
        ((parseFloat(villager.sarkari || 0) * master.sSarkari) / 100)
      );

      // ✔ સિવાય = (વીલેજર સિવાય * master ટકાવારી) / 100
      villager._doc.sivay = parseFloat(
        ((parseFloat(villager.sivay || 0) * master.sSivay) / 100)
      );

      // ==================================================
      // 🔢 મુખ્ય ગણતરી (IMPORTANT CALCULATION)
      // ==================================================

      // 👉 totalCalculated =
      // 👉 વસુલાત બાકી + વસુલાત પેન્ડિંગ + ફાજલ + માંગણું ચલ
      // 👉 ઉદાહરણ: કોલમ 3 + 4 + 5 + 6
      const totalCalculated =
        revenueData.left +
        revenueData.pending +
        maangnuData.fajal +
        maangnuData.rotating;

      // 👉 totalCalc =
      // 👉 માંગણું બાકી + સરકાર + સિવાય + વસુલાત ચલ
      // 👉 ઉદાહરણ: કોલમ 7 + 8 + 9 + 6
      const totalCalc =
        maangnuData.maangnuLeft +
        villager._doc.sarkari +
        villager._doc.sivay +
        revenueData.rotating;

      // ==================================================
      // 👉 કોલમ 14 અને કોલમ 15 ની ગણતરી
      // ==================================================

      // ✔ જો totalCalc વધારે હોય તો ફરક કોલમ 14 માં
      villager._doc.collumnFourteen =
        totalCalculated < totalCalc
          ? parseFloat(totalCalc - totalCalculated)
          : 0;

      // ✔ જો totalCalculated વધારે હોય તો ફરક કોલમ 15 માં
      villager._doc.collumnFifteen =
        totalCalculated > totalCalc
          ? parseFloat(totalCalculated - totalCalc)
          : 0;

      // ==================================================
      // 👉 કુલ (Grand Total) માં ઉમેરવું
      // ==================================================
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

  // 👉 Account number numeric sorting
  villagers.sort((a, b) => {
    const na = parseInt(a.accountNo, 10);
    const nb = parseInt(b.accountNo, 10);
    return (isNaN(na) ? Infinity : na) - (isNaN(nb) ? Infinity : nb);
  });

  // ==================================================
  // 👉 છેલ્લી લાઇન : કુલ (TOTAL ROW)
  // ==================================================
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

  // 👉 Response મોકલવો
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

