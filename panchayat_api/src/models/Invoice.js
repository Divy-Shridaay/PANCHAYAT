import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    billingDetails: {
        village: { type: String, required: true },
        district: { type: String },
        state: { type: String },
        phone: { type: String },
        gstNumber: { type: String }
    },
    items: [{
        srNo: { type: String, required: true },
        moduleName: { type: String, required: true },
        serviceDate: { type: Date, default: Date.now },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
        total: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    gst: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Invoice", InvoiceSchema);
