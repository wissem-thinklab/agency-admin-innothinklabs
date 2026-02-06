const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const Newsletter = require('../models/Newsletter');
const mongoose = require('mongoose');
const { sendEmail, verifyEmailConfig } = require('../services/emailService');

// Verify email configuration on startup
verifyEmailConfig();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept HTML files
    if (file.mimetype === 'text/html' || file.originalname.endsWith('.html')) {
      cb(null, true);
    } else {
      cb(new Error('Only HTML files are allowed'), false);
    }
  }
});

// Get all newsletters with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, source, search } = req.query;
    
    // Build query
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (source && source !== 'all') {
      query.source = source;
    }
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    
    const newsletters = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Newsletter.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        newsletters,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get newsletters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch newsletters',
      error: error.message
    });
  }
});

// Get newsletter statistics
router.get('/stats', async (req, res) => {
  try {
    const totalSubscribers = await Newsletter.countDocuments();
    const activeSubscribers = await Newsletter.countDocuments({ status: 'active' });
    const unsubscribedSubscribers = await Newsletter.countDocuments({ status: 'unsubscribed' });
    const bouncedSubscribers = await Newsletter.countDocuments({ status: 'bounced' });
    
    const recentSubscribers = await Newsletter.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    const subscribersBySource = await Newsletter.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    
    const subscribersByStatus = await Newsletter.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalSubscribers,
        activeSubscribers,
        unsubscribedSubscribers,
        bouncedSubscribers,
        recentSubscribers,
        subscribersBySource,
        subscribersByStatus
      }
    });
  } catch (error) {
    console.error('Get newsletter stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch newsletter statistics',
      error: error.message
    });
  }
});

// Send email campaign to newsletter subscribers
router.post('/send-campaign', upload.single('htmlFile'), async (req, res) => {
  try {
    const { subject, selectedSubscribers = 'all', status = 'active', selectedIds } = req.body;
    
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required for email campaign'
      });
    }
    
    let htmlContent;
    
    // Handle HTML file upload
    if (req.file) {
      try {
        htmlContent = await fs.readFile(req.file.path, 'utf8');
        // Clean up uploaded file
        await fs.unlink(req.file.path);
      } catch (fileError) {
        return res.status(400).json({
          success: false,
          message: 'Failed to read uploaded HTML file',
          error: fileError.message
        });
      }
    } else if (req.body.htmlContent) {
      htmlContent = req.body.htmlContent;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either HTML file upload or HTML content is required'
      });
    }
    
    // Build subscriber query
    let subscriberQuery = {};
    if (selectedSubscribers !== 'all' && selectedSubscribers !== 'selected') {
      const subscriberIds = Array.isArray(selectedSubscribers) 
        ? selectedSubscribers 
        : selectedSubscribers.split(',').map(id => id.trim());
      
      subscriberQuery = {
        _id: { $in: subscriberIds },
        status: status
      };
    } else if (selectedSubscribers === 'selected') {
      // Handle "selected" case - parse the JSON string of IDs
      let subscriberIds = [];
      try {
        subscriberIds = selectedIds ? JSON.parse(selectedIds) : [];
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid selected IDs format'
        });
      }
      
      if (subscriberIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No subscriber IDs provided for selected option'
        });
      }
      
      subscriberQuery = {
        _id: { $in: subscriberIds },
        status: status
      };
    } else {
      subscriberQuery = { status };
    }
    
    // Get subscribers
    const subscribers = await Newsletter.find(subscriberQuery);
    
    if (subscribers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No subscribers found matching the criteria'
      });
    }
    
    // Send emails to all subscribers
    const results = [];
    const errors = [];
    
    for (const subscriber of subscribers) {
      try {
        const emailResult = await sendEmail({
          to: subscriber.email,
          subject: subject,
          html: htmlContent,
          text: htmlContent.replace(/<[^>]*>/g, '') // Basic HTML to text conversion
        });
        
        results.push({
          email: subscriber.email,
          success: true,
          messageId: emailResult.messageId
        });
        
        console.log(`Campaign email sent to ${subscriber.email}`);
        
      } catch (emailError) {
        errors.push({
          email: subscriber.email,
          error: emailError.message
        });
        console.error(`Failed to send campaign email to ${subscriber.email}:`, emailError);
      }
      
      // Small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    res.json({
      success: true,
      message: `Email campaign sent to ${results.length} subscribers`,
      data: {
        totalSubscribers: subscribers.length,
        successfulSends: results.length,
        failedSends: errors.length,
        results,
        errors
      }
    });
    
  } catch (error) {
    console.error('Email campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email campaign',
      error: error.message
    });
  }
});

// Get single newsletter by ID
router.get('/:id', async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    
    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter subscription not found'
      });
    }
    
    res.json({
      success: true,
      data: { newsletter }
    });
  } catch (error) {
    console.error('Get newsletter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch newsletter',
      error: error.message
    });
  }
});

// Add new newsletter subscription
router.post('/', async (req, res) => {
  try {
    const { email, name, source = 'website', tags = [], metadata = {} } = req.body;
    
    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email: email.toLowerCase().trim() });
    
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'Email is already subscribed'
      });
    }
    
    const newsletter = new Newsletter({
      email: email.toLowerCase().trim(),
      name: name?.trim() || '',
      source,
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      metadata: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referrer'),
        ...metadata
      }
    });
    
    await newsletter.save();
    
    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: { newsletter }
    });
  } catch (error) {
    console.error('Add newsletter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter',
      error: error.message
    });
  }
});

// Update newsletter subscription
router.put('/:id', async (req, res) => {
  try {
    const { email, name, status, tags } = req.body;
    
    const newsletter = await Newsletter.findById(req.params.id);
    
    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter subscription not found'
      });
    }
    
    // Update fields
    if (email) {
      // Check if new email already exists
      const existingSubscription = await Newsletter.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: req.params.id }
      });
      
      if (existingSubscription) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists in another subscription'
        });
      }
      
      newsletter.email = email.toLowerCase().trim();
    }
    
    if (name !== undefined) newsletter.name = name.trim();
    if (status) newsletter.status = status;
    if (tags) newsletter.tags = Array.isArray(tags) ? tags : [tags].filter(Boolean);
    
    // Update timestamps based on status
    if (status === 'unsubscribed' && newsletter.status !== 'unsubscribed') {
      newsletter.unsubscribedAt = new Date();
    }
    
    await newsletter.save();
    
    res.json({
      success: true,
      message: 'Newsletter subscription updated successfully',
      data: { newsletter }
    });
  } catch (error) {
    console.error('Update newsletter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update newsletter subscription',
      error: error.message
    });
  }
});

// Delete newsletter subscription
router.delete('/:id', async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    
    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter subscription not found'
      });
    }
    
    await Newsletter.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Newsletter subscription deleted successfully'
    });
  } catch (error) {
    console.error('Delete newsletter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete newsletter subscription',
      error: error.message
    });
  }
});

// Bulk operations
router.post('/bulk', async (req, res) => {
  try {
    const { action, emails, data } = req.body;
    
    if (!action || !emails || !Array.isArray(emails)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bulk operation parameters'
      });
    }
    
    let result;
    
    switch (action) {
      case 'subscribe':
        // Add multiple emails
        const newSubscriptions = emails.map(email => ({
          email: email.toLowerCase().trim(),
          name: data.name || '',
          source: data.source || 'admin',
          tags: data.tags || [],
          metadata: data.metadata || {}
        }));
        
        result = await Newsletter.insertMany(newSubscriptions, { ordered: false });
        break;
        
      case 'unsubscribe':
        // Unsubscribe multiple emails
        result = await Newsletter.updateMany(
          { email: { $in: emails.map(e => e.toLowerCase().trim()) } },
          { 
            status: 'unsubscribed',
            unsubscribedAt: new Date()
          }
        );
        break;
        
      case 'delete':
        // Delete multiple emails
        result = await Newsletter.deleteMany({
          email: { $in: emails.map(e => e.toLowerCase().trim()) }
        });
        break;
        
      case 'update':
        // Update multiple emails with same data
        result = await Newsletter.updateMany(
          { email: { $in: emails.map(e => e.toLowerCase().trim()) } },
          { $set: data }
        );
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid bulk action'
        });
    }
    
    res.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: { result }
    });
  } catch (error) {
    console.error('Bulk operation error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to perform bulk ${action}`,
      error: error.message
    });
  }
});

// Export newsletters (CSV)
router.get('/export', async (req, res) => {
  try {
    const { status, source, format = 'csv' } = req.query;
    
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (source && source !== 'all') query.source = source;
    
    const newsletters = await Newsletter.find(query).sort({ subscribedAt: -1 });
    
    if (format === 'csv') {
      // Convert to CSV
      const csv = [
        'Email,Name,Status,Source,Subscribed At,Unsubscribed At,Tags',
        ...newsletters.map(n => [
          n.email,
          `"${n.name}"`,
          n.status,
          n.source,
          n.subscribedAt.toISOString(),
          n.unsubscribedAt ? n.unsubscribedAt.toISOString() : '',
          `"${n.tags.join('; ')}"`
        ].join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="newsletter_export_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else {
      // JSON format
      res.json({
        success: true,
        data: { newsletters }
      });
    }
  } catch (error) {
    console.error('Export newsletters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export newsletters',
      error: error.message
    });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Newsletter.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          unsubscribed: { $sum: { $cond: [{ $eq: ['$status', 'unsubscribed'] }, 1, 0] } },
          bounced: { $sum: { $cond: [{ $eq: ['$status', 'bounced'] }, 1, 0] } }
        }
      },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          sources: { $push: { k: '$_id', v: '$count' } },
          total: { $first: '$total' },
          active: { $first: '$active' },
          unsubscribed: { $first: '$unsubscribed' },
          bounced: { $first: '$bounced' }
        }
      }
    ]);
    
    const recentSubscriptions = await Newsletter.find()
      .sort({ subscribedAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        stats: stats[0] || { total: 0, active: 0, unsubscribed: 0, bounced: 0, sources: [] },
        recentSubscriptions
      }
    });
  } catch (error) {
    console.error('Get newsletter stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch newsletter statistics',
      error: error.message
    });
  }
});

module.exports = router;
