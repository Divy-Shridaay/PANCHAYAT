// routes/dailyrecord.route.js
import express from "express";
import DailyRecord from "../models/DailyRecord.js";

const router = express.Router();

// Get records by date
router.get("/", async (req, res) => {
    try {
        const { date, employeeId } = req.query;
        let query = {};
        
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.recordDate = { $gte: startDate, $lt: endDate };
        }
        
        if (employeeId) {
            query.employeeId = employeeId;
        }
        
        const records = await DailyRecord.find(query)
            .populate("employeeId", "employeeName employeeNameEnglish employeeCode employeeGroup employeePositionGujarati employeePositionEnglish isActive")  // ← FIXED: Added correct fields
            .sort({ recordDate: -1 });
        
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new record
router.post("/", async (req, res) => {
    try {
        const record = new DailyRecord(req.body);
        const savedRecord = await record.save();
        await savedRecord.populate("employeeId", "employeeName employeeNameEnglish employeeCode employeeGroup");  // ← FIXED
        res.status(201).json(savedRecord);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update record
router.put("/:id", async (req, res) => {
    try {
        const record = await DailyRecord.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        ).populate("employeeId", "employeeName employeeNameEnglish employeeCode employeeGroup");  // ← FIXED
        res.json(record);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update status
router.put("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const record = await DailyRecord.findByIdAndUpdate(
            req.params.id,
            { status, approvedAt: status === "approved" ? Date.now() : null },
            { new: true }
        );
        res.json(record);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete record
router.delete("/:id", async (req, res) => {
    try {
        await DailyRecord.findByIdAndDelete(req.params.id);
        res.json({ message: "Record deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;