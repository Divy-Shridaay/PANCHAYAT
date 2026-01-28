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

// routes
app.use("/api/auth", authRoutes);

app.use("/api/register", registerRoutes);

app.use("/api/pedhinamu", pedhinamuRoutes);
app.use("/api/cashmel", cashmelRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/settings", settingsRoutes);
// global error handler
app.use(errorHandler);

export default app;
