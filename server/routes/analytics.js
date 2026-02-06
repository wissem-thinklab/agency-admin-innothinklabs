const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const Message = require('../models/Message');

// Get comprehensive analytics data
router.get('/overview', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Newsletter analytics
    const newsletterStats = {
      totalSubscribers: await Newsletter.countDocuments(),
      activeSubscribers: await Newsletter.countDocuments({ status: 'active' }),
      unsubscribedSubscribers: await Newsletter.countDocuments({ status: 'unsubscribed' }),
      bouncedSubscribers: await Newsletter.countDocuments({ status: 'bounced' }),
      newSubscribers: await Newsletter.countDocuments({ 
        subscribedAt: { $gte: startDate } 
      }),
      recentSubscribers: await Newsletter.find()
        .sort({ subscribedAt: -1 })
        .limit(5),
      subscribersBySource: await Newsletter.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      subscribersByStatus: await Newsletter.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      subscriptionTrend: await Newsletter.aggregate([
        {
          $match: { subscribedAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$subscribedAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    };

    // Message analytics
    const messageStats = {
      totalMessages: await Message.countDocuments(),
      unreadMessages: await Message.countDocuments({ status: 'unread' }),
      readMessages: await Message.countDocuments({ status: 'read' }),
      repliedMessages: await Message.countDocuments({ status: 'replied' }),
      archivedMessages: await Message.countDocuments({ status: 'archived' }),
      newMessages: await Message.countDocuments({ 
        submittedAt: { $gte: startDate } 
      }),
      recentMessages: await Message.find()
        .populate('assignedTo', 'name email')
        .sort({ submittedAt: -1 })
        .limit(5),
      messagesByPriority: await Message.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      messagesBySource: await Message.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      messagesByStatus: await Message.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      messageTrend: await Message.aggregate([
        {
          $match: { submittedAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    };

    // Calculate metrics
    const engagementRate = newsletterStats.totalSubscribers > 0 
      ? ((newsletterStats.activeSubscribers / newsletterStats.totalSubscribers) * 100).toFixed(1)
      : 0;

    const responseRate = messageStats.totalMessages > 0
      ? ((messageStats.repliedMessages / messageStats.totalMessages) * 100).toFixed(1)
      : 0;

    const analyticsData = {
      timeRange,
      newsletter: newsletterStats,
      messages: messageStats,
      metrics: {
        engagementRate: parseFloat(engagementRate),
        responseRate: parseFloat(responseRate),
        totalInteractions: newsletterStats.totalSubscribers + messageStats.totalMessages,
        growthRate: newsletterStats.newSubscribers > 0 ? 
          ((newsletterStats.newSubscribers / Math.max(newsletterStats.totalSubscribers - newsletterStats.newSubscribers, 1)) * 100).toFixed(1) : 0
      },
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics overview',
      error: error.message
    });
  }
});

// Get campaign analytics (placeholder for future implementation)
router.get('/campaigns', async (req, res) => {
  try {
    // This would be expanded when campaign tracking is implemented
    const campaignAnalytics = {
      totalCampaigns: 0,
      totalSent: 0,
      totalOpens: 0,
      totalClicks: 0,
      averageOpenRate: 0,
      averageClickRate: 0,
      recentCampaigns: [],
      performanceTrend: []
    };

    res.json({
      success: true,
      data: campaignAnalytics
    });

  } catch (error) {
    console.error('Campaign analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign analytics',
      error: error.message
    });
  }
});

// Get user activity analytics
router.get('/activity', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // User activity metrics
    const activityData = {
      newsletterSignups: await Newsletter.countDocuments({ 
        subscribedAt: { $gte: startDate } 
      }),
      messageSubmissions: await Message.countDocuments({ 
        submittedAt: { $gte: startDate } 
      }),
      dailyActivity: await Promise.all([
        // Newsletter signups by day
        Newsletter.aggregate([
          {
            $match: { subscribedAt: { $gte: startDate } }
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$subscribedAt" } },
              signups: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),
        // Message submissions by day
        Message.aggregate([
          {
            $match: { submittedAt: { $gte: startDate } }
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
              submissions: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ])
      ]),
      topSources: await Newsletter.aggregate([
        { $match: { subscribedAt: { $gte: startDate } } },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    };

    res.json({
      success: true,
      data: activityData
    });

  } catch (error) {
    console.error('Activity analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity analytics',
      error: error.message
    });
  }
});

module.exports = router;
