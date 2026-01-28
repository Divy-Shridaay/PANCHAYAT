import nodemailer from 'nodemailer';

// Create transporter for sending emails using Office365 SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
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
          .container { max-width: 600px; margin: 0 auto; background: #f8faf9; padding: 20px; border-radius: 10px; }
          .header { background: #2A7F62; color: white; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 20px; }
          .content { background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .details { margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e3ede8; }
          .detail-label { font-weight: bold; color: #1E4D2B; }
          .detail-value { color: #555; }
          .footer { background: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; font-size: 12px; color: #666; }
          .success-badge { display: inline-block; background: #2A7F62; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; }
          .modules-list { background: #f0f9f7; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .module-item { padding: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ચુકવણી પુષ્ટિ</h1>
            <p class="success-badge">✓ સફળ</p>
          </div>
          
          <div class="content">
            <h2>શ્રી ${userName},</h2>
            
            <p>તમારી ચુકવણી સફળતાપૂર્વક મોકલવામાં આવી છે. અમે તમારી નીચેની તમામ માહિતી પ્રાપ્ત કરી છીએ.</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">ચુકવણીની તારીખ:</span>
                <span class="detail-value">${new Date(paymentDetails.paymentDate).toLocaleDateString('gu-IN')}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">ચુકવણીની પદ્ધતિ:</span>
                <span class="detail-value">${paymentDetails.paymentMethod === 'BANK' ? 'બેંક હસ્તાંતર' : 'યુપીઆઈ'}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">ઇમેલ:</span>
                <span class="detail-value">${email}</span>
              </div>
            </div>
            
            <h3 style="color: #1E4D2B; margin-top: 20px;">પસંદ કરેલ મોડ્યુલ:</h3>
            <div class="modules-list">
              ${paymentDetails.modules.pedhinamu ? '<div class="module-item">✓ પેઢીનામું</div>' : ''}
              ${paymentDetails.modules.rojmel ? '<div class="module-item">✓ રોજમેળ</div>' : ''}
              ${paymentDetails.modules.jaminMehsul ? '<div class="module-item">✓ જમીન મહેસુલ જમાબંધી હિસાબો</div>' : ''}
            </div>
            
            <h3 style="color: #1E4D2B; margin-top: 20px;">ચુકવણી વિગતો:</h3>
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">આધારભૂત રકમ:</span>
                <span class="detail-value">₹${paymentDetails.baseAmount}</span>
              </div>
              ${paymentDetails.gstAmount > 0 ? `
              <div class="detail-row">
                <span class="detail-label">GST (18%):</span>
                <span class="detail-value">₹${paymentDetails.gstAmount}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label"><strong>કુલ ચુકવણી:</strong></span>
                <span class="detail-value" style="font-weight: bold; color: #2A7F62; font-size: 18px;">₹${paymentDetails.totalAmount}</span>
              </div>
            </div>
            
            <p style="margin-top: 20px; padding: 15px; background: #e8f5f0; border-left: 4px solid #2A7F62; border-radius: 3px; color: #1E4D2B;">
              <strong>⏱️ નોંધ:</strong> તમારી સબ્સ્ક્રિપ્શન વિનંતી 24 થી 48 કલાકમાં ચકાસવામાં આવશે. મંજૂરી પછી તમને અલગ ઈમેલ મોકલવામાં આવશે.
            </p>
          </div>
          
          <div class="footer">
            <p>આ ઈમેલ અમારી સિસ્ટમ દ્વારા આપોઆપ જનરેટ કરવામાં આવી છે. કૃપા કરીને આને જવાબ આપશો નહીં.</p>
            <p>&copy; 2024 પંચાયત સિસ્ટમ. બધા અધિકારો આરક્ષિત છે.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_EMAIL}>`,
      to: email,
      subject: 'પંચાયત ચુકવણી પુષ્ટિ - Payment Confirmation',
      html: html
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'ઈમેલ સફળતાપૂર્વક મોકલવામાં આવી છે' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

export default transporter;
