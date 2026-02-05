# Email Setup Guide - OVH Configuration

## 📧 Email Configuration for InnoThinkLab

This guide explains how to configure email functionality for sending replies to customers.

## 🔧 Required Environment Variables

Add these to your `.env` file:

```bash
# Email Configuration (OVH)
EMAIL_HOST=ssl0.ovh.net
EMAIL_PORT=587
EMAIL_USER=contact@innothinklabs.com
EMAIL_PASS=your_ovh_email_password
ADMIN_EMAIL=contact@innothinklabs.com
```

## 🔑 OVH Email Setup Steps

### 1. Generate Application Password

1. Log into your OVH Control Panel
2. Go to **Web Cloud** → **Emails**
3. Select your domain `innothinklabs.com`
4. Click on **Manage** for `contact@innothinklabs.com`
5. Go to **Security** → **Application passwords**
6. Click **Add an application password**
7. Give it a descriptive name (e.g., "Admin Panel")
8. Copy the generated password

### 2. Configure SMTP Settings

Use these settings in your `.env` file:

- **SMTP Server**: `ssl0.ovh.net`
- **Port**: `587`
- **Username**: `contact@innothinklabs.com`
- **Password**: Your application password from step 1
- **Encryption**: STARTTLS (implicit)

### 3. Update .env File

```bash
# Navigate to server directory
cd server

# Edit .env file
nano .env

# Add email configuration
EMAIL_HOST=ssl0.ovh.net
EMAIL_PORT=587
EMAIL_USER=contact@innothinklabs.com
EMAIL_PASS=your_application_password_here
ADMIN_EMAIL=contact@innothinklabs.com
```

## 🚀 How Email Sending Works

### 1. New Contact Form Submission
When someone submits the contact form:
- ✅ Message is saved to database
- ✅ Admin receives notification email at `contact@innothinklabs.com`
- ✅ Email includes all form details and metadata

### 2. Admin Reply to Customer
When admin replies to a message:
- ✅ Reply is saved to database
- ✅ Customer receives professional HTML email
- ✅ Email includes original message context
- ✅ Message status changes to "replied"

### 3. Email Templates

#### Admin Notification Email
- 📧 Subject: "New Contact Form Submission: [subject]"
- 🎨 Professional HTML template with all details
- 📊 Includes metadata (IP, User Agent, Referrer)

#### Customer Reply Email
- 📧 Subject: "Re: [original subject]"
- 🎨 Beautiful responsive HTML template
- 👤 Personalized with customer name
- 📝 Includes the reply content
- 🏢 Professional branding

## 🧪 Testing Email Configuration

### Test Email Service
```bash
# Restart server to test email config
npm run dev

# Check console for email verification message
# Should see: "Email server is ready to send messages"
```

### Test Contact Form
1. Submit a test message through your admin panel
2. Check if admin receives notification email
3. Reply to the message
4. Check if customer receives reply email

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify email password is correct
   - Use application password, not main password
   - Check email address spelling

2. **Connection Timeout**
   - Verify SMTP server: `ssl0.ovh.net`
   - Check port: `587`
   - Ensure firewall allows SMTP connections

3. **Email Not Sending**
   - Check console logs for error messages
   - Verify all environment variables are set
   - Test with `nodemailer` test script

### Debug Script
Create a test file `test-email.js`:

```javascript
const { sendEmail, verifyEmailConfig } = require('./services/emailService');

async function testEmail() {
  try {
    const isConfigured = await verifyEmailConfig();
    if (!isConfigured) {
      console.log('Email configuration failed');
      return;
    }
    
    await sendEmail({
      to: 'your-test-email@example.com',
      subject: 'Test Email',
      html: '<h1>Test Email</h1><p>This is a test email from InnoThinkLab.</p>',
      text: 'Test Email - This is a test email from InnoThinkLab.'
    });
    
    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testEmail();
```

Run with: `node test-email.js`

## 📋 Email Features

### ✅ What's Included:
- **Professional HTML Templates**: Responsive, branded emails
- **Text Fallback**: Plain text version for email clients
- **Error Handling**: Graceful failure without breaking app
- **Logging**: Detailed email send logs
- **Metadata Tracking**: IP, User Agent, Referrer
- **Admin Notifications**: Instant alerts for new messages
- **Customer Replies**: Automated email sending on admin reply

### 🎨 Email Design Features:
- **Responsive Design**: Works on all devices
- **Professional Branding**: InnoThinkLab colors and logo
- **Logo Integration**: Your company logo in all emails
- **Clear Typography**: Easy to read fonts
- **Structured Layout**: Organized information display
- **Contact Information**: Reply-to and contact details

## 🔒 Security Considerations

1. **Application Passwords**: Use OVH application passwords
2. **Environment Variables**: Never commit `.env` file
3. **Error Handling**: Emails don't break the application
4. **Rate Limiting**: Consider implementing email rate limits
5. **Verification**: Email config verified on startup

## 📊 Monitoring

### Email Logs
Check console for:
- ✅ "Email server is ready to send messages"
- ✅ "Email sent successfully: [message-id]"
- ✅ "Reply email sent to [customer-email]"
- ❌ "Email configuration error: [error]"
- ❌ "Failed to send reply email: [error]"

### Success Indicators
- New messages trigger admin notifications
- Replies trigger customer emails
- No console errors related to email
- Customers confirm receiving replies

## 🚀 Production Deployment

For production deployment:

1. **Set Production Environment Variables**
2. **Test Email Configuration**
3. **Monitor Email Logs**
4. **Set Up Email Monitoring** (optional)

## 📞 OVH Support

If you encounter issues:
- OVH Documentation: https://docs.ovh.com
- OVH Support: Through your control panel
- SMTP Settings: https://docs.ovh.com/gb/en/emails

---

**Your email system is now ready to send professional replies to customers!** 🎉

When you reply to a message in the admin panel, the customer will automatically receive a beautiful HTML email with your response.
