import express from "express";
import multer from "multer";
import path from "path";
import auth from "../middleware/auth.js";
import { 
  createEntry, 
  uploadExcel, 
  getReport, 
  generatePDFReport,
  getEntry,
  getAllEntries,
  updateEntry,
  softDeleteCashMel
} from "../controllers/cashmel.controller.js";

const router = express.Router();
const upload = multer(); // memory storage

// -------------------------
// Correct Route Ordering
// -------------------------

// Get all entries
router.get("/", auth, getAllEntries);

// Create new entry
router.post("/", auth, upload.none(), createEntry);

// Upload Excel
router.post("/upload-excel", auth, upload.single("file"), uploadExcel);

// Sample Excel Download
router.get("/sample-excel", (req, res) => {
  const filePath = path.join(process.cwd(), "uploads", "sample pdf.xlsx");
  res.download(filePath, "sample_cashmel.xlsx", (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(404).send("File not found");
    }
  });
});

// JSON Report
router.get("/report", auth, getReport);

// PDF Report
router.get("/report/pdf", auth, generatePDFReport);

// Soft delete (must be BEFORE get by ID)
// router.delete("/:id", softDeleteCashMel);

router.delete("/delete/:id", auth, softDeleteCashMel);


// Update entry
router.post("/:id", auth, upload.none(), updateEntry);

// Get single entry by ID (must be LAST)
router.get("/:id", auth, getEntry);

export default router;
