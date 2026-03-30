import express from "express";
import PF from "../models/PF.js";

const router = express.Router();

// ===================== GET ALL PF RECORDS =====================
router.get("/", async (req, res) => {
  try {
    const { month, year, employeeId, status } = req.query;
    let query = {};
    
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;
    
    const pfRecords = await PF.find(query)
      .populate("employeeId", "firstName lastName employeeCode department employeeGroup employeePositionGujarati employeeName")
      .sort({ year: -1, month: -1, createdAt: -1 });
    
    res.json(pfRecords);
  } catch (err) {
    console.error("Error fetching PF records:", err);
    res.status(500).json({ message: err.message });
  }
});

// ===================== GET SINGLE PF RECORD =====================
router.get("/:id", async (req, res) => {
  try {
    const pfRecord = await PF.findById(req.params.id)
      .populate("employeeId", "firstName lastName employeeCode department employeeGroup employeePositionGujarati employeeName");
    
    if (!pfRecord) {
      return res.status(404).json({ message: "PF record not found" });
    }
    
    res.json(pfRecord);
  } catch (err) {
    console.error("Error fetching PF record:", err);
    res.status(500).json({ message: err.message });
  }
});

// ===================== CREATE PF RECORD =====================
router.post("/", async (req, res) => {
  try {
    // Check if record already exists for this employee/month/year
    const existingRecord = await PF.findOne({
      employeeId: req.body.employeeId,
      month: req.body.month,
      year: req.body.year
    });
    
    if (existingRecord) {
      return res.status(400).json({ 
        message: "આ કર્મચારી માટે આ મહિનાનો PF રેકોર્ડ પહેલેથી અસ્તિત્વમાં છે" 
      });
    }
    
    const pfRecord = new PF(req.body);
    const savedRecord = await pfRecord.save();
    await savedRecord.populate("employeeId", "firstName lastName employeeCode department employeeGroup employeePositionGujarati employeeName");
    
    res.status(201).json(savedRecord);
  } catch (err) {
    console.error("Error creating PF record:", err);
    res.status(400).json({ message: err.message });
  }
});

// ===================== UPDATE PF RECORD =====================
router.put("/:id", async (req, res) => {
  try {
    const pfRecord = await PF.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate("employeeId", "firstName lastName employeeCode department employeeGroup employeePositionGujarati employeeName");
    
    if (!pfRecord) {
      return res.status(404).json({ message: "PF record not found" });
    }
    
    res.json(pfRecord);
  } catch (err) {
    console.error("Error updating PF record:", err);
    res.status(400).json({ message: err.message });
  }
});

// ===================== UPDATE PF STATUS =====================
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    
    const pfRecord = await PF.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        updatedAt: Date.now(),
        depositDate: status === "deposited" ? Date.now() : undefined
      },
      { new: true }
    );
    
    if (!pfRecord) {
      return res.status(404).json({ message: "PF record not found" });
    }
    
    res.json(pfRecord);
  } catch (err) {
    console.error("Error updating PF status:", err);
    res.status(400).json({ message: err.message });
  }
});

// ===================== DELETE PF RECORD =====================
router.delete("/:id", async (req, res) => {
  try {
    const pfRecord = await PF.findByIdAndDelete(req.params.id);
    
    if (!pfRecord) {
      return res.status(404).json({ message: "PF record not found" });
    }
    
    res.json({ message: "PF record deleted successfully" });
  } catch (err) {
    console.error("Error deleting PF record:", err);
    res.status(500).json({ message: err.message });
  }
});

// ===================== GET PF SUMMARY =====================
router.get("/summary/:year/:month", async (req, res) => {
  try {
    const { year, month } = req.params;
    
    const summary = await PF.aggregate([
      { 
        $match: { 
          year: parseInt(year), 
          month: parseInt(month) 
        } 
      },
      {
        $group: {
          _id: null,
          totalBasicSalary: { $sum: "$basicSalary" },
          totalEmployeePF: { $sum: "$pfContributionEmployee" },
          totalEmployerPF: { $sum: "$pfContributionEmployer" },
          totalPF: { $sum: "$totalPF" },
          totalDeposited: { 
            $sum: { $cond: [{ $eq: ["$status", "deposited"] }, "$totalPF", 0] } 
          },
          totalPending: { 
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$totalPF", 0] } 
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json(summary[0] || {
      totalBasicSalary: 0,
      totalEmployeePF: 0,
      totalEmployerPF: 0,
      totalPF: 0,
      totalDeposited: 0,
      totalPending: 0,
      count: 0
    });
  } catch (err) {
    console.error("Error fetching PF summary:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;