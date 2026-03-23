import express from "express";
import Parameter from "../models/Parameter.js";

const router = express.Router();

// Get all parameters
router.get("/", async (req, res) => {
  try {
    const { examName } = req.query;
    let query = {};
    
    if (examName) {
      query.examName = examName;
    }
    
    const parameters = await Parameter.find(query).sort({ createdAt: -1 });
    res.json(parameters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single parameter
router.get("/:id", async (req, res) => {
  try {
    const parameter = await Parameter.findById(req.params.id);
    if (!parameter) return res.status(404).json({ message: "Parameter not found" });
    res.json(parameter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create parameter
router.post("/", async (req, res) => {
  try {
    // Check if parameter with same examName already exists
    const existing = await Parameter.findOne({ examName: req.body.examName });
    if (existing) {
      return res.status(400).json({ 
        message: `'${req.body.examName}' નામનું પેરામીટર પહેલેથી અસ્તિત્વમાં છે. કૃપા કરી અપડેટ કરો.` 
      });
    }
    
    const parameter = new Parameter(req.body);
    const savedParameter = await parameter.save();
    res.status(201).json(savedParameter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update parameter
router.put("/:id", async (req, res) => {
  try {
    const parameter = await Parameter.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!parameter) {
      return res.status(404).json({ message: "Parameter not found" });
    }
    
    res.json(parameter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete parameter
router.delete("/:id", async (req, res) => {
  try {
    const parameter = await Parameter.findByIdAndDelete(req.params.id);
    if (!parameter) {
      return res.status(404).json({ message: "Parameter not found" });
    }
    res.json({ message: "Parameter deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;