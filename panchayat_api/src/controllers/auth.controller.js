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

    // Ensure user has a password set before comparing
    if (!user.password) {
      console.warn("User has no password set:", user._id);
      return res.status(400).json({ message: "પાસવર્ડ સેટ કરેલ નથી" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "ખોટો પાસવર્ડ " });



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
    console.error("LOGIN ERROR:", err?.message || err, { body: req.body });
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

    // ✅ Create transporter for email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      requireTLS: true,
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
    <!DOCTYPE html>
    <html lang="gu">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f6f9fc; }
        .container { max-width: 600px; margin: 20px auto; background: white; padding: 30px; border-radius: 12px; border: 1px solid #e3ede8; }
        .content { margin-bottom: 25px; }
        .greeting { font-size: 18px; font-weight: bold; color: #1E4D2B; margin-bottom: 15px; }
        .footer { border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666; }
        .btn { background:#0f766e; color:#ffffff; padding:14px 26px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <h3 style="color: #1E4D2B; margin-top:0;">Password Reset Request</h3>
          <p class="greeting">Hello ${user.firstName} ${user.lastName},</p>

          <p>
            We received a request to reset your password.<br/>
            તમારા password reset માટે વિનંતી પ્રાપ્ત થઈ છે.
          </p>

          <div style="text-align:center;margin:30px 0;">
            <a href="${resetUrl}" style="background:#0f766e; color:#ffffff; padding:14px 26px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
              Reset Password
            </a>
          </div>

          <p>
            ⏳ This link is valid for a limited time only.<br/>
            ⏳ આ લિંક મર્યાદિત સમય માટે જ માન્ય છે.
          </p>

          <p style="color:#b91c1c;font-weight:bold;">
            ⚠ Do NOT share this link with anyone.<br/>
            ⚠ આ લિંક કોઈને પણ શેર કરશો નહીં.
          </p>
        </div>

        <div class="footer">
          <p>
          Shridaay Technolabs<br>
          it@shridaay.com</p>
        </div>
      </div>
    </body>
    </html>
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
      return res.status(400).json({ message: "New password cannot be the same as the previous password" });
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