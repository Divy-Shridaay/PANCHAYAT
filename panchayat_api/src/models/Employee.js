import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
    // Basic Information
    employeeName: { type: String, required: true },
    employeeNameEnglish: { type: String, default: "" },
    registrationDate: { type: Date },
    employeeGroup: { type: String, default: "" },
    
    // ✅ Position Fields - ADD THESE
    employeePositionEnglish: { type: String, default: "" },
    employeePositionGujarati: { type: String, default: "" },
    
    // Banking Details
    bankNameEnglish: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    
    // Employment Details
    salaryScale: { type: String, default: "" },
    basicPay: { type: Number, default: 0 },
    gradePay: { type: Number, default: 0 },
    totalBasic: { type: Number, default: 0 },
    mobileNumber: { type: String, required: true },
    pfAccount: { type: String, default: "" },
    remarks: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    
    // Monthly Earnings
    dearnessAllowance: { type: Number, default: 0 },
    houseRent: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    travelAllowance: { type: Number, default: 0 },
    cleaningAllowance: { type: Number, default: 0 },
    
    // Monthly Deductions
    employeeContribution: { type: Number, default: 0 },
    otherContribution: { type: Number, default: 0 },
    pli: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    cooperativeInstallment: { type: Number, default: 0 },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

EmployeeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Employee = mongoose.model("Employee", EmployeeSchema);
export default Employee;