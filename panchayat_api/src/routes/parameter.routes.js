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

// Add this new bulk update endpoint
router.post("/bulk-update", async (req, res) => {
  try {
    const { parameters } = req.body;
    
    if (!parameters || !Array.isArray(parameters)) {
      return res.status(400).json({ 
        message: "Invalid request. Parameters array is required." 
      });
    }

    // Use bulkWrite for atomic operations
    const bulkOperations = parameters.map(param => ({
      updateOne: {
        filter: { examName: param.examName },
        update: {
          $set: {
            parameterType: param.parameterType,
            value: param.value,
            minValue: param.minValue || 0,
            maxValue: param.maxValue || 0,
            status: param.status || 'active',
            updatedAt: new Date()
          }
        },
        upsert: true // Create if doesn't exist
      }
    }));

    const result = await Parameter.bulkWrite(bulkOperations);
    
    // Fetch all updated parameters to return
    const updatedParameters = await Parameter.find({
      examName: { $in: parameters.map(p => p.examName) }
    });
    
    res.json({
      success: true,
      message: `${result.modifiedCount} parameters updated, ${result.upsertedCount} created`,
      data: updatedParameters,
      stats: {
        modified: result.modifiedCount,
        upserted: result.upsertedCount,
        total: parameters.length
      }
    });
  } catch (err) {
    console.error("Bulk update error:", err);
    res.status(500).json({ 
      message: "Failed to update parameters",
      error: err.message 
    });
  }
});

// Optional: Add validation endpoint
router.post("/bulk-validate", async (req, res) => {
  try {
    const { parameters } = req.body;
    const errors = [];
    
    // Validate each parameter
    parameters.forEach((param, index) => {
      if (!param.examName) {
        errors.push({ index, field: 'examName', message: 'Exam name is required' });
      }
      if (!param.value) {
        errors.push({ index, field: 'value', message: 'Value is required' });
      }
      if (!param.parameterType) {
        errors.push({ index, field: 'parameterType', message: 'Parameter type is required' });
      }
      
      // Type-specific validation
      if (param.parameterType === 'pf' && (isNaN(param.value) || param.value < 0 || param.value > 100)) {
        errors.push({ index, field: 'value', message: 'PF interest must be between 0 and 100' });
      }
      if (param.parameterType === 'fund' && (isNaN(param.value) || param.value < 0)) {
        errors.push({ index, field: 'value', message: 'Fund amount must be a positive number' });
      }
    });
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        valid: false, 
        errors,
        message: "Validation failed for some parameters"
      });
    }
    
    res.json({ valid: true, message: "All parameters are valid" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;