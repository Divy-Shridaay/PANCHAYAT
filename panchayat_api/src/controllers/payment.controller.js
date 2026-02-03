import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { sendPaymentConfirmationEmail, sendAdminPaymentNotification } from "../utils/emailService.js";

export const submitPayment = async (req, res) => {
  console.log("Submit Payment reached with body:", { ...req.body, screenshot: req.file ? 'Attached' : 'Missing' });
  try {
    let { modules, baseAmount, gstNumber, gstAmount, totalAmount, paymentMethod } = req.body;

    // 🛡️ PARSE MULTIPART DATA (Multer provides everything as strings)
    if (typeof modules === "string") {
      try {
        modules = JSON.parse(modules);
      } catch (e) {
        console.error("Modules parsing error:", e);
        modules = {}; // Fallback
      }
    }

    // Ensure we have numbers for the database
    const numBaseAmount = Number(baseAmount) || 0;
    const numGstAmount = Number(gstAmount) || 0;
    const numTotalAmount = Number(totalAmount) || 0;

    // Get user ID from JWT token (provided by auth middleware)
    const userId = req.user._id;

    // Get fresh user details for the email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "વપરાશકર્તા મળ્યો નથી" });
    }

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "સ્ક્રીનશોટ અપલોડ કરવો જરૂરી છે" });
    }

    // 1. Create and save the payment record
    const paymentRecord = new Payment({
      userId: userId,
      email: user.email,
      modules: modules,
      baseAmount: numBaseAmount,
      gstNumber: gstNumber || null,
      gstAmount: numGstAmount,
      totalAmount: numTotalAmount,
      paymentMethod: paymentMethod,
      screenshotPath: req.file.path,
      status: 'pending'
    });

    const savedPayment = await paymentRecord.save();

    // 2. Prepare dynamic data for Admin email (Module Names and simple prices)
    // We pass prices as an empty object since individual module prices aren't strictly required for the notification
    // but the template handles it gracefully.

    // 3. Send emails sequentially for clearer logging and better control
    console.log("Step 3: Sending emails...");

    // A. Send confirmation to user
    console.log(`Sending confirmation to user: ${user.email}`);
    const userEmailResult = await sendPaymentConfirmationEmail(
      user.email,
      user.firstName || user.username || "ગ્રાહક",
      {
        modules: modules,
        baseAmount: numBaseAmount,
        gstAmount: numGstAmount,
        totalAmount: numTotalAmount,
        paymentMethod: paymentMethod,
        paymentDate: new Date()
      }
    );
    console.log("User email result:", userEmailResult);

    // B. Send notification to admin
    console.log(`Sending notification to admin: it@shridaay.com`);
    const adminEmailResult = await sendAdminPaymentNotification(
      "it@shridaay.com",
      {
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'વપરાશકર્તા',
        email: user.email,
        phone: user.phone || 'માહિતી નથી'
      },
      {
        modules: modules,
        prices: {},
        baseAmount: numBaseAmount,
        gstNumber: gstNumber,
        gstAmount: numGstAmount,
        totalAmount: numTotalAmount,
        paymentMethod: paymentMethod,
        paymentDate: new Date(),
        screenshotPath: req.file.path
      }
    );
    console.log("Admin email result:", adminEmailResult);

    const userEmailOk = userEmailResult.success;
    const adminEmailOk = adminEmailResult.success;

    console.log("Email status summary:", { user: userEmailOk, admin: adminEmailOk });

    // 4. Update statuses
    console.log("Step 4: Updating database statuses...");
    const updateData = {};
    if (userEmailOk) {
      updateData.isEmailSent = true;
    }

    // Always ensure user is set to pending verification and store selected modules
    await Promise.all([
      Payment.findByIdAndUpdate(savedPayment._id, updateData),
      User.findByIdAndUpdate(userId, {
        isPendingVerification: true,
        pendingModules: modules // Sync modules being paid for to user profile
      })
    ]);

    return res.status(200).json({
      message: "ચુકવણી સફળતાપૂર્વક સબમિટ કરવામાં આવી છે",
      paymentId: savedPayment._id,
      emailSent: userEmailOk,
      adminEmailSent: adminEmailOk
    });

  } catch (error) {
    console.error("CRITICAL PAYMENT ERROR:", error);
    return res.status(500).json({
      message: "ચુકવણી સબમિટ કરવામાં ભૂલ આવી. કૃપા કરીને સપોર્ટનો સંપર્ક કરો.",
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
