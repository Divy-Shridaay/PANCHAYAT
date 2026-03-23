const mongoose = require('mongoose');

const EmployeeDetailSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    documentType: {
        type: String,
        enum: ['resume', 'photo', 'certificate', 'experience', 'other'],
        required: true
    },
    documentName: String,
    documentPath: String,
    notes: String,
    previousEmployer: String,
    previousExperience: Number,
    referenceName: String,
    referenceContact: String,
    emergencyContact: {
        name: String,
        relationship: String,
        mobile: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('EmployeeDetail', EmployeeDetailSchema);