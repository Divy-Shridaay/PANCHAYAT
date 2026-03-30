import express from "express";
import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";

const router = express.Router();

// Get all salaries with filters
router.get("/", async (req, res) => {
    try {
        const { month, year, employeeId } = req.query;
        let query = {};
        
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);
        if (employeeId) query.employeeId = employeeId;
        
        const salaries = await Salary.find(query)
            .populate("employeeId", "employeeName employeeNameEnglish employeeCode employeePositionGujarati employeePositionEnglish employeeGroup basicPay gradePay employeeContribution otherContribution pli cooperativeInstallment")
            .sort({ year: -1, month: -1, createdAt: -1 });
        
        res.json(salaries);
    } catch (err) {
        console.error("Error fetching salaries:", err);
        res.status(500).json({ message: err.message });
    }
});

// Get single salary by ID
router.get("/:id", async (req, res) => {
    try {
        const salary = await Salary.findById(req.params.id)
            .populate("employeeId", "employeeName employeeNameEnglish employeeCode employeePositionGujarati employeePositionEnglish employeeGroup");
        
        if (!salary) {
            return res.status(404).json({ message: "Salary record not found" });
        }
        
        res.json(salary);
    } catch (err) {
        console.error("Error fetching salary:", err);
        res.status(500).json({ message: err.message });
    }
});

// Generate salary for employee (POST)
router.post("/generate", async (req, res) => {
    try {
        const { 
            employeeId, month, year, basicSalary, gradePay,
            allowances, deductions, grossSalary, netSalary, remarks, status 
        } = req.body;
        
        // Validate required fields
        if (!employeeId || !month || !year || !basicSalary) {
            return res.status(400).json({ 
                message: "કૃપા કરી તમામ ફરજિયાત ફીલ્ડ ભરો: employeeId, month, year, basicSalary" 
            });
        }
        
        // Check if salary already exists for this employee, month, year
        const existingSalary = await Salary.findOne({ employeeId, month, year });
        if (existingSalary) {
            return res.status(400).json({ 
                message: "આ કર્મચારી માટે આ મહિનાનો પગાર પહેલેથી જનરેટ થઈ ચુક્યો છે" 
            });
        }
        
        // Create new salary record
        const salary = new Salary({
            employeeId,
            month,
            year,
            basicSalary: basicSalary || 0,
            gradePay: gradePay || 0,
            allowances: {
                da: allowances?.da || 0,
                hra: allowances?.hra || 0,
                ta: allowances?.ta || 0,
                medical: allowances?.medical || 0,
                cleaning: allowances?.cleaning || 0,
                special: allowances?.special || 0,
                other: allowances?.other || 0
            },
            deductions: {
                pf: deductions?.pf || 0,
                esi: deductions?.esi || 0,
                professionalTax: deductions?.professionalTax || 0,
                employeeContribution: deductions?.employeeContribution || 0,
                otherContribution: deductions?.otherContribution || 0,
                pli: deductions?.pli || 0,
                cooperativeInstallment: deductions?.cooperativeInstallment || 0,
                tds: deductions?.tds || 0,
                advance: deductions?.advance || 0,
                other: deductions?.other || 0
            },
            grossSalary: grossSalary || 0,
            netSalary: netSalary || 0,
            remarks: remarks || "",
            status: status || "pending",
            generatedBy: "System"
        });
        
        const savedSalary = await salary.save();
        await savedSalary.populate("employeeId", "employeeName employeeNameEnglish employeeCode employeePositionGujarati");
        
        res.status(201).json(savedSalary);
    } catch (err) {
        console.error("Error generating salary:", err);
        
        // Handle duplicate key error
        if (err.code === 11000) {
            return res.status(400).json({ 
                message: "આ કર્મચારી માટે આ મહિનાનો પગાર પહેલેથી જનરેટ થઈ ચુક્યો છે" 
            });
        }
        
        res.status(400).json({ message: err.message });
    }
});

// Update salary (PUT)
router.put("/:id", async (req, res) => {
    try {
        const { 
            basicSalary, gradePay, allowances, deductions, 
            grossSalary, netSalary, remarks 
        } = req.body;
        
        const updateData = {
            basicSalary: basicSalary || 0,
            gradePay: gradePay || 0,
            allowances: {
                da: allowances?.da || 0,
                hra: allowances?.hra || 0,
                ta: allowances?.ta || 0,
                medical: allowances?.medical || 0,
                cleaning: allowances?.cleaning || 0,
                special: allowances?.special || 0,
                other: allowances?.other || 0
            },
            deductions: {
                pf: deductions?.pf || 0,
                esi: deductions?.esi || 0,
                professionalTax: deductions?.professionalTax || 0,
                employeeContribution: deductions?.employeeContribution || 0,
                otherContribution: deductions?.otherContribution || 0,
                pli: deductions?.pli || 0,
                cooperativeInstallment: deductions?.cooperativeInstallment || 0,
                tds: deductions?.tds || 0,
                advance: deductions?.advance || 0,
                other: deductions?.other || 0
            },
            grossSalary: grossSalary || 0,
            netSalary: netSalary || 0,
            remarks: remarks || "",
            updatedAt: Date.now()
        };
        
        const salary = await Salary.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate("employeeId", "employeeName employeeCode");
        
        if (!salary) {
            return res.status(404).json({ message: "Salary record not found" });
        }
        
        res.json(salary);
    } catch (err) {
        console.error("Error updating salary:", err);
        res.status(400).json({ message: err.message });
    }
});

// Update salary status
router.put("/:id/status", async (req, res) => {
    try {
        const { status, paymentDate, paymentMode, bankReference } = req.body;
        
        if (!status || !["pending", "paid", "cancelled"].includes(status)) {
            return res.status(400).json({ message: "માન્ય સ્થિતિ પસંદ કરો: pending, paid, cancelled" });
        }
        
        const updateData = { 
            status,
            approvedBy: status === "paid" ? "Admin" : null,
            updatedAt: Date.now()
        };
        
        if (status === "paid") {
            updateData.paymentDate = paymentDate || new Date();
            updateData.paymentMode = paymentMode || "bank transfer";
            if (bankReference) updateData.bankReference = bankReference;
        }
        
        const salary = await Salary.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        if (!salary) {
            return res.status(404).json({ message: "Salary record not found" });
        }
        
        res.json(salary);
    } catch (err) {
        console.error("Error updating salary status:", err);
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
        console.error("Error deleting salary:", err);
        res.status(500).json({ message: err.message });
    }
});

// Get salary summary for a month/year
router.get("/summary/:month/:year", async (req, res) => {
    try {
        const { month, year } = req.params;
        
        const summary = await Salary.aggregate([
            { $match: { month: parseInt(month), year: parseInt(year) } },
            {
                $group: {
                    _id: null,
                    totalGross: { $sum: "$grossSalary" },
                    totalNet: { $sum: "$netSalary" },
                    totalPF: { $sum: "$deductions.pf" },
                    totalPaid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$netSalary", 0] } },
                    totalPending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$netSalary", 0] } },
                    totalEmployees: { $sum: 1 },
                    paidCount: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
                    pendingCount: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } }
                }
            }
        ]);
        
        res.json(summary[0] || {
            totalGross: 0,
            totalNet: 0,
            totalPF: 0,
            totalPaid: 0,
            totalPending: 0,
            totalEmployees: 0,
            paidCount: 0,
            pendingCount: 0
        });
    } catch (err) {
        console.error("Error fetching summary:", err);
        res.status(500).json({ message: err.message });
    }
});

export default router;