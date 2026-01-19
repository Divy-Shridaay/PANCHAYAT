import User from "../models/User.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { transliterateGujaratiToEnglish } from "../utils/toEnglish.js";

dotenv.config();

// ----------  transporter ----------
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",   // FIXED
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  requireTLS: true,
});





// ---------- sendMail function ----------
export const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`, // ✅ FIXED
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("Email error:", err);
    return false;
  }
};


// ---------- Helper Functions ----------

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate random username
const generateUsername = (firstName) => {
  const randomTwoDigit = Math.floor(10 + Math.random() * 90); // 10–99
  const englishName = transliterateGujaratiToEnglish(firstName);
  return `${englishName}_${randomTwoDigit}`;
};


// Generate random password
const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Allowed email domains
const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com', 'protonmail.com', 'mail.com', 'yandex.com', 'zoho.com'];

// ---------- Step 1: Send OTP ----------
export const sendOTP = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      gender,
      dob,
      email,
      phone,
      pinCode,
      taluko,
      gam,
      jillo
    } = req.body;

    // Validate required fields
 // 1. Required fields
if (!firstName || !email || !phone || !pinCode || !taluko || !gam || !jillo) {
  return res.status(400).json({
    message: "જરૂરી ફીલ્ડ ભરો"
  });
}

// 2. Email format
if (!emailRegex.test(email)) {
  return res.status(400).json({
    message: "યોગ્ય ઇમેઇલ સરનામું દાખલ કરો"
  });
}

// 3. Email domain
const emailDomain = email.split('@')[1];
if (!allowedDomains.includes(emailDomain)) {
  return res.status(400).json({
    message: "આ ઇમેઇલ ડોમેન સપોર્ટેડ નથી "
  });
}


    // Check if email already exists
    const existingUser = await User.findOne({ email, isDeleted: false });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        message: "આ ઇમેઇલ પહેલાથી રજીસ્ટર છે "
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create or update user with OTP
    const user = await User.findOneAndUpdate(
      { email },
      {
        firstName,
        middleName,
        lastName,
        gender,
        dob,
        email,
        phone,
        pinCode,
        taluko,
        gam,
        jillo,
        otp,
        otpExpiry,
        isVerified: false
      },
      { upsert: true, new: true }
    );

    // Send OTP via email
  const htmlContent = `
<!-- Header -->


<h3>OTP Verification | OTP ચકાસણી</h3>

<p><strong>નમસ્તે ${firstName},</strong></p>

<p>
Please use the OTP below to verify your email address.<br/>
નીચે આપેલ OTP નો ઉપયોગ કરીને તમારું ઇમેઇલ ચકાસો.
</p>

<div style="text-align:center;margin:30px 0;">
  <span style="
    font-size:32px;
    letter-spacing:6px;
    background:#e0f2fe;
    padding:15px 25px;
    border-radius:10px;
    color:#0369a1;
    font-weight:bold;
    display:inline-block;
  ">
    ${otp}
  </span>
</div>

<p>
⏱ This OTP is valid for <strong>10 minutes</strong> only.<br/>
⏱ આ OTP માત્ર <strong>10 મિનિટ</strong> માટે માન્ય છે.
</p>

<p style="color:#b91c1c;font-weight:bold;">
⚠ Do NOT share this OTP with anyone.<br/>
⚠ આ OTP કોઈને પણ શેર કરશો નહીં.
</p>

<hr>

<p style="font-size:13px;color:#666;">
If you did not request this, please ignore this email.
</p>

<p>
Regards,<br/>
<strong>Panchayat System</strong><br/>
<a href="https://panchayat.shridaay.com">
panchayat.shridaay.com
</a>
</p>
`;





    await sendMail(email, "Panchayat Dashboard - OTP Verification", htmlContent);

    return res.json({
      message: "OTP મોકલી દેવાયો છે (OTP sent to your email)",
      email,
      userId: user._id
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "ઇમેઇલ મોકલવામાં નિષ્ફળ થયું. કૃપા કરીને યોગ્ય ઇમેઇલ સરનામું દાખલ કરો ",
      error: err.message
    });
  }
};


// ---------- Step 2: Verify OTP and Create Account ----------
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "ઇમેઇલ અને OTP બન્ને જરૂરી છે"
      });
    }

    // Find user by email
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
      return res.status(404).json({
        message: "વપરાશકર્તા મળ્યો નથી "
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        message: "OTP સમાપ્ત થઈ ગયો છે (OTP expired)"
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        message: "ખોટો OTP (Incorrect OTP)"
      });
    }

    // Generate username and password
    const username = generateUsername(user.firstName);
    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Update user
    user.username = username;
    user.password = hashedPassword;
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.name = `${user.firstName} ${user.middleName || ""} ${user.lastName}`.trim();
    user.trialStartDate = new Date(); // Start trial period
    
    await user.save();

    // Send credentials via email
  

const htmlContent = `
<!-- Header -->
<div style="text-align:center;">
  
  <h2 style="margin:10px 0 0;">${user.gam} Gram Panchayat</h2>
  <p style="margin:4px;color:#555;">Taluka: ${user.taluko}</p>
</div>

<hr style="margin:25px 0" />

<h3>Account Created Successfully | એકાઉન્ટ સફળતાપૂર્વક બનાવાયું</h3>

<p><strong>Hello ${user.firstName} ${user.lastName},</strong></p>

<p>
Your account has been successfully created.<br/>
તમારું એકાઉન્ટ સફળતાપૂર્વક બનાવવામાં આવ્યું છે.
</p>

<div style="margin:25px 0;padding:20px;
            background:#f0fdf4;
            border:1px solid #86efac;
            border-radius:10px;">
  <p style="margin:6px 0;">
    <strong>Username:</strong> ${username}
  </p>
  <p style="margin:6px 0;">
    <strong>Password:</strong> ${rawPassword}
  </p>
</div>




<p style="margin-top:20px;">
<strong>🔐 Login URL:</strong><br/>
<a href="https://panchayat.shridaay.com/login">
  https://panchayat.shridaay.com/login
</a>
</p>

<p style="color:#dc2626;font-weight:bold;margin-top:20px;">
⚠ Important: Please change your password after first login.<br/>
 પહેલી વખત Login કર્યા પછી Password બદલશો. <br/> 

Do NOT share your password with anyone  <br/> 
કોઈ સાથે તમારો પાસવર્ડ શેર ન કરો <br/> 

પ્રથમ login પછી password બદલો
</p>


 


<hr>



<p>
Regards,<br/>
<strong>Panchayat System</strong><br/>

</p>
`;

    

    await sendMail(email, "Panchayat Dashboard - Login Credentials", htmlContent);

    return res.json({
      message: "એકાઉન્ટ સફળતાપૂર્વક બનાવાયું ",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        username: username,
        role: user.role
      }
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "OTP ચકાસવામાં નિષ્ફળ થયું ",
      error: err.message
    });
  }
};

// ---------- Admin: Get all registered users ----------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false })
      .select("-password -otp -otpExpiry")
      .sort({ createdAt: -1 });

    return res.json({
      message: "બધા યુઝર્સની યાદી ",
      totalUsers: users.length,
      users
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "યુઝર્સ લાવવામાં નિષ્ફળ ગયો ",
      error: err.message
    });
  }
};


// ---------- Admin: Get single user details ----------
export const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select("-password -otp -otpExpiry");
    
    if (!user || user.isDeleted) {
      return res.status(404).json({
        message: "ઉપયોગકર્તા મળ્યો નથી "
      });
    }

    return res.json({
      message: "ઉપયોગકર્તાની વિગત ",
      user
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "ઉપયોગકર્તાની માહિતી મેળવી શકાઈ નહીં ",
      error: err.message
    });
  }
};

// ---------- Admin: Activate user (set isPaid to true) ----------
export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { isPaid: true },
      { new: true }
    ).select("-password -otp -otpExpiry");
    
    if (!user) {
      return res.status(404).json({
        message: "ઉપયોગકર્તા મળ્યો નથી "
      });
    }

    return res.json({
      message: "ઉપયોગકર્તા સક્રિય કર્યો ",
      user
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "ઉપયોગકર્તાને સક્રિય કરવામાં નિષ્ફળ ",
      error: err.message
    });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { isPaid: false },
      { new: true }
    ).select("-password -otp -otpExpiry");
    
    if (!user) {
      return res.status(404).json({
        message: "ઉપયોગકર્તા મળ્યો નથી "
      });
    }

    return res.json({
      message: "ઉપયોગકર્તા નિષ્ક્રિય કર્યો ",
      user
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "ઉપયોગકર્તાને નિષ્ક્રિય કરવામાં નિષ્ફળ ",
      error: err.message
    });
  }
};

// ---------- Admin: Update user module toggles ----------
export const updateUserModules = async (req, res) => {
  try {
    const { userId } = req.params;
    const { modules, pedhinamuPrintAllowed } = req.body;

    const updateData = {};
    if (modules && typeof modules === "object") {
      updateData.modules = {
        ...modules
      };
    }

    if (typeof pedhinamuPrintAllowed !== "undefined") {
      updateData.pedhinamuPrintAllowed = !!pedhinamuPrintAllowed;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password -otp -otpExpiry");

    if (!user) {
      return res.status(404).json({ message: "ઉપયોગકર્તા મળ્યો નથી " });
    }

    return res.json({ message: "User modules updated", user });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "મોડ્યુલ અપડેટ કરવામાં નિષ્ફળ", error: err.message });
  }
};

// ---------- Get current user status ----------
export const getUserStatus = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming auth middleware sets req.user
    
    const user = await User.findById(userId).select("-password -otp -otpExpiry");
    
    if (!user || user.isDeleted) {
      return res.status(404).json({
        message: "ઉપયોગકર્તા મળ્યો નથી "
      });
    }

    // Calculate days since trial start
    let daysSinceTrial = 0;
    if (user.trialStartDate) {
      const now = new Date();
      const trialStart = new Date(user.trialStartDate);
      daysSinceTrial = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
    }

    const baseAccess = user.isPaid || daysSinceTrial < 8;

    // Per-module access: allow if user has base access (paid/trial) OR admin has enabled the specific module
    const modulesAccess = {
      pedhinamu: baseAccess || !!user.modules?.pedhinamu,
      rojmel: baseAccess || !!user.modules?.rojmel,
      magnu: baseAccess || !!user.modules?.magnu,
    };

    // Printing: allow if paid OR under free limit OR admin explicitly allowed pedhinamuPrintAllowed
    const canPrint = user.isPaid || user.printCount < 5 || !!user.pedhinamuPrintAllowed;

    return res.json({
      message: "ઉપયોગકર્તાની સ્થિતિ (User status)",
      user: {
        ...user.toObject(),
        daysSinceTrial,
        modulesAccess,
        canPrint
      }
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "સ્થિતિ મેળવવામાં નિષ્ફળ ",
      error: err.message
    });
  }
};

// ---------- Increment print count ----------
// ---------- Increment print count ----------
export const incrementPrintCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "ઉપયોગકર્તા મળ્યો નથી " });
    }

    // If paid users always allowed
    if (user.isPaid) {
      user.printCount += 1;
      await user.save();

      return res.json({
        canPrint: true,
        reason: "PAID_USER",
        printCount: user.printCount,
        user
      });
    }

    // If admin explicitly allowed pedhinamu prints, allow (and increment)
    if (user.pedhinamuPrintAllowed) {
      user.printCount += 1;
      await user.save();
      return res.json({
        canPrint: true,
        reason: "ADMIN_OVERRIDE",
        printCount: user.printCount,
        user
      });
    }

    // Trial users: enforce free limit
    const FREE_PRINT_LIMIT = 5;
    if (user.printCount >= FREE_PRINT_LIMIT) {
      return res.json({
        canPrint: false,
        reason: "FREE_LIMIT_EXCEEDED",
        printCount: user.printCount,
        user
      });
    }

    // Allow print and increment
    user.printCount += 1;
    await user.save();
    return res.json({
      canPrint: true,
      reason: "FREE_TRIAL",
      printCount: user.printCount,
      user
    });

  } catch (err) {
    return res.status(500).json({
      message: "Failed to increment print count",
      error: err.message
    });
  }
};

// ---------- Get Current User Profile ----------
export const getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Handle admin case
    if (userId === "admin_static_id") {
      return res.json({
        message: "Admin profile retrieved",
        user: {
          _id: "admin_static_id",
          username: "admin",
          role: "admin",
          name: "System Admin"
        }
      });
    }

    const user = await User.findById(userId).select("-password -otp -otpExpiry -resetToken -resetTokenExpiry");

    if (!user) {
      return res.status(404).json({
        message: "વપરાશકર્તા મળ્યો નહીં "
      });
    }

    return res.json({
      message: "પ્રોફાઇલ મેળવી ",
      user
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "પ્રોફાઇલ મેળવવામાં નિષ્ફળ ",
      error: err.message
    });
  }
};

// ---------- Update Current User Profile ----------
export const updateCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    // Handle admin case
    if (userId === "admin_static_id") {
      return res.status(400).json({
        message: "Admin profile cannot be updated through this endpoint"
      });
    }

    // Remove sensitive fields that shouldn't be updated
    delete updateData.password;
    delete updateData.role;
    delete updateData.isVerified;
    delete updateData.isDeleted;
    delete updateData.otp;
    delete updateData.otpExpiry;
    delete updateData.resetToken;
    delete updateData.resetTokenExpiry;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpiry -resetToken -resetTokenExpiry");

    if (!user) {
      return res.status(404).json({
        message: "વપરાશકર્તા મળ્યો નહીં "
      });
    }

    return res.json({
      message: "પ્રોફાઇલ અપડેટ થઈ ",
      user
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "પ્રોફાઇલ અપડેટ કરવામાં નિષ્ફળ",
      error: err.message
    });
  }
};

