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
        required: true
    },
    allowances: {
        da: { type: Number, default: 0 },
        hra: { type: Number, default: 0 },
        ta: { type: Number, default: 0 },
        medical: { type: Number, default: 0 },
        special: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    deductions: {
        pf: { type: Number, default: 0 },
        esi: { type: Number, default: 0 },
        professionalTax: { type: Number, default: 0 },
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
        type: String
    },
    approvedBy: {
        type: String
    },
    remarks: {
        type: String
    }
}, {
    timestamps: true
});

// Compound index to ensure unique salary per employee per month/year
SalarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const Salary = mongoose.model("Salary", SalarySchema);
export default Salary;