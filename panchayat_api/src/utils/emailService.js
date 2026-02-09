import nodemailer from 'nodemailer';
import path from 'path';
import dotenv from 'dotenv';

// Ensure env variables are loaded even if this utility is imported early
dotenv.config();

console.log('Email Service initializing with SMTP_USER:', process.env.SMTP_USER);

// Create transporter for sending emails using Office365 SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.office365.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // port 587 usually needs false + STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  requireTLS: true,
  tls: {
    // Office365 sometimes needs this
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Transporter verification failed:', error);
  } else {
    console.log('SMTP Transporter is ready to take messages');
  }
});

// Send payment confirmation email
export const sendPaymentConfirmationEmail = async (email, userName, paymentDetails) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html lang="gu">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; border: 1px solid #e3ede8; }
          .content { margin-bottom: 25px; }
          .greeting { font-size: 18px; font-weight: bold; color: #1E4D2B; margin-bottom: 15px; }
          .footer { border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666; }
          .accent { color: #2A7F62; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <p class="greeting">પ્રિય ${userName},</p>
            
            <p>તમારી ચુકવણી સફળતાપૂર્વક પૂર્ણ કરવા બદલ આભાર. અમને તમારી ચુકવણી પ્રાપ્ત થઈ ગઈ છે અને તે અમારી સિસ્ટમમાં નોંધાઈ ગઈ છે.</p>
            
            <p>હાલમાં તમારું ખાતું એડમિન મંજૂરી માટે ચકાસણી હેઠળ છે. એડમિન દ્વારા ચુકવણી ચકાસી અને ઍક્સેસ પરવાનગી આપવામાં આવ્યા બાદ તમને ઇમેઇલ દ્વારા જાણ કરવામાં આવશે, ત્યારબાદ તમે તમારી પસંદ કરેલી યોજના મુજબ સેવાઓનો ઉપયોગ શરૂ કરી શકશો.</p>
            
            <p>આ પ્રક્રિયા સામાન્ય રીતે થોડો સમય લે છે. આ ચકાસણી સમયગાળા દરમિયાન આપના સહકાર અને ધૈર્ય બદલ અમે આભારી છીએ.</p>
            
            <p>જો આ દરમિયાન તમને કોઈ પ્રશ્ન હોય અથવા સહાયની જરૂર હોય, તો કૃપા કરીને નિઃસંકોચ અમારી સપોર્ટ ટીમનો સંપર્ક કરો.</p>
            
            <p>અમારી સેવા પસંદ કરવા બદલ આભાર.</p>
          </div>
          
          <div class="footer">
            <p>
            Shridaay Technolabs<br>
            it@shridaay.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'ચુકવણી સફળ – એડમિન મંજૂરી માટે રાહ જોવાઈ રહી છે',
      html: html
    };

    console.log('Sending Payment Confirmation Email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent successfully:', info.messageId);
    console.log('Payment confirmation email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email confirmation error:', error);
    return { success: false, error: error.message };
  }
};

// Send notification email to admin
export const sendAdminPaymentNotification = async (adminEmail, userDetails, paymentDetails) => {
  try {
    const modulesHtml = Object.entries(paymentDetails.modules)
      .filter(([_, selected]) => selected)
      .map(([id, _]) => {
        let modName = "";
        switch (id) {
          case 'pedhinamu': modName = 'પેઢીનામું મોડ્યુલ'; break;
          case 'rojmel': modName = 'રોજમેળ મોડ્યુલ'; break;
          case 'jaminMehsul': modName = 'જમીન મહેસુલ જમાબંધી હિસાબો મોડ્યુલ'; break;
          default: modName = id;
        }

        // Use price if available, otherwise just show the module name
        const price = paymentDetails.prices?.[id];
        return `<div style="padding: 5px 0;">✓ ${modName}${price ? ` – ₹${price}` : ''}</div>`;
      }).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="gu">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; border: 1px solid #e3ede8; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 18px; font-weight: bold; color: #1E4D2B; margin-bottom: 10px; border-bottom: 2px solid #2A7F62; padding-bottom: 5px; }
          .detail-row { margin-bottom: 8px; }
          .label { font-weight: bold; color: #555; }
          .footer { border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666; font-style: italic; }
          .highlight { font-size: 18px; font-weight: bold; color: #2A7F62; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="section">
            <p><strong>પ્રિય એડમિન,</strong></p>
            <p>નવા વપરાશકર્તા દ્વારા એક ચુકવણી સબમિટ કરવામાં આવી છે અને તે હાલમાં ચકાસણી માટે પેન્ડિંગ છે. કૃપા કરીને નીચે આપેલ વપરાશકર્તા અને ચુકવણી વિગતો તપાસો:</p>
          </div>

          <div class="section">
            <div class="section-title">👤 વપરાશકર્તા વિગતો</div>
            <div class="detail-row"><span class="label">નામ:</span> ${userDetails.fullName}</div>
            <div class="detail-row"><span class="label">ઈમેઇલ:</span> ${userDetails.email}</div>
            <div class="detail-row"><span class="label">મોબાઇલ નંબર:</span> ${userDetails.phone}</div>
          </div>

          <div class="section">
            <div class="section-title">📦 પસંદ કરેલા મોડ્યુલ(સ)</div>
            ${modulesHtml}
            <div style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
              <div class="detail-row"><span class="label">આધારભૂત રકમ:</span> ₹${paymentDetails.baseAmount}</div>
              ${paymentDetails.gstNumber ? `
                <div class="detail-row"><span class="label">GST નંબર:</span> ${paymentDetails.gstNumber}</div>
                <div class="detail-row"><span class="label">GST (18%):</span> ₹${paymentDetails.gstAmount}</div>
              ` : ''}
              <div class="highlight">કુલ ચુકવેલ રકમ: ₹${paymentDetails.totalAmount}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">💳 ચુકવણી વિગતો</div>
            <div class="detail-row"><span class="label">ચુકવણી પદ્ધતિ:</span> ${paymentDetails.paymentMethod === 'BANK' ? 'Bank Transfer' : 'QR Code'}</div>
            <div class="detail-row"><span class="label">ચુકવણી તારીખ:</span> ${new Date(paymentDetails.paymentDate).toLocaleDateString('gu-IN')}</div>
          </div>

          <div class="section">
            <div class="section-title">📎 ચુકવણી પુરાવો</div>
            <p>ચકાસણી માટે આ ઈમેઇલ સાથે સ્ક્રીનશોટ જોડાયેલ છે.</p>
          </div>

          <div class="section">
            <div class="section-title">⏳ જરૂરી કાર્યવાહી</div>
            <p>કૃપા કરીને એડમિન પેનલમાંથી ચુકવણી ચકાસો અને યોગ્ય પગલાં લો:</p>
            <ul>
              <li><strong>ચુકવણી મંજૂર કરો</strong> → વપરાશકર્તાને ઍક્સેસ આપવામાં આવશે</li>
              <li><strong>ચુકવણી નામંજૂર કરો</strong> → વપરાશકર્તાને ફરીથી પુરાવો સબમિટ કરવા માટે સૂચના આપવામાં આવશે</li>
            </ul>
            <p style="font-size: 13px; color: #999;">આ એક સિસ્ટમ દ્વારા જનરેટ થયેલ ઈમેઇલ છે. કૃપા કરીને આ સંદેશનો જવાબ ન આપશો.</p>
          </div>

          <div class="footer">
            <p>
            Shridaay Technolabs</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: adminEmail,
      subject: 'ચુકવણી ચકાસણી જરૂરી – નવા વપરાશકર્તાની ચુકવણી સબમિટ થઈ છે',
      html: html,
      attachments: [
        {
          filename: `payment-proof${path.extname(paymentDetails.screenshotPath)}`,
          path: paymentDetails.screenshotPath
        }
      ]
    };

    console.log('Sending Admin Notification Email to:', adminEmail);
    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Admin Email notification error:', error);
    return { success: false, error: error.message };
  }
};

// Send payment approval email to user
export const sendPaymentApprovalEmail = async (email, userName) => {
  console.log('sendPaymentApprovalEmail called for:', email, userName);
  try {
    const html = `
      <!DOCTYPE html>
      <html lang="gu">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; border: 1px solid #e3ede8; }
          .content { margin-bottom: 25px; }
          .greeting { font-size: 18px; font-weight: bold; color: #1E4D2B; margin-bottom: 15px; }
          .footer { border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <p class="greeting">પ્રિય ${userName},</p>
            
            <p>અમને આનંદ છે કે તમારી ચુકવણી સફળતાપૂર્વક પ્રાપ્ત થઈ ગઈ છે.</p>
            
            <p>ચુકવણીની પુષ્ટિ આધારે, એડમિન દ્વારા તમારી વિનંતી મંજૂર કરવામાં આવી છે અને તમારી પસંદ કરેલી યોજના મુજબ હવે તમારા ખાતાની ઍક્સેસ સક્રિય કરી દેવામાં આવી છે.</p>
            
            <p>તમે પસંદ કરેલા મોડ્યુલ્સનો ઉપયોગ તમે માત્ર 12 મહિનાની અવધિ માટે કરી શકશો.</p>
            
            <p>તમે હવે લૉગિન કરી તરત જ અમારી સેવાઓનો ઉપયોગ શરૂ કરી શકો છો.</p>
            <p>જો તમને તમારા ખાતા અથવા ફીચર્સ સંબંધિત કોઈ સમસ્યા આવે અથવા કોઈ પ્રશ્ન હોય, તો કૃપા કરીને નિઃસંકોચ અમારી સપોર્ટ ટીમનો સંપર્ક કરો.</p>
            
            <p>ચુકવણી પૂર્ણ કરવા અને અમારી સેવા પસંદ કરવા બદલ આપનો આભાર.</p>
          </div>
          
          <div class="footer">
            <p>
            Shridaay Technolabs<br>
            it@shridaay.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'ચુકવણી પ્રાપ્ત થઈ અને ખાતાની ઍક્સેસ સક્રિય કરવામાં આવી',
      html: html
    };

    console.log('Sending Approval Email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Approval email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Approval Email error:', error);
    return { success: false, error: error.message };
  }
};

// Send payment rejection email to user with reason
export const sendPaymentRejectionEmail = async (email, userName, reason) => {
  console.log('sendPaymentRejectionEmail called for:', email, userName, 'Reason:', reason);
  try {
    const html = `
      <!DOCTYPE html>
      <html lang="gu">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; baseline-top: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; border: 1px solid #e3ede8; }
          .content { margin-bottom: 25px; }
          .greeting { font-size: 18px; font-weight: bold; color: #1E4D2B; margin-bottom: 15px; }
          .reason-box { background-color: #fcecea; border-left: 4px solid #e53e3e; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .reason-title { font-weight: bold; color: #c53030; margin-bottom: 5px; }
          .footer { border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <p class="greeting">પ્રિય ${userName},</p>
            
            <p>તમારા દ્વારા સબમિટ કરવામાં આવેલ ચુકવણી પુરાવાની અમારી ટીમ દ્વારા સમીક્ષા કરવામાં આવી છે. દુર્ભાગ્યવશ, હાલ આપવામાં આવેલ પુરાવો માન્ય નથી માનવામાં આવ્યો.</p>
            
            <div class="reason-box">
              <p class="reason-title">અસ્વીકાર માટેનું કારણ:</p>
              <p>${reason}</p>
            </div>
            
            <p>કૃપા કરીને ઉપર જણાવેલ કારણ અનુસાર જરૂરી સુધારા કરી, સાચો અને સ્પષ્ટ ચુકવણી પુરાવો ફરીથી સબમિટ કરો જેથી આગળની પ્રક્રિયા પૂર્ણ કરી શકાય.</p>
            
            <p>જો તમને કોઈ પ્રશ્ન હોય અથવા મદદની જરૂર હોય, તો કૃપા કરીને અમારી સપોર્ટ ટીમનો સંપર્ક કરો.</p>
            
            <p>આપના સહકાર બદલ આભાર.</p>
          </div>
          <div class="footer">
            <p>
            Shridaay Technolabs<br>
            it@shridaay.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'ચુકવણી પુરાવો અસ્વીકાર - એક્શન જરૂરી',
      html: html
    };

    console.log('Sending Rejection Email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Rejection email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Rejection Email error:', error);
    return { success: false, error: error.message };
  }
};

// Generic sendMail function for other controllers
export const sendMail = async (to, subject, html) => {
  console.log('Generic sendMail called for:', to);
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html
    };

    console.log('Sending Generic Email to:', to);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

export default transporter;
