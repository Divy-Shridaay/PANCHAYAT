import mongoose from "mongoose";

const ParameterSchema = new mongoose.Schema({
    examName: {
        type: String,
        required: true,
        unique: true
    },
    parameterType: {
        type: String,
        enum: ['education', 'budget', 'description', 'agreement', 'prakar', 'pf', 'fund', 'allowance'],
        required: true
    },
    value: {
        type: String,
        required: true
    },
    minValue: {
        type: Number,
        default: 0
    },
    maxValue: {
        type: Number,
        default: 0
    },
    quantity: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

const Parameter = mongoose.model("Parameter", ParameterSchema);
export default Parameter;