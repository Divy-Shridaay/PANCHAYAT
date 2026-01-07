import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1) HARD-CODED ADMIN LOGIN
    if (username === "admin" && password === "admin") {
      const token = jwt.sign(
        { _id: "admin_static_id", role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "એડમિન લૉગિન સફળ રહ્યું",
        token,
        user: {
          _id: "admin_static_id",
          username: "admin",
          role: "admin",
          name: "System Admin"
        }
      });
    }

    // 2) NORMAL USER LOGIN
    const user = await User.findOne({ username, isDeleted: false });
    if (!user)
      return res.status(404).json({ message: "વપરાશકર્તા મળ્યો નથી" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ message: "ખોટો પાસવર્ડ " });

 

    const token = jwt.sign(
      { _id: user._id, role: user.role, gam: user.gam },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userData = user.toObject();
    delete userData.password;

    return res.json({
     message: "લૉગિન સફળ રહ્યું",

      token,
      user: userData,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "લૉગિન નિષ્ફળ રહ્યું", error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
      return res.status(404).json({ message: "કૃપા કરીને માન્ય ઇમેઇલ દાખલ કરો" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // ✅ FIX HERE
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await transporter.sendMail({
  from: `"Panchayat System" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Password Reset Request",
  html: `
<!-- Header -->
<div style="text-align:center;">
  <h2 style="margin:10px 0 0;">
    ${user.gam} Gram Panchayat
  </h2>
  <p style="margin:4px;color:#555;">
    Taluka: ${user.taluko}
  </p>
</div>

<hr style="margin:25px 0" />

<h3>Password Reset Request</h3>

<p>
  <strong>Hello ${user.firstName} ${user.lastName},</strong>
</p>

<p>
We received a request to reset your password.<br/>
તમારા password reset માટે વિનંતી પ્રાપ્ત થઈ છે.
</p>

<div style="text-align:center;margin:30px 0;">
  <a href="${resetUrl}"
     style="
       background:#0f766e;
       color:#ffffff;
       padding:14px 26px;
       border-radius:8px;
       text-decoration:none;
       font-weight:bold;
       display:inline-block;
     ">
    Reset Password
  </a>
</div>

<p>
⏳ This link is valid for a limited time only.<br/>
⏳ આ લિંક મર્યાદિત સમય માટે જ માન્ય છે.
</p>

<p style="color:#b91c1c;font-weight:bold;">
⚠ Do NOT share this link with anyone.<br/>
⚠ આ લિંક કોઈને પણ શેર ન કરો.
</p>

<hr>

<p>
Regards,<br/>
<strong>Panchayat System</strong><br/>
<a href="https://panchayat.shridaay.com">
panchayat.shridaay.com
</a>
</p>
`,
});


    res.json({ message: "પાસવર્ડ રીસેટ ઇમેઇલ સફળતાપૂર્વક મોકલવામાં આવ્યો છે" });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({
     message: "પાસવર્ડ રીસેટ ઇમેઇલ મોકલવામાં નિષ્ફળતા",

      error: err.message,
    });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
      isDeleted: false
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Check if new password is the same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "નવો પાસવર્ડ તમારા હાલના પાસવર્ડ જેવો હોવો ન જોઈએ" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "પાસવર્ડ સફળતાપૂર્વક બદલાયો છે" });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "પાસવર્ડ બદલી શકાયો નથી", error: err.message });
  }
};



export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "જૂનો અને નવો પાસવર્ડ આપવો ફરજિયાત છે"
      });
    }

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      return res.status(404).json({
        message: "વપરાશકર્તા મળ્યો નથી"
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "જૂનો પાસવર્ડ ખોટો છે"
      });
    }

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({
        message: "નવો પાસવર્ડ જૂના પાસવર્ડ જેવો ન હોવો જોઈએ"
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({
      message: "પાસવર્ડ સફળતાપૂર્વક બદલાયો છે"
    });

  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    return res.status(500).json({
      message: "પાસવર્ડ બદલવામાં સમસ્યા આવી"
    });
  }
};
