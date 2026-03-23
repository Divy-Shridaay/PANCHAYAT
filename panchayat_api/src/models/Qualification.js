import mongoose from "mongoose";

const QualificationSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    
    // સમ્મેલિનુ નામ (Qualification Name)
    qualificationName: {
        type: String,
        required: true
    },
    
    // સમ્મેલિનુ જ્વલ (Qualification Type / Details)
    qualificationType: {
        type: String,
        enum: ["education", "training", "certification", "skill", "workshop"],
        required: true
    },
    
    // સમ્મેલીના કાંઠી (Category/Level)
    category: {
        type: String,
        enum: ["primary", "secondary", "higher_secondary", "graduate", "post_graduate", 
               "diploma", "certificate", "professional", "vocational", "other"],
        required: true
    },
    
    // ગૃહીતની ફાર (Form/Institution Name)
    institutionName: {
        type: String,
        required: true
    },
    
    // ગૃહીતની રમ (Amount/Fees/Cost)
    amount: {
        type: Number,
        default: 0
    },
    
    // વિશ્વો (Description/Details)
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
    verifiedAt: Date,
    remarks: String
}, {
    timestamps: true
});

const Qualification = mongoose.model("Qualification", QualificationSchema);
export default Qualification;