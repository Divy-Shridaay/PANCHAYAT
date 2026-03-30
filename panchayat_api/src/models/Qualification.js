// models/Qualification.js
import mongoose from "mongoose";

const QualificationSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    
    // Auto-filled from employee
    employeeName: {
        type: String
    },
    employeeGroup: {
        type: String
    },
    employeePosition: {
        type: String
    },
    
    // Withdrawal fields
    withdrawalDate: {
        type: Date
    },
    
    withdrawalType: {
        type: String,
        enum: ["festival_with_deduction", "festival_without_deduction", "advance_salary", "loan", "other"]
    },
    
    amount: {
        type: Number,
        default: 0
    },
    
    remarks: {
        type: String
    },
    
    // Original qualification fields (keeping for backward compatibility)
    qualificationName: {
        type: String
    },
    
    qualificationType: {
        type: String,
        enum: ["education", "training", "certification", "skill", "workshop", "withdrawal"], // Added "withdrawal"
        default: "education"
    },
    
    category: {
        type: String,
        enum: ["primary", "secondary", "higher_secondary", "graduate", "post_graduate", 
               "diploma", "certificate", "professional", "vocational", "other", "withdrawal"], // Added "withdrawal"
        default: "other"
    },
    
    institutionName: {
        type: String
    },
    
    description: {
        type: String
    },
    
    // Additional fields for education
    degreeName: String,
    board: String,
    passingYear: Number,
    percentage: Number,
    grade: String,
    specialization: String,
    
    // Additional fields for training
    trainingDuration: Number,
    startDate: Date,
    endDate: Date,
    certificateNumber: String,
    validUntil: Date,
    
    // Document upload
    documentPath: String,
    documentName: String,
    
    // Status
    status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending"
    },
    
    verifiedBy: String,
    verifiedAt: Date
}, {
    timestamps: true
});

const Qualification = mongoose.model("Qualification", QualificationSchema);
export default Qualification;