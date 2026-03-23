import mongoose from "mongoose";

const DailyRecordSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    recordDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    workName: {
        type: String,
        required: true
    },
    employeeCenter: {
        type: String
    },
    employeeGroup: {
        type: String
    },
    employeeBody: {
        type: String
    },
    workType: {
        type: String,
        enum: ['field', 'office', 'survey', 'meeting', 'other'],
        required: true
    },
    languageEvidence: {
        type: String
    },
    duration: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: String
    },
    approvedAt: {
        type: Date
    },
    remarks: {
        type: String
    }
}, {
    timestamps: true
});

const DailyRecord = mongoose.model("DailyRecord", DailyRecordSchema);
export default DailyRecord;