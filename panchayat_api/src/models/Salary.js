//model/salary.js
import mongoose from "mongoose";

const SalarySchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    basicSalary: {
        type: Number,
        required: true,
        default: 0
    },
    gradePay: {
        type: Number,
        default: 0
    },
    allowances: {
        da: { type: Number, default: 0 },
        hra: { type: Number, default: 0 },
        ta: { type: Number, default: 0 },
        medical: { type: Number, default: 0 },
        cleaning: { type: Number, default: 0 },
        special: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    deductions: {
        pf: { type: Number, default: 0 },
        esi: { type: Number, default: 0 },
        professionalTax: { type: Number, default: 0 },
        employeeContribution: { type: Number, default: 0 },
        otherContribution: { type: Number, default: 0 },
        pli: { type: Number, default: 0 },
        cooperativeInstallment: { type: Number, default: 0 },
        tds: { type: Number, default: 0 },
        advance: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    grossSalary: {
        type: Number,
        required: true
    },
    netSalary: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date
    },
    paymentMode: {
        type: String,
        enum: ["cash", "cheque", "bank transfer", "online"]
    },
    bankReference: {
        type: String
    },
    status: {
        type: String,
        enum: ["pending", "paid", "cancelled"],
        default: "pending"
    },
    generatedBy: {
        type: String,
        default: "System"
    },
    approvedBy: {
        type: String
    },
    remarks: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

// Compound index to ensure unique salary per employee per month/year
SalarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const Salary = mongoose.model("Salary", SalarySchema);
export default Salary;