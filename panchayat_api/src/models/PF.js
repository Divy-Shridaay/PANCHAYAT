import mongoose from "mongoose";

const PFSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
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
    pfContributionEmployee: {
        type: Number,
        required: true
    },
    pfContributionEmployer: {
        type: Number,
        required: true
    },
    totalPF: {
        type: Number,
        required: true
    },
    depositDate: {
        type: Date
    },
    transactionId: {
        type: String
    },
    paymentMode: {
        type: String,
        enum: ['cash', 'cheque', 'bank transfer', 'online'],
        default: 'bank transfer'
    },
    status: {
        type: String,
        enum: ['pending', 'deposited', 'failed'],
        default: 'pending'
    },
    remarks: {
        type: String
    }
}, {
    timestamps: true
});

// Compound index to ensure unique record per employee per month/year
PFSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const PF = mongoose.model("PF", PFSchema);
export default PF;