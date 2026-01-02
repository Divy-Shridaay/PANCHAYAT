const cron = require("node-cron");
const mongoose = require("mongoose");

const Villager = require("./src/adapters/db/VillagerModel");
const FinancialYear = require("./src/adapters/db/FinancialYearModel");
const LandMaangnu = require("./src/adapters/db/LandMaangnuModel");
const EducationMaangnu = require("./src/adapters/db/EducationMaangnuModel");
const LocalFundMaangnu = require("./src/adapters/db/LocalFundMaangnuModel");
const LandRevenue = require("./src/adapters/db/LandRevenueModel");
const EducationRevenue = require("./src/adapters/db/EducationRevenueModel");
const LocalFundRevenue = require("./src/adapters/db/LocalFundRevenueModel");
const Master = require("./src/adapters/db/MasterModel");

require("dotenv").config();
const MONGO_URI = process.env.MONGO_URL;

const task = cron.schedule("0 0 0 1 8 *", async () => {
  console.log("📅 Cron task started at", new Date().toLocaleString());

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
    const master = await Master.findOne({ status: 1 });

    const date = new Date();
    const year = date.getFullYear();

    const currentFY = await FinancialYear.findOne({
      year: `${year - 1} - ${year}`,
    });
    if (!currentFY) throw new Error("Previous financial year not found");

    const newFY = new FinancialYear({
      year: `${year}-${year + 1}`,
      financialYear: `${year}-${year + 1}`,
      yearStatus: "ACTIVE",
      status: 1,
    });
    await newFY.save();
    console.log("🧾 New Financial Year created:", newFY.year);

    const villagers = await Villager.find();

    // const currentFY = await FinancialYear.findOne({
    //   year: "2022 - 2023",
    // });

    // const newFY = await FinancialYear.findOne({
    //   year: "2023 - 2024",
    // });

    // const villagers = await Villager.find({
    //   village: new mongoose.Types.ObjectId("685bd4b16aa71784a244db66"),
    // });
    console.log(`👨‍🌾 Processing ${villagers.length} villagers`);

    

    for (const villager of villagers) {
      try {
        const [
          landMaangnu,
          landRevenue,
          localMaangnu,
          localRevenue,
          educationMaangnu,
          educationRevenue,
        ] = await Promise.all([
          LandMaangnu.findOne({
            villager: villager._id,
            financialYear: currentFY._id,
          }).sort({ updatedAt: -1 }),
          LandRevenue.find({
            villager: villager._id,
            financialYear: currentFY._id,
          }),
          LocalFundMaangnu.findOne({
            villager: villager._id,
            financialYear: currentFY._id,
          }).sort({ updatedAt: -1 }),
          LocalFundRevenue.find({
            villager: villager._id,
            financialYear: currentFY._id,
          }),
          EducationMaangnu.findOne({
            villager: villager._id,
            financialYear: currentFY._id,
          }).sort({ updatedAt: -1 }),
          EducationRevenue.find({
            villager: villager._id,
            financialYear: currentFY._id,
          }),
        ]);

        let landRotatingSum = 0;
        let localRotatingSum = 0;
        let educationRotatingSum = 0;
        let landTotalSum = 0;
        let localTotalSum = 0;
        let educationTotalSum = 0;
        let localPending = 0;
        let educationPending = 0;
        let localRevenueLeft = 0;
        let educationRevenueLeft = 0;
        if (Array.isArray(landRevenue) && landRevenue.length > 0) {
          landRotatingSum = landRevenue.reduce(
            (sum, x) => sum + parseFloat(x.rotating || 0),
            0
          );
          landTotalSum = landRevenue.reduce(
            (sum, x) => sum + parseFloat(x.total || 0),
            0
          );
        }

        if (Array.isArray(localRevenue) && localRevenue.length > 0) {
          localRotatingSum = localRevenue.reduce(
            (sum, x) => sum + parseFloat(x.rotating || 0),
            0
          );
          localTotalSum = localRevenue.reduce(
            (sum, x) => sum + parseFloat(x.total || 0),
            0
          );
          localPending = localRevenue.reduce(
            (sum, x) => sum + parseFloat(x.pending || 0),
            0
          );
          localRevenueLeft = localRevenue.reduce(
            (sum, x) => sum + parseFloat(x.left || 0),
            0
          );
        }

        if (Array.isArray(educationRevenue) && educationRevenue.length > 0) {
          educationRotatingSum = educationRevenue.reduce(
            (sum, x) => sum + parseFloat(x.rotating || 0),
            0
          );
          educationTotalSum = educationRevenue.reduce(
            (sum, x) => sum + parseFloat(x.total || 0),
            0
          );
          educationPending = educationRevenue.reduce(
            (sum, x) => sum + parseFloat(x.pending || 0),
            0
          );
          educationRevenueLeft = educationRevenue.reduce(
            (sum, x) => sum + parseFloat(x.left || 0),
            0
          );
        }

        const landFajal = landMaangnu ? parseFloat(landMaangnu.fajal || 0) : 0;
        const localFajal = localMaangnu
          ? parseFloat(localMaangnu.fajal || 0)
          : 0;
        const localMaangnuRotating = localMaangnu
          ? parseFloat(localMaangnu.rotating)
          : 0;

        const educationFajal = educationMaangnu
          ? parseFloat(educationMaangnu.fajal || 0)
          : 0;

        const educationMaangnuRotating = educationMaangnu
          ? parseFloat(educationMaangnu.rotating)
          : 0;

        const landLeft = parseFloat(landMaangnu?.left || 0);
        const localLeft = parseFloat(localMaangnu?.left || 0);
        const educationLeft = parseFloat(educationMaangnu?.left || 0);
        const sivay = parseFloat(villager?.sivay || 0);
        const landRotating = landRotatingSum;
        const localRotating = localRotatingSum;
        const educationRotating = educationRotatingSum;
        const landTotal = landTotalSum + landFajal;
        const sarkari = parseFloat(villager.sarkari || 0);
        const sarkari2 = parseFloat(villager.sarkari || 0);

        const landTotalCalculated = landLeft + sivay + sarkari + landRotating;
        const landDiff = landTotalCalculated - landTotal - sarkari2;

        const newLandMaangnu = new LandMaangnu({
          villager: villager._id,
          date: new Date().toLocaleDateString("en-CA"),
          fajal: landDiff < 0 ? Math.abs(landDiff.toFixed(2)) : 0,
          left: landDiff < 0 ? 0 : landDiff.toFixed(2),
          financialYear: newFY._id,
          createdBy: villager.createdBy,
          updatedBy: villager.updatedBy,
          status: 1,
        });

        await newLandMaangnu.save();

        const localTotalCalculated =
          localRevenueLeft + localPending + localFajal + localMaangnuRotating;
        const localTotalCalc =
          localLeft +
          (sarkari * master.lSarkari) / 100 +
          (sivay * master.lSivay) / 100 +
          localRotating;

        const newLocalMaangnu = new LocalFundMaangnu({
          villager: villager._id,
          date: new Date().toLocaleDateString("en-CA"),
          left:
            localTotalCalculated < localTotalCalc
              ? parseFloat(localTotalCalc - localTotalCalculated)
              : 0,
          fajal:
            localTotalCalculated > localTotalCalc
              ? parseFloat(localTotalCalculated - localTotalCalc)
              : 0,
          financialYear: newFY._id,
          createdBy: villager.createdBy,
          updatedBy: villager.updatedBy,

          status: 1,
        });

        await newLocalMaangnu.save();

        const educationTotalCalculated =
          educationRevenueLeft +
          educationPending +
          educationFajal +
          educationMaangnuRotating;
        const educationTotalCalc =
          educationLeft +
          (sarkari * master.sSarkari) / 100 +
          (sivay * master.sSivay) / 100 +
          educationRotating;

        const newEducationMaangnu = new EducationMaangnu({
          villager: villager._id,
          date: new Date().toLocaleDateString("en-CA"),
          left:
            educationTotalCalculated < educationTotalCalc
              ? parseFloat(educationTotalCalc - educationTotalCalculated)
              : 0,
          fajal:
            educationTotalCalculated > educationTotalCalc
              ? parseFloat(educationTotalCalculated - educationTotalCalc)
              : 0,
          financialYear: newFY._id,
          createdBy: villager.createdBy,
          updatedBy: villager.updatedBy,
          status: 1,
        });

        await newEducationMaangnu.save();

        console.log(`✅ Records saved for villager: ${villager._id}`);
      } catch (innerError) {
        console.error(`❌ Error for villager ${villager._id}:`, innerError);
      }
    }
  } catch (err) {
    console.error("🚨 Cron task failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
});

task.start();
console.log("⏰ Cron job scheduled and started");
