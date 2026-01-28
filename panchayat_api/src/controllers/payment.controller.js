import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { sendPaymentConfirmationEmail } from "../utils/emailService.js";

export const submitPayment = async (req, res) => {
  try {
    const { modules, baseAmount, gstNumber, gstAmount, totalAmount, paymentMethod } = req.body;
    
    // Get user ID from JWT token
    const userId = req.user._id;
    
    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "વપરાશકર્તા મળ્યો નથી" });
    }

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "સ્ક્રીનશોટ અપલોડ કરવો જરૂરી છે" });
    }

    // Create payment record
    const paymentRecord = new Payment({
      userId: userId,
      email: user.email,
      modules: modules,
      baseAmount: baseAmount,
      gstNumber: gstNumber || null,
      gstAmount: gstAmount,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      screenshotPath: req.file.path,
      status: 'pending'
    });

    // Save payment record
    const savedPayment = await paymentRecord.save();

    // Send confirmation email
    const emailResult = await sendPaymentConfirmationEmail(
      user.email,
      user.firstName || user.username,
      {
        modules: modules,
        baseAmount: baseAmount,
        gstAmount: gstAmount,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentDate: new Date()
      }
    );

    console.log("Email send result:", emailResult);

    // Update email sent flag
    if (emailResult.success) {
      await Payment.findByIdAndUpdate(savedPayment._id, { isEmailSent: true });
    }

    return res.status(200).json({
      message: "ચુકવણી સફળતાપૂર્વક સબમિટ કરવામાં આવી છે",
      payment: savedPayment,
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error("Payment submission error:", error);
    return res.status(500).json({ 
      message: "ચુકવણી સબમિટ કરવામાં ભૂલ આવી",
      error: error.message 
    });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const payments = await Payment.find({ userId: userId }).sort({ createdAt: -1 });
    
    return res.status(200).json({
      message: "ચુકવણી વિગતો મેળવી",
      payments: payments
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    return res.status(500).json({ 
      message: "ચુકવણી વિગતો મેળવવામાં ભૂલ આવી",
      error: error.message 
    });
  }
};

export const getLatestPaymentStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const latestPayment = await Payment.findOne({ userId: userId }).sort({ createdAt: -1 });
    
    if (!latestPayment) {
      return res.status(404).json({
        message: "કોઈ ચુકવણી મળી નથી",
        status: null
      });
    }
    
    return res.status(200).json({
      message: "છેલ્લી ચુકવણીની વિગતો મેળવી",
      payment: latestPayment
    });
  } catch (error) {
    console.error("Get latest payment status error:", error);
    return res.status(500).json({ 
      message: "વિગતો મેળવવામાં ભૂલ આવી",
      error: error.message 
    });
  }
};
