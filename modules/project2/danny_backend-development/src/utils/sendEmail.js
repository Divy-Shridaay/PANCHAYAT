const nodeMailer = require("nodemailer");

const sendEmail = async (option) => {
  const transporter = nodeMailer.createTransport({
    //service: process.env.SMPT_SERVICE,
    host: "smtp.outlook.com",
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOption = {
    from: process.env.SMTP_MAIL,
    to: option.email,
    subject: option.subject,
    text: option.message,
    html: option.html
  };

  await transporter.sendMail(mailOption);
};

module.exports = sendEmail;
