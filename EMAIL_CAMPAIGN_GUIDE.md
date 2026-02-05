# Email Campaign Feature Guide

## 📧 Email Campaign System

Your admin panel now includes a powerful email campaign feature that allows you to send HTML emails to your newsletter subscribers.

## 🚀 How to Use Email Campaigns

### 1. Access Campaign Feature
- Go to **Newsletter Management** page
- Click the **"Send Campaign"** button (green button)

### 2. Configure Campaign
- **Campaign Subject**: Enter the email subject line
- **HTML Content**: Either upload an HTML file or paste HTML content
- **Target Audience**: Choose who receives the email
- **Send Options**: Configure subscriber status filtering

### 3. Send Campaign
- Click **"Send Campaign"** to start sending
- Monitor real-time results
- View success/failure statistics

## 📋 Campaign Options

### Subject Line
- **Required**: Every campaign needs a subject
- **Character Limit**: No strict limit, but keep it concise
- **Personalization**: Subject is sent as-is to all recipients

### HTML Content
**Option 1: Upload HTML File**
- **File Type**: `.html` files only
- **File Size**: Maximum 10MB
- **Supported**: Any valid HTML structure

**Option 2: Paste HTML Content**
- **Direct Paste**: Copy-paste HTML directly
- **Preview**: No live preview, ensure HTML is tested
- **Validation**: Basic HTML validation

### Target Audience
**Send To Options:**
- **All Active Subscribers**: Default option
- **Selected Subscribers**: Choose specific subscribers
- **Status Filtering**: Send to active/unsubscribed/bounced

**Subscriber Selection:**
- **Individual**: Select specific subscribers from the list
- **Bulk Selection**: Use checkbox selection for multiple
- **Dynamic Count**: Shows selected count in dropdown

## 📊 Campaign Results

### Real-time Statistics
- **Total Subscribers**: Number of targeted recipients
- **Successful Sends**: Emails delivered successfully
- **Failed Sends**: Emails that failed to send
- **Error Details**: Specific error messages per email

### Success Indicators
- ✅ **Green Stats**: Successful email deliveries
- 📧 **Email IDs**: Track each sent email
- 📊 **Percentage**: Success rate calculation
- 🔄 **Auto-refresh**: Results update in real-time

### Error Handling
- ❌ **Red Stats**: Failed email attempts
- 📝 **Error Messages**: Detailed error information
- 🔄 **Retry Logic**: Automatic retry on some errors
- 📊 **Error Analysis**: Common error patterns

## 🎨 Best Practices

### HTML Content
- **Responsive Design**: Mobile-friendly email templates
- **Inline CSS**: Email client compatibility
- **Alt Text**: Accessibility for images
- **Plain Text**: Fallback for non-HTML clients
- **Testing**: Test in multiple email clients

### Subject Lines
- **Compelling**: Clear and engaging subject lines
- **Personalization**: Use subscriber names when possible
- **Length**: Keep under 50 characters for mobile
- **Avoid Spam**: Don't use spam trigger words
- **A/B Testing**: Test different subject lines

### Campaign Strategy
- **Timing**: Send at optimal times for your audience
- **Frequency**: Don't overwhelm subscribers
- **Segmentation**: Target specific subscriber groups
- **Testing**: Send test campaigns first
- **Analytics**: Track open rates and clicks

## 🔧 Technical Details

### File Upload
- **Max File Size**: 10MB
- **Allowed Types**: `.html` files only
- **Security**: File validation and virus scanning
- **Cleanup**: Automatic file deletion after processing

### Email Sending
- **Rate Limiting**: 100ms delay between emails
- **Error Handling**: Graceful failure management
- **Logging**: Detailed send attempt logs
- **Retry Logic**: Automatic retry on temporary failures

### API Integration
- **Multipart Form**: File upload support
- **Progress Tracking**: Real-time send progress
- **Batch Processing**: Efficient bulk email sending
- **Response Format**: JSON with detailed results

## 📈 Campaign Workflow

### Pre-Campaign
1. **Prepare HTML**: Design and test email template
2. **Test Audience**: Verify subscriber list accuracy
3. **Check Settings**: Confirm email configuration
4. **Preview**: Test email rendering

### During Campaign
1. **Monitor Progress**: Watch real-time statistics
2. **Handle Errors**: Review failed sends
3. **Track Performance**: Monitor success rates
4. **Log Results**: Keep campaign records

### Post-Campaign
1. **Analyze Results**: Review campaign performance
2. **Update Segments**: Update subscriber lists
3. **Plan Next**: Use insights for future campaigns
4. **Clean Lists**: Remove bounced emails

## 🎯 Use Cases

### Marketing Campaigns
- **Product Announcements**: New product launches
- **Special Offers**: Promotions and discounts
- **Newsletters**: Regular company updates
- **Event Invitations**: Webinars and events

### Communication
- **Company News**: Important announcements
- **Service Updates**: Feature releases
- **Policy Changes**: Terms and privacy updates
- **Maintenance Notices**: Downtime notifications

## 🔍 Troubleshooting

### Common Issues
- **File Upload Errors**: Check file type and size
- **HTML Rendering**: Test in multiple email clients
- **Send Failures**: Check email configuration
- **Subscriber Count**: Verify filtering criteria

### Debug Information
- **Console Logs**: Detailed error messages
- **Network Tab**: Monitor API requests
- **Email Logs**: Check send attempt details
- **Browser Console**: Frontend error tracking

## 📞 Support

### Email Configuration Issues
- Check `.env` file email settings
- Verify OVH SMTP credentials
- Test email service independently
- Check firewall and network settings

### Campaign Issues
- Review HTML content for errors
- Check subscriber list validity
- Verify email subject formatting
- Test with smaller subscriber groups

### Performance Issues
- Monitor server resources during campaigns
- Check email provider rate limits
- Optimize HTML for faster loading
- Consider sending during off-peak hours

---

## 🎉 Ready to Send Campaigns!

Your email campaign system is now fully integrated with your newsletter management. You can:

✅ **Upload HTML files** or paste HTML content directly
✅ **Target specific subscribers** or send to all active users
✅ **Monitor real-time results** with detailed statistics
✅ **Handle errors gracefully** with detailed error reporting
✅ **Track campaign performance** with success/failure metrics

Start sending professional email campaigns to your subscribers today! 📧🚀
