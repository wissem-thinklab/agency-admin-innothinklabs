import React, { useState, useEffect } from 'react';
import { newsletterAPI } from '../services/api';
import { messageAPI } from '../services/api';
import './Analytics.css';

const Analytics = () => {
  const [newsletterStats, setNewsletterStats] = useState(null);
  const [messageStats, setMessageStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllStats();
  }, [timeRange]);

  const fetchAllStats = async () => {
    setIsLoading(true);
    try {
      const [newsletterData, messageData] = await Promise.all([
        newsletterAPI.getStats(),
        messageAPI.getStats()
      ]);
      
      console.log('Newsletter Data:', newsletterData);
      console.log('Message Data:', messageData);
      
      setNewsletterStats(newsletterData.data);
      setMessageStats(messageData.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateGrowthRate = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getEngagementRate = (delivered, opened) => {
    if (!delivered || delivered === 0) return 0;
    return ((opened / delivered) * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="analytics-container">
        <div className="analytics-loading">
          <div className="loading-icon">📊</div>
          <div className="loading-text">Loading analytics data...</div>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  console.log('Newsletter Stats State:', newsletterStats);
  console.log('Message Stats State:', messageStats);

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📈 Analytics Dashboard</h1>
        <div className="analytics-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-selector"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button onClick={fetchAllStats} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="analytics-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'newsletter' ? 'active' : ''}`}
          onClick={() => setActiveTab('newsletter')}
        >
          Newsletter
        </button>
        <button 
          className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages
        </button>
        <button 
          className={`tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
          onClick={() => setActiveTab('campaigns')}
        >
          Campaigns
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="analytics-overview">
          <div className="overview-cards">
            <div className="overview-card newsletter">
              <div className="card-icon">📧</div>
              <div className="card-content">
                <h3>Newsletter Subscribers</h3>
                <div className="card-number">{newsletterStats?.totalSubscribers || newsletterStats?.total || 0}</div>
                <div className="card-subtitle">
                  {newsletterStats?.activeSubscribers || newsletterStats?.active || 0} active
                </div>
              </div>
            </div>

            <div className="overview-card messages">
              <div className="card-icon">💬</div>
              <div className="card-content">
                <h3>Total Messages</h3>
                <div className="card-number">{messageStats?.totalMessages || messageStats?.total || 0}</div>
                <div className="card-subtitle">
                  {messageStats?.unreadMessages || messageStats?.unread || 0} unread
                </div>
              </div>
            </div>

            <div className="overview-card engagement">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <h3>Engagement Rate</h3>
                <div className="card-number">
                  {getEngagementRate(
                    newsletterStats?.totalSubscribers || newsletterStats?.total || 0,
                    newsletterStats?.activeSubscribers || newsletterStats?.active || 0
                  )}%
                </div>
                <div className="card-subtitle">
                  Active subscribers
                </div>
              </div>
            </div>

            <div className="overview-card response">
              <div className="card-icon">⚡</div>
              <div className="card-content">
                <h3>Response Rate</h3>
                <div className="card-number">
                  {messageStats?.totalMessages > 0 
                    ? ((messageStats?.repliedMessages || messageStats?.replied || 0) / (messageStats?.totalMessages || messageStats?.total || 0) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="card-subtitle">
                  {messageStats?.repliedMessages || messageStats?.replied || 0} replied
                </div>
              </div>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-container">
              <h3>Subscriber Growth</h3>
              <div className="placeholder-chart">
                📈 Chart showing subscriber growth over time
              </div>
            </div>
            <div className="chart-container">
              <h3>Message Activity</h3>
              <div className="placeholder-chart">
                📊 Chart showing message trends
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'newsletter' && (
        <div className="newsletter-analytics">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Subscribers</h3>
              <span className="stat-number">{newsletterStats?.totalSubscribers || newsletterStats?.total || 0}</span>
            </div>
            <div className="stat-card">
              <h3>Active</h3>
              <span className="stat-number active">{newsletterStats?.activeSubscribers || newsletterStats?.active || 0}</span>
            </div>
            <div className="stat-card">
              <h3>Unsubscribed</h3>
              <span className="stat-number unsubscribed">{newsletterStats?.unsubscribedSubscribers || newsletterStats?.unsubscribed || 0}</span>
            </div>
            <div className="stat-card">
              <h3>Bounced</h3>
              <span className="stat-number bounced">{newsletterStats?.bouncedSubscribers || newsletterStats?.bounced || 0}</span>
            </div>
          </div>

          <div className="analytics-details">
            <h3>Recent Subscribers</h3>
            <div className="recent-list">
              {newsletterStats?.recentSubscribers?.slice(0, 5).map((subscriber, index) => (
                <div key={index} className="recent-item">
                  <span className="recent-email">{subscriber.email}</span>
                  <span className="recent-date">
                    {new Date(subscriber.subscribedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="messages-analytics">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Messages</h3>
              <span className="stat-number">{messageStats?.totalMessages || messageStats?.total || 0}</span>
            </div>
            <div className="stat-card">
              <h3>Unread</h3>
              <span className="stat-number unread">{messageStats?.unreadMessages || messageStats?.unread || 0}</span>
            </div>
            <div className="stat-card">
              <h3>Read</h3>
              <span className="stat-number read">{messageStats?.readMessages || messageStats?.read || 0}</span>
            </div>
            <div className="stat-card">
              <h3>Replied</h3>
              <span className="stat-number replied">{messageStats?.repliedMessages || messageStats?.replied || 0}</span>
            </div>
          </div>

          <div className="analytics-details">
            <h3>Recent Messages</h3>
            <div className="recent-list">
              {messageStats?.recentMessages?.slice(0, 5).map((message, index) => (
                <div key={index} className="recent-item">
                  <span className="recent-name">{message.name}</span>
                  <span className="recent-subject">{message.subject}</span>
                  <span className="recent-date">
                    {new Date(message.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="campaigns-analytics">
          <div className="campaign-placeholder">
            <h3>📧 Email Campaign Analytics</h3>
            <p>Campaign performance metrics will appear here once you start sending campaigns.</p>
            <div className="campaign-metrics">
              <div className="metric-item">
                <span className="metric-label">Total Campaigns</span>
                <span className="metric-value">0</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Total Sent</span>
                <span className="metric-value">0</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Open Rate</span>
                <span className="metric-value">0%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Click Rate</span>
                <span className="metric-value">0%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
