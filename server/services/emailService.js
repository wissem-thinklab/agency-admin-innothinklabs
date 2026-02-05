const nodemailer = require('nodemailer');

// Email configuration for OVH
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'ssl0.ovh.net',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'contact@innothinklabs.com',
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

// Send email function
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"InnoThinkLab" <${process.env.EMAIL_USER || 'contact@innothinklabs.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: process.env.EMAIL_USER || 'contact@innothinklabs.com'
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send reply email to customer
const sendReplyEmail = async (customerEmail, customerName, replyContent, originalSubject) => {
  const subject = `Re: ${originalSubject}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reply from InnoThinkLab</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #007bff;
        }
        .header img {
          max-width: 128px;
          height: auto;
          margin-bottom: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header h1 {
          color: #007bff;
          margin: 10px 0 0 0;
          font-size: 28px;
        }
        .content {
          margin: 20px 0;
        }
        .reply-message {
          background-color: #f8f9fa;
          padding: 20px;
          border-left: 4px solid #007bff;
          margin: 20px 0;
          border-radius: 0 5px 5px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
        .footer a {
          color: #007bff;
          text-decoration: none;
        }
        .signature {
          margin-top: 20px;
          font-style: italic;
          color: #6c757d;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://innothinklabs.com/_next/image?url=%2Flogo.png&w=128&q=75" alt="InnoThinkLab Logo" />
          <h1>InnoThinkLab</h1>
          <p>Thank you for contacting us!</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${customerName}</strong>,</p>
          
          <p>Thank you for reaching out to InnoThinkLab. We have received your message and our team has reviewed it.</p>
          
          <div class="reply-message">
            <h3>Our Response:</h3>
            <p>${replyContent.replace(/\n/g, '<br>')}</p>
          </div>
          
          <p>If you have any further questions or need additional information, please don't hesitate to contact us.</p>
          
          <div class="signature">
            <p>Best regards,<br>
            The InnoThinkLab Team<br>
            <a href="mailto:contact@innothinklabs.com">contact@innothinklabs.com</a></p>
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; 2024 InnoThinkLab. All rights reserved.</p>
          <p><a href="https://innothinklabs.com">Visit our website</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Dear ${customerName},

    Thank you for reaching out to InnoThinkLab. We have received your message and our team has reviewed it.

    Our Response:
    ${replyContent}

    If you have any further questions or need additional information, please don't hesitate to contact us.

    Best regards,
    The InnoThinkLab Team
    contact@innothinklabs.com
    https://innothinklabs.com

    © 2024 InnoThinkLab. All rights reserved.
  `;

  return await sendEmail({
    to: customerEmail,
    subject,
    html,
    text
  });
};

// Send notification email to admin
const sendAdminNotification = async (messageData) => {
  const subject = `New Contact Form Submission: ${messageData.subject}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background-color: #dc3545;
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          margin: -30px -30px 20px -30px;
          text-align: center;
        }
        .header img {
          max-width: 64px;
          height: auto;
          margin-bottom: 10px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header h2 {
          margin: 10px 0 0 0;
          font-size: 24px;
        }
        .field {
          margin: 15px 0;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        .field strong {
          color: #495057;
          display: inline-block;
          width: 120px;
        }
        .message-content {
          background-color: #e9ecef;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
          font-style: italic;
        }
        .metadata {
          font-size: 12px;
          color: #6c757d;
          margin-top: 20px;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://innothinklabs.com/_next/image?url=%2Flogo.png&w=128&q=75" alt="InnoThinkLab Logo" />
          <h2>📧 New Contact Form Submission</h2>
        </div>
        
        <div class="field">
          <strong>Name:</strong> ${messageData.name}
        </div>
        
        <div class="field">
          <strong>Email:</strong> ${messageData.email}
        </div>
        
        ${messageData.phone ? `
        <div class="field">
          <strong>Phone:</strong> ${messageData.phone}
        </div>
        ` : ''}
        
        ${messageData.company ? `
        <div class="field">
          <strong>Company:</strong> ${messageData.company}
        </div>
        ` : ''}
        
        <div class="field">
          <strong>Subject:</strong> ${messageData.subject}
        </div>
        
        <div class="field">
          <strong>Priority:</strong> ${messageData.priority}
        </div>
        
        <div class="field">
          <strong>Source:</strong> ${messageData.source}
        </div>
        
        <div class="message-content">
          <strong>Message:</strong><br>
          ${messageData.message.replace(/\n/g, '<br>')}
        </div>
        
        <div class="metadata">
          <strong>Submission Date:</strong> ${new Date(messageData.submittedAt || messageData.createdAt).toLocaleString()}<br>
          <strong>IP Address:</strong> ${messageData.metadata?.ip || 'N/A'}<br>
          <strong>User Agent:</strong> ${messageData.metadata?.userAgent || 'N/A'}<br>
          <strong>Referrer:</strong> ${messageData.metadata?.referrer || 'N/A'}
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject,
    html
  });
};

module.exports = {
  sendEmail,
  sendReplyEmail,
  sendAdminNotification,
  verifyEmailConfig
};
