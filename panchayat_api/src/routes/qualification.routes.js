import express from "express";
import Qualification from "../models/Qualification.js";

const router = express.Router();

// Get all qualifications
router.get("/", async (req, res) => {
    try {
        const { employeeId, type, status } = req.query;
        let query = {};
        
        if (employeeId) query.employeeId = employeeId;
        if (type) query.qualificationType = type;
        if (status) query.status = status;
        
        const qualifications = await Qualification.find(query)
            .populate("employeeId", "firstName lastName employeeCode department")
            .sort({ createdAt: -1 });
        
        res.json(qualifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single qualification
router.get("/:id", async (req, res) => {
    try {
        const qualification = await Qualification.findById(req.params.id)
            .populate("employeeId", "firstName lastName employeeCode");
        if (!qualification) return res.status(404).json({ message: "Qualification not found" });
        res.json(qualification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create qualification
router.post("/", async (req, res) => {
    try {
        const qualification = new Qualification(req.body);
        const savedQualification = await qualification.save();
        await savedQualification.populate("employeeId", "firstName lastName employeeCode");
        res.status(201).json(savedQualification);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update qualification
router.put("/:id", async (req, res) => {
    try {
        const qualification = await Qualification.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        ).populate("employeeId", "firstName lastName employeeCode");
        res.json(qualification);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Verify qualification
router.put("/:id/verify", async (req, res) => {
    try {
        const { status, verifiedBy, remarks } = req.body;
        const qualification = await Qualification.findByIdAndUpdate(
            req.params.id,
            { 
                status, 
                verifiedBy, 
                verifiedAt: status === "verified" ? Date.now() : null,
                remarks,
                updatedAt: Date.now()
            },
            { new: true }
        );
        res.json(qualification);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete qualification
router.delete("/:id", async (req, res) => {
    try {
        await Qualification.findByIdAndDelete(req.params.id);
        res.json({ message: "Qualification deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;