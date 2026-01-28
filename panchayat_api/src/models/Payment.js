import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  email: { 
    type: String, 
    required: true 
  },
  
  modules: {
    pedhinamu: { type: Boolean, default: false },
    rojmel: { type: Boolean, default: false },
    jaminMehsul: { type: Boolean, default: false }
  },
  
  baseAmount: { 
    type: Number, 
    required: true 
  },
  
  gstNumber: { 
    type: String 
  },
  
  gstAmount: { 
    type: Number, 
    default: 0 
  },
  
  totalAmount: { 
    type: Number, 
    required: true 
  },
  
  paymentMethod: {
    type: String,
    enum: ['BANK', 'UPI'],
    required: true
  },
  
  screenshotPath: { 
    type: String, 
    required: true 
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  isEmailSent: {
    type: Boolean,
    default: false
  },
  
  paymentDate: {
    type: Date,
    default: Date.now
  },
  
  approvalDate: { 
    type: Date 
  },
  
  rejectionReason: { 
    type: String 
  },

}, { timestamps: true });

export default mongoose.model("Payment", PaymentSchema);
