// const mongoose = require("mongoose");

// const Villager = require("./src/adapters/db/VillagerModel");
// const FinancialYear = require("./src/adapters/db/FinancialYearModel");
// const LandMaangnu = require("./src/adapters/db/LandMaangnuModel");
// const EducationMaangnu = require("./src/adapters/db/EducationMaangnuModel");
// const LocalFundMaangnu = require("./src/adapters/db/LocalFundMaangnuModel");
// const LandRevenue = require("./src/adapters/db/LandRevenueModel");
// const EducationRevenue = require("./src/adapters/db/EducationRevenueModel");
// const LocalFundRevenue = require("./src/adapters/db/LocalFundRevenueModel");
// const Master = require("./src/adapters/db/MasterModel");
// const { Types } = require("mongoose");
// const Village = require("./src/adapters/db/VillageModel");
// const Taluka = require("./src/adapters/db/TalukaModel");

// require("dotenv").config();
// const MONGO_URI = process.env.MONGO_URL;

// async function generateNewFinancialYearData(currentFYId, newFYId, villageId) {
//   console.log("🧾 Starting financial year migration process");
//   console.log(`Current FY ID: ${currentFYId}`);
//   console.log(`New FY ID: ${newFYId}`);

//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log("✅ MongoDB connected");

//     const [master, currentFY, newFY] = await Promise.all([
//       Master.findOne({ status: 1 }),
//       FinancialYear.findById(currentFYId),
//       FinancialYear.findById(newFYId),
//     ]);

//     if (!master) throw new Error("Master record not found");
//     if (!currentFY) throw new Error("Invalid current financial year");
//     if (!newFY) throw new Error("Invalid new financial year");

//     const villagers = await Villager.find({
//       village: new Types.ObjectId(villageId),
//     });
//     console.log(`👨‍🌾 Processing ${villagers.length} villagers`);

//     const landBulkOps = [];
//     const localBulkOps = [];
//     const educationBulkOps = [];

//     for (const villager of villagers) {
//       try {
//         let local = 0;
//         let isLocal = false;
//         if (villager.village) {
//           console.log("villager ", villager.village);

//           const village = await Village.findById(villager.village);

//           if (village.taluka) {
//             const taluka = await Taluka.findById(village.taluka);
//             let talukaName = taluka.name;

//             isLocal = ["માણસા", "વિજાપુર"].includes(talukaName.trim());

//             if (isLocal && !["વિજાપુર"].includes(talukaName.trim())) {
//               local = parseFloat(villager.sarkari * 2 + villager.sivay * 2);
//             }
//             if (isLocal && ["વિજાપુર"].includes(talukaName.trim())) {
//               local = parseFloat(villager.sarkari / 2 + villager.sivay / 2);
//             }
//           }
//         }

//         console.log("isLocal", isLocal);

//         console.log("villager._id" , villager._id , );

//         const existing = await Promise.all([
//           LandMaangnu.findOne({
//             villager: villager._id,
//             financialYear: newFY._id,
//           }),
//         ...[ !isLocal &&  LocalFundMaangnu.findOne({
//             villager: villager._id,
//             financialYear: newFY._id,
//           }) ],
//           EducationMaangnu.findOne({
//             villager: villager._id,
//             financialYear: newFY._id,
//           }),
//         ]);

//         if (existing.some((x) => !!x)) {
//           console.log(
//             `⚠️ Records already exist for villager ${villager._id}, skipping...`
//           );
//           continue;
//         }

//         const [
//           landMaangnu,
//           landRevenue,
//           localMaangnu,
//           localRevenue,
//           educationMaangnu,
//           educationRevenue,
//         ] = await Promise.all([
//           LandMaangnu.findOne({
//             villager: villager._id,
//             financialYear: currentFY._id,
//           }).sort({ updatedAt: -1 }),
//           LandRevenue.find({
//             villager: villager._id,
//             financialYear: currentFY._id,
//           }),
//           LocalFundMaangnu.findOne({
//             villager: villager._id,
//             financialYear: currentFY._id,
//           }).sort({ updatedAt: -1 }),
//           LocalFundRevenue.find({
//             villager: villager._id,
//             financialYear: currentFY._id,
//           }),
//           EducationMaangnu.findOne({
//             villager: villager._id,
//             financialYear: currentFY._id,
//           }).sort({ updatedAt: -1 }),
//           EducationRevenue.find({
//             villager: villager._id,
//             financialYear: currentFY._id,
//           }),
//         ]);

//         const sum = (arr, key) =>
//           Array.isArray(arr)
//             ? arr.reduce((s, x) => s + parseFloat(x[key] || 0), 0)
//             : 0;

//         const landRotatingSum = sum(landRevenue, "rotating");
//         const landTotalSum = sum(landRevenue, "total");

//         const localRotatingSum = sum(localRevenue, "rotating");
//         const localTotalSum = sum(localRevenue, "total");
//         const localPending = sum(localRevenue, "pending");
//         const localRevenueLeft = sum(localRevenue, "left");

//         const educationRotatingSum = sum(educationRevenue, "rotating");
//         const educationTotalSum = sum(educationRevenue, "total");
//         const educationPending = sum(educationRevenue, "pending");
//         const educationRevenueLeft = sum(educationRevenue, "left");

//         const landFajal = parseFloat(landMaangnu?.fajal || 0);
//         const localFajal = parseFloat(localMaangnu?.fajal || 0);
//         const localRotating = parseFloat(localMaangnu?.rotating || 0);
//         const educationFajal = parseFloat(educationMaangnu?.fajal || 0);
//         const educationRotating = parseFloat(educationMaangnu?.rotating || 0);

//         const landLeft = parseFloat(landMaangnu?.left || 0);
//         const localLeft = parseFloat(localMaangnu?.left || 0);
//         const educationLeft = parseFloat(educationMaangnu?.left || 0);

//         const sivay = parseFloat(villager?.sivay || 0);
//         const sarkari = parseFloat(villager?.sarkari || 0);

//         // --- Land Maangnu ---
//         const landTotalCalculated = isLocal
//           ? landLeft + sivay + sarkari + landRotatingSum + local
//           : landLeft + sivay + sarkari + landRotatingSum;

//         const landDiff =
//           landTotalCalculated - (landTotalSum + landFajal) - sarkari;

//         landBulkOps.push({
//           insertOne: {
//             document: {
//               villager: villager._id,
//               date: new Date().toLocaleDateString("en-CA"),
//               fajal: landDiff < 0 ? Math.abs(landDiff.toFixed(2)) : 0,
//               left: landDiff < 0 ? 0 : landDiff.toFixed(2),
//               financialYear: newFY._id,
//               createdBy: villager.createdBy,
//               updatedBy: villager.updatedBy,
//               status: 1,
//             },
//           },
//         });

//         // --- Local Fund Maangnu ---

//         const localTotalCalculated =
//           localRevenueLeft + localPending + localFajal + localRotating;
//         const localTotalCalc =
//           localLeft +
//           (sarkari * master.lSarkari) / 100 +
//           (sivay * master.lSivay) / 100 +
//           localRotatingSum;

//         if (!isLocal) {
//           localBulkOps.push({
//             insertOne: {
//               document: {
//                 villager: villager._id,
//                 date: new Date().toLocaleDateString("en-CA"),
//                 left:
//                   localTotalCalculated < localTotalCalc
//                     ? parseFloat(localTotalCalc - localTotalCalculated)
//                     : 0,
//                 fajal:
//                   localTotalCalculated > localTotalCalc
//                     ? parseFloat(localTotalCalculated - localTotalCalc)
//                     : 0,
//                 financialYear: newFY._id,
//                 createdBy: villager.createdBy,
//                 updatedBy: villager.updatedBy,
//                 status: 1,
//               },
//             },
//           });
//         }

//         // --- Education Maangnu ---
//         const educationTotalCalculated =
//           educationRevenueLeft +
//           educationPending +
//           educationFajal +
//           educationRotating;
//         const educationTotalCalc =
//           educationLeft +
//           (sarkari * master.sSarkari) / 100 +
//           (sivay * master.sSivay) / 100 +
//           educationRotatingSum;

//         educationBulkOps.push({
//           insertOne: {
//             document: {
//               villager: villager._id,
//               date: new Date().toLocaleDateString("en-CA"),
//               left:
//                 educationTotalCalculated < educationTotalCalc
//                   ? parseFloat(educationTotalCalc - educationTotalCalculated)
//                   : 0,
//               fajal:
//                 educationTotalCalculated > educationTotalCalc
//                   ? parseFloat(educationTotalCalculated - educationTotalCalc)
//                   : 0,
//               financialYear: newFY._id,
//               createdBy: villager.createdBy,
//               updatedBy: villager.updatedBy,
//               status: 1,
//             },
//           },
//         });

//         // Commit in batches of 500 villagers to avoid huge memory usage
//         if (landBulkOps.length >= 500) {
//           await LandMaangnu.bulkWrite(landBulkOps);
//           await LocalFundMaangnu.bulkWrite(localBulkOps);
//           await EducationMaangnu.bulkWrite(educationBulkOps);

//           landBulkOps.length = 0;
//           localBulkOps.length = 0;
//           educationBulkOps.length = 0;

//           console.log("📦 Batch inserted 500 villagers");
//         }
//       } catch (innerError) {
//         console.error(`❌ Error for villager ${villager._id}:`, innerError);
//       }
//     }

//     // Insert remaining villagers
//     if (landBulkOps.length) {
//       await LandMaangnu.bulkWrite(landBulkOps);
//       await LocalFundMaangnu.bulkWrite(localBulkOps);
//       await EducationMaangnu.bulkWrite(educationBulkOps);
//       console.log("📦 Batch inserted remaining villagers");
//     }

//     console.log("🎉 Migration completed successfully!");
//   } catch (err) {
//     console.error("🚨 Migration failed:", err.message);
//   } finally {
//     await mongoose.disconnect();
//     console.log("🔌 MongoDB disconnected");
//   }
// }

// module.exports = { generateNewFinancialYearData };

// // Replace these with actual MongoDB FinancialYear document IDs
// const currentFYId = "685bc9436aa71784a244da71"; // Example: old FY ID 24 - 25
// const newFYId = "688c038812a9655720d2a291"; // Example: new FY ID 25 - 26
// const villageId = "68c7d1981282f7ea1caf1cbe";

// generateNewFinancialYearData(currentFYId, newFYId, villageId)
//   .then(() => {
//     console.log("✅ Financial year migration finished!");
//   })
//   .catch((err) => {
//     console.error("❌ Error running migration:", err);
//   });
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
const { Types } = require("mongoose");
const Village = require("./src/adapters/db/VillageModel");
const Taluka = require("./src/adapters/db/TalukaModel");

require("dotenv").config();
const MONGO_URI = process.env.MONGO_URL;

async function generateNewFinancialYearData(currentFYId, newFYId, villageId) {
  console.log("🧾 Starting financial year migration process");
  console.log(`Current FY ID: ${currentFYId}`);
  console.log(`New FY ID: ${newFYId}`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    const [master, currentFY, newFY] = await Promise.all([
      Master.findOne({ status: 1 }),
      FinancialYear.findById(currentFYId),
      FinancialYear.findById(newFYId),
    ]);

    if (!master) throw new Error("Master record not found");
    if (!currentFY) throw new Error("Invalid current financial year");
    if (!newFY) throw new Error("Invalid new financial year");

    // 🔹 Fetch villagers only in talukas "માણસા" or "વિજાપુર"
    // const validTalukas = await Taluka.find({ name: { $in: ["માણસા", "વિજાપુર"] } });
    // const validTalukaIds = validTalukas.map((t) => t._id);

    // const villagesInTalukas = await Village.find({ taluka: { $in: validTalukaIds } });
    // const villageIds = villagesInTalukas.map((v) => v._id);

    const villagers = await Villager.find({
      village: { $in: villageId },
      // _id: new Types.ObjectId("68e89bec0bde2d9254e1cb15"),
    });

    console.log(
      `👨‍🌾 Processing ${villagers.length} villagers for migration` , 
      // villagers
    );


    const landBulkOps = [];
    const localBulkOps = [];
    const educationBulkOps = [];

    for (const villager of villagers) {
      try {
        let local = 0;
        let talukaName = "";
        let isLocal = false;

        const village = await Village.findById(villager.village).populate(
          "taluka"
        );

        if (village?.taluka?.name) {
          talukaName = village.taluka.name.trim();
          isLocal = ["માણસા", "વિજાપુર"].includes(talukaName);
          if (isLocal && talukaName === "માણસા") {
            console.log("this taluka records ");

            local = parseFloat(villager.sarkari * 2 + villager.sivay * 2);
          } else if (isLocal && talukaName === "વિજાપુર") {
            local = parseFloat(villager.sarkari / 2 + villager.sivay / 2);
          }
        }

        console.log(`\n📍 Villager: ${villager._id} | Taluka: ${talukaName}`);

        // 🔄 Delete old maangnu records if exist (for these talukas)

        await Promise.all([
          LandMaangnu.deleteMany({
            villager: villager._id,
            financialYear: newFY._id,
          }),
          LocalFundMaangnu.deleteMany({
            villager: villager._id,
            financialYear: newFY._id,
          }),
          EducationMaangnu.deleteMany({
            villager: villager._id,
            financialYear: newFY._id,
          }),
        ]);
        console.log(`🧹 Old records cleared for ${villager._id}`);

        // --- Fetch previous FY data ---
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

        const sum = (arr, key) => {
          return Array.isArray(arr)
            ? arr.reduce((s, x) => s + parseFloat(x[key] || 0), 0)
            : 0;
        };

        // --- Revenue sums ---

        const landRotatingSum = sum(landRevenue, "rotating");

        const landTotalSum = sum(landRevenue, "total");

        const localRotatingSum = sum(localRevenue, "rotating");
        const localPending = sum(localRevenue, "pending");
        const localRevenueLeft = sum(localRevenue, "left");

        const educationRotatingSum = sum(educationRevenue, "rotating");
        const educationPending = sum(educationRevenue, "pending");
        const educationRevenueLeft = sum(educationRevenue, "left");

        // --- Maangnu data ---
        const landFajal = parseFloat(landMaangnu?.fajal || 0);
        const landRotating = parseFloat(landMaangnu?.rotating || 0);
        const localFajal = parseFloat(localMaangnu?.fajal || 0);
        const localRotating = parseFloat(localMaangnu?.rotating || 0);
        const educationFajal = parseFloat(educationMaangnu?.fajal || 0);
        const educationRotating = parseFloat(educationMaangnu?.rotating || 0);

        const landLeft = parseFloat(landMaangnu?.left || 0);
        const localLeft = parseFloat(localMaangnu?.left || 0);
        const educationLeft = parseFloat(educationMaangnu?.left || 0);

        const sivay = parseFloat(villager?.sivay || 0);
        const sarkari = parseFloat(villager?.sarkari || 0);

        // --- Land Maangnu Calculation ---
        const landTotalCalculated =
          landLeft + sivay + sarkari + landRotating + local;
        const landDiff =
          landTotalCalculated - (landTotalSum + landFajal) - sarkari;



        landBulkOps.push({
          insertOne: {
            document: {
              villager: villager._id,
              date: new Date().toLocaleDateString("en-CA"),
              fajal: landDiff < 0 ? Math.abs(landDiff.toFixed(2)) : 0,
              left: landDiff < 0 ? 0 : landDiff.toFixed(2),
              financialYear: newFY._id,
              createdBy: villager.createdBy,
              updatedBy: villager.updatedBy,
              status: 1,
            },
          },
        });

        // --- Local Fund Maangnu (Always for these talukas) ---
        const localTotalCalculated =
          localRevenueLeft + localPending + localFajal + localRotating;
        const localTotalCalc =
          localLeft +
          (sarkari * master.lSarkari) / 100 +
          (sivay * master.lSivay) / 100 +
          localRotatingSum;

        console.log(
          "localTotalCalc",
          localTotalCalc,
          "localTotalCalculated",
          localTotalCalculated,
          "parseFloat(localTotalCalc - localTotalCalculated)",
          parseFloat(localTotalCalc - localTotalCalculated)
        );

        // return;
        localBulkOps.push({
          insertOne: {
            document: {
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
            },
          },
        });

        // --- Education Maangnu ---
        const educationTotalCalculated =
          educationRevenueLeft +
          educationPending +
          educationFajal +
          educationRotating;
        const educationTotalCalc =
          educationLeft +
          (sarkari * master.sSarkari) / 100 +
          (sivay * master.sSivay) / 100 +
          educationRotatingSum;

        educationBulkOps.push({
          insertOne: {
            document: {
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
            },
          },
        });

        // Commit batch every 500
        if (landBulkOps.length >= 500) {
          await LandMaangnu.bulkWrite(landBulkOps);
          await LocalFundMaangnu.bulkWrite(localBulkOps);
          await EducationMaangnu.bulkWrite(educationBulkOps);
          landBulkOps.length = 0;
          localBulkOps.length = 0;
          educationBulkOps.length = 0;
          console.log("📦 Batch inserted 500 villagers");
        }
      } catch (innerError) {
        console.error(`❌ Error for villager ${villager._id}:`, innerError);
      }
    }

    // Insert remaining
    if (landBulkOps.length) {
      await LandMaangnu.bulkWrite(landBulkOps);
      await LocalFundMaangnu.bulkWrite(localBulkOps);
      await EducationMaangnu.bulkWrite(educationBulkOps);
      console.log("📦 Batch inserted remaining villagers");
    }

    console.log("🎉 Migration completed successfully!");
  } catch (err) {
    console.error("🚨 Migration failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

module.exports = { generateNewFinancialYearData };

// Example run
const currentFYId = "685bc9436aa71784a244da71";
const newFYId = "688c038812a9655720d2a291";
const villageId = "685bd4b16aa71784a244db3e"; // not used strictly but okay

generateNewFinancialYearData(currentFYId, newFYId, villageId)
  .then(() => console.log("✅ Financial year migration finished!"))
  .catch((err) => console.error("❌ Error running migration:", err));
