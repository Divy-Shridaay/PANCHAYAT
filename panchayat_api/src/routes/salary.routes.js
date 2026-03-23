import express from "express";
import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";

const router = express.Router();

// Get all salaries
router.get("/", async (req, res) => {
    try {
        const { month, year, employeeId } = req.query;
        let query = {};
        
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);
        if (employeeId) query.employeeId = employeeId;
        
        const salaries = await Salary.find(query)
            .populate("employeeId", "firstName lastName employeeCode")
            .sort({ year: -1, month: -1 });
        
        res.json(salaries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single salary
router.get("/:id", async (req, res) => {
    try {
        const salary = await Salary.findById(req.params.id)
            .populate("employeeId", "firstName lastName employeeCode");
        
        if (!salary) {
            return res.status(404).json({ message: "Salary record not found" });
        }
        
        res.json(salary);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Generate salary for employee
router.post("/generate", async (req, res) => {
    try {
        const { employeeId, month, year, basicSalary } = req.body;
        
        // Check if salary already exists
        const existingSalary = await Salary.findOne({ employeeId, month, year });
        if (existingSalary) {
            return res.status(400).json({ 
                message: "આ કર્મચારી માટે આ મહિનાનો પગાર પહેલેથી જનરેટ થઈ ચુક્યો છે" 
            });
        }
        
        // Calculate allowances
        const da = basicSalary * 0.5; // 50% DA
        const hra = basicSalary * 0.2; // 20% HRA
        const ta = basicSalary * 0.1; // 10% TA
        const medical = 1250;
        
        // Calculate deductions
        const pf = basicSalary * 0.12;
        const esi = basicSalary <= 21000 ? basicSalary * 0.0075 : 0;
        const professionalTax = basicSalary > 15000 ? 200 : 0;
        
        const grossSalary = basicSalary + da + hra + ta + medical;
        const totalDeductions = pf + esi + professionalTax;
        const netSalary = grossSalary - totalDeductions;
        
        const salary = new Salary({
            employeeId,
            month,
            year,
            basicSalary,
            allowances: { da, hra, ta, medical, special: 0, other: 0 },
            deductions: { pf, esi, professionalTax, tds: 0, advance: 0, other: 0 },
            grossSalary,
            netSalary,
            generatedBy: "System"
        });
        
        const savedSalary = await salary.save();
        await savedSalary.populate("employeeId", "firstName lastName employeeCode");
        
        res.status(201).json(savedSalary);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update salary status
router.put("/:id/status", async (req, res) => {
    try {
        const { status, paymentDate, paymentMode, bankReference } = req.body;
        const salary = await Salary.findByIdAndUpdate(
            req.params.id,
            { 
                status, 
                paymentDate: status === "paid" ? (paymentDate || Date.now()) : null,
                paymentMode, 
                bankReference,
                approvedBy: status === "paid" ? "Admin" : null,
                updatedAt: Date.now()
            },
            { new: true }
        );
        
        if (!salary) {
            return res.status(404).json({ message: "Salary record not found" });
        }
        
        res.json(salary);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete salary
router.delete("/:id", async (req, res) => {
    try {
        const salary = await Salary.findByIdAndDelete(req.params.id);
        
        if (!salary) {
            return res.status(404).json({ message: "Salary record not found" });
        }
        
        res.json({ message: "Salary deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;