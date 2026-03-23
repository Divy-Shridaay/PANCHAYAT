// import express from "express";
// import cors from "cors";
// import errorHandler from "./utils/errorHandler.js";
// import authRoutes from "./routes/auth.routes.js";
// import registerRoutes from "./routes/register.routes.js";
// import pedhinamuRoutes from "./routes/pedhinamu.routes.js";
// import cashmelRoutes from "./routes/cashmel.routes.js";
// import categoryRoutes from "./routes/category.routes.js";
// import bankRoutes from "./routes/bank.routes.js";
// import settingsRoutes from "./routes/settings.routes.js";
// import paymentRoutes from "./routes/payment.routes.js";

// const app = express();
// app.use(cors({
//   origin: [
//     "http://localhost:5173",
//     "https://panchayat.shridaay.com"
//   ],
//   credentials: true
// }));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));

// // Serve uploaded files statically
// app.use('/uploads', express.static('uploads'));
//  app.use('/api/uploads', express.static('uploads'));
//  // ✅ Serve via /api for production proxy

// // routes
// app.use("/api/auth", authRoutes);

// app.use("/api/register", registerRoutes);

// app.use("/api/pedhinamu", pedhinamuRoutes);
// app.use("/api/cashmel", cashmelRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/banks", bankRoutes);
// app.use("/api/settings", settingsRoutes);
// app.use("/api/payment", paymentRoutes);
// // global error handler
// app.use(errorHandler);

// export default app;



import express from "express";
import cors from "cors";
import errorHandler from "./utils/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import registerRoutes from "./routes/register.routes.js";
import pedhinamuRoutes from "./routes/pedhinamu.routes.js";
import cashmelRoutes from "./routes/cashmel.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import bankRoutes from "./routes/bank.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

// ===================== 🆕 PE-ROLL MODULE IMPORTS =====================
import parameterRoutes from "./routes/parameter.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import dailyRecordRoutes from "./routes/dailyRecord.routes.js";
import qualificationRoutes from "./routes/qualification.routes.js";
import pfRoutes from "./routes/pf.routes.js";
import salaryRoutes from "./routes/salary.routes.js";

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://panchayat.shridaay.com"
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));
app.use('/api/uploads', express.static('uploads'));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/pedhinamu", pedhinamuRoutes);
app.use("/api/cashmel", cashmelRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/payment", paymentRoutes);

// ===================== 🆕 PE-ROLL MODULE ROUTES =====================
app.use("/api/parameter", parameterRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/daily-record", dailyRecordRoutes);
app.use("/api/qualification", qualificationRoutes);
app.use("/api/pf", pfRoutes);
app.use("/api/salary", salaryRoutes);

// global error handler
app.use(errorHandler);

export default app;