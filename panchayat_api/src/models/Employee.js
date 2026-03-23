import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
    // Basic Information
    employeeName: { type: String, required: true },
    employeeNameEnglish: { type: String, default: "" },
    registrationNumber: { type: String, default: "" },
    employeeGroup: { type: String, default: "" },
    employeeCode: { type: String, required: true, unique: true },
    employeeCodeEnglish: { type: String, default: "" },
    
    // Banking Details
    bankNameEnglish: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    
    // Employment Details
    salaryScale: { type: String, default: "" },
    mobileNumber: { type: String, required: true },
    pfAccount: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    adp: { type: String, default: "" },
    gradePay: { type: String, default: "" },
    totalBasic: { type: String, default: "" },
    remarks: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    
    // Monthly Earnings
    dearnessAllowance: { type: Number, default: 0 },
    houseRent: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    travelAllowance: { type: Number, default: 0 },
    basicPay: { type: Number, default: 0 },
    
    // Monthly Deductions
    employeeProvidentFund: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    esi: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    welfareFund: { type: Number, default: 0 },
    
    // Family Information
    mukhiyaName: { type: String, default: "" },
    maritalStatus: { type: String, enum: ['hayat', 'mut'], default: 'hayat' },
    birthDate: { type: Date },
    age: { type: Number, default: 0 },
    totalAnnualAmount: { type: Number, default: 0 },
    address: { type: String, default: "" },
    
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