const express = require("express");
const cors = require("cors");
const userRouter = require("../adapters/api/routes/user.routes");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRouter = require("../adapters/api/routes/auth.routes");
const districtRouter = require("../adapters/api/routes/district.routes");
const villageRouter = require("../adapters/api/routes/village.routes");
const talukaRouter = require("../adapters/api/routes/taluka.routes");
const ErrorResponse = require("../domain/Responses/ErrorResponse");
const villagerRouter = require("../adapters/api/routes/villager.routes");
const currentUserRouter = require("../adapters/api/routes/currentUser.routes");
const authJWT = require("../adapters/api/middlewares/authJWT");
const rolesRoute = require("../adapters/api/routes/role.routes");
const permissionRoute = require("../adapters/api/routes/permission.routes");
const landRevenueRouter = require("../adapters/api/routes/landRevenue.routes");
const localFundRevenueRouter = require("../adapters/api/routes/localFundRevenue.routes");
const educationRevenueRouter = require("../adapters/api/routes/educationRevenue.routes");
const masterRouter = require("../adapters/api/routes/master.routes");
const financialYearRouter = require("../adapters/api/routes/financialYear.routes");
const challanRouter = require("../adapters/api/routes/challan.routes");
const landReportRouter = require("../adapters/api/routes/landReport.routes");
const localFundReportRouter = require("../adapters/api/routes/localFundReport.routes");
const educationReportRouter = require("../adapters/api/routes/educationReport.routes");
const landMaangnuRouter = require("../adapters/api/routes/landMaangnu.routes");
const localFundMaangnuRouter = require("../adapters/api/routes/localFundMaangnu.routes");
const educationCessMaangnuRouter = require("../adapters/api/routes/educationCessMaangnu.routes");
const {
  fetchVillagerByAccountNo,
} = require("../adapters/api/controllers/villager.controller");
const { asyncHandler } = require("tranxpress");
const LandRevenue = require("../adapters/db/LandRevenueModel");
const mainReportRouter = require("../adapters/api/routes/mainReports.routes");
const importDataRouter = require("../adapters/api/routes/importData.routes");
const AllDeleteRouter = require("../adapters/api/routes/allDelete.routes");
const allDeleteRouter = require("../adapters/api/routes/allDelete.routes");
const exportDataRouter = require("../adapters/api/routes/exportData.routes");
const ReportRemarkRouter = require("../adapters/api/routes/reportRemark.routes");

const app = express();
app.use(morgan("tiny"));
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(express.json({limit: "50mb"}));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRouter);
app.use("/api/current-user", authJWT, currentUserRouter);
app.use("/api/users", authJWT, userRouter);
app.use("/api/roles", authJWT, rolesRoute);
app.use("/api/permissions", authJWT, permissionRoute);
app.use("/api/districts", authJWT, districtRouter);
app.use("/api/villages", authJWT, villageRouter);
app.use("/api/talukas", authJWT, talukaRouter);
app.get("/api/villagers/by-account-no", authJWT, fetchVillagerByAccountNo);
app.use("/api/villagers", authJWT, villagerRouter);
app.use("/api/land-maangnu", authJWT, landMaangnuRouter);

app.get(
  "/api/land-revenue/check-bill-number",
  asyncHandler(async (req, res, next) => {
    const { billNo } = req.query;
    if (billNo) {
      const entry = await LandRevenue.findOne({ billNo });
      if (entry) {
        return res
          .status(200)
          .json({ message: "Bill Number already exists.", status: false });
      }
      return res
        .status(200)
        .json({ message: "Bill Number is available.", status: true });
    } else {
      const billNo = await LandRevenue.findOne()
        .sort({ billNo: -1 })
        .select("billNo")
        .lean();
        console.log(billNo)
      return res.status(200).json({
        message: "Latest Bill Number fetched.",
        status: true,
        data: billNo.billNo + 1,
      });
    }
  })
);

app.use("/api/land-revenue", authJWT, landRevenueRouter);
app.use("/api/land-report", authJWT, landReportRouter);
app.use("/api/local-fund-maangnu", authJWT, localFundMaangnuRouter);
app.use("/api/local-fund-revenue", authJWT, localFundRevenueRouter);
app.use("/api/local-fund-report", authJWT, localFundReportRouter);
app.use("/api/education-cess-maangnu", authJWT, educationCessMaangnuRouter);
app.use("/api/education-revenue", authJWT, educationRevenueRouter);
app.use("/api/education-report", authJWT, educationReportRouter);
app.use("/api/master", authJWT, masterRouter);
app.use("/api/financial-year", authJWT, financialYearRouter);
app.use("/api/challans", authJWT, challanRouter);
app.use("/api/mainReport", authJWT, mainReportRouter);
app.use("/api/import-data", authJWT, importDataRouter);
app.use("/api/export-data", authJWT, exportDataRouter);
app.use("/api/allDelete", authJWT, allDeleteRouter);
app.use('/api/reports-remark' ,authJWT , ReportRemarkRouter)

// ❌ Handle Invalid Routes
app.use(/.*/, (req, res, next) => {
  next({
    message: "Method Not Allowed.",
    statusCode: 404,
  });
});

// 🔥 Global Error Handling Middleware
app.use((err, req, res, next) => {
  let message = err.message || "Server Error";
  let statusCode = err.statusCode || 500;

  console.log("Error: ", err);

  const errorResponse = new ErrorResponse(message, statusCode);
  res.status(errorResponse.statusCode).json(errorResponse);
});

module.exports = app;
