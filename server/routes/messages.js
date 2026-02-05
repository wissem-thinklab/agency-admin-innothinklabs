const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const mongoose = require('mongoose');
const { sendReplyEmail, sendAdminNotification, verifyEmailConfig } = require('../services/emailService');

// Verify email configuration on startup
verifyEmailConfig();

// Get all messages with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, source, search } = req.query;
    
    // Build query
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    if (source && source !== 'all') {
      query.source = source;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    const messages = await Message.find(query)
      .populate('assignedTo', 'name email')
      .populate('reply.repliedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Message.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Get single message by ID
router.get('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('reply.repliedBy', 'name email');
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      data: { message }
    });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message',
      error: error.message
    });
  }
});

// Create new message (from website contact form)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, subject, message, source = 'contact', metadata = {}, submittedAt } = req.body;
    
    const newMessage = new Message({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      company: company?.trim() || '',
      subject: subject.trim(),
      message: message.trim(),
      source,
      submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
      metadata: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referrer'),
        country: metadata.country,
        city: metadata.city,
        ...metadata
      }
    });
    
    await newMessage.save();
    
    // Send notification email to admin
    try {
      await sendAdminNotification(newMessage.toObject());
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: newMessage }
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Update message status and assign to user
router.put('/:id', async (req, res) => {
  try {
    const { status, priority, assignedTo, reply } = req.body;
    
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Update fields
    if (status) message.status = status;
    if (priority) message.priority = priority;
    if (assignedTo) message.assignedTo = assignedTo;
    
    // Handle reply
    if (reply && reply.content) {
      message.reply = {
        content: reply.content,
        repliedBy: reply.repliedBy || req.user?.id,
        repliedAt: new Date()
      };
      message.status = 'replied';
      
      // Send reply email to customer
      try {
        await sendReplyEmail(
          message.email,
          message.name,
          reply.content,
          message.subject
        );
        console.log(`Reply email sent to ${message.email}`);
      } catch (emailError) {
        console.error('Failed to send reply email:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    await message.save();
    
    // Populate updated data
    await message.populate('assignedTo', 'name email');
    await message.populate('reply.repliedBy', 'name email');
    
    res.json({
      success: true,
      message: 'Message updated successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message',
      error: error.message
    });
  }
});

// Delete message
router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    await Message.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
});

// Bulk operations
router.post('/bulk', async (req, res) => {
  try {
    const { action, messageIds, data } = req.body;
    
    if (!action || !messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bulk operation parameters'
      });
    }
    
    let result;
    
    switch (action) {
      case 'markRead':
        result = await Message.updateMany(
          { _id: { $in: messageIds } },
          { status: 'read' }
        );
        break;
        
      case 'markUnread':
        result = await Message.updateMany(
          { _id: { $in: messageIds } },
          { status: 'unread' }
        );
        break;
        
      case 'archive':
        result = await Message.updateMany(
          { _id: { $in: messageIds } },
          { status: 'archived' }
        );
        break;
        
      case 'assign':
        result = await Message.updateMany(
          { _id: { $in: messageIds } },
          { assignedTo: data.assignedTo }
        );
        break;
        
      case 'delete':
        result = await Message.deleteMany({
          _id: { $in: messageIds }
        });
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

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Message.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
          replied: { $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] } },
          archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
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
          priorities: { $push: { k: '$_id', v: '$count' } },
          sources: { $push: { k: '$_id', v: '$count' } },
          total: { $first: '$total' },
          unread: { $first: '$unread' },
          read: { $first: '$read' },
          replied: { $first: '$replied' },
          archived: { $first: '$archived' }
        }
      }
    ]);
    
    const recentMessages = await Message.find()
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        stats: stats[0] || { 
          total: 0, 
          unread: 0, 
          read: 0, 
          replied: 0, 
          archived: 0,
          priorities: [],
          sources: []
        },
        recentMessages
      }
    });
  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message statistics',
      error: error.message
    });
  }
});

// Export messages (CSV)
router.get('/export', async (req, res) => {
  try {
    const { status, priority, source, format = 'csv' } = req.query;
    
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (source && source !== 'all') query.source = source;
    
    const messages = await Message.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    if (format === 'csv') {
      // Convert to CSV
      const csv = [
        'Name,Email,Phone,Company,Subject,Status,Priority,Source,Created At,Assigned To,Reply',
        ...messages.map(m => [
          `"${m.name}"`,
          m.email,
          `"${m.phone || ''}"`,
          `"${m.company || ''}"`,
          `"${m.subject}"`,
          m.status,
          m.priority,
          m.source,
          m.createdAt.toISOString(),
          m.assignedTo ? m.assignedTo.name : '',
          `"${m.reply ? m.reply.content.replace(/"/g, '""') : ''}"`
        ].join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="messages_export_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else {
      // JSON format
      res.json({
        success: true,
        data: { messages }
      });
    }
  } catch (error) {
    console.error('Export messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export messages',
      error: error.message
    });
  }
});

module.exports = router;
