import React, { useState } from 'react';
import { newsletterAPI } from '../services/api';
import { useNewsletters, useNewsletterStats } from '../hooks/useNewsletter';
import './Newsletter.css';

const Newsletter = () => {
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState(null);
  const [selectedNewsletters, setSelectedNewsletters] = useState([]);
  const [campaignData, setCampaignData] = useState({
    subject: '',
    htmlContent: '',
    selectedSubscribers: 'all',
    status: 'active'
  });
  const [campaignResults, setCampaignResults] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    status: 'active',
    source: 'admin',
    tags: []
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    source: 'all',
    search: ''
  });

  // Custom hooks
  const { newsletters, pagination, isLoading, error, refetch } = useNewsletters(filters);
  const { stats, isLoading: statsLoading } = useNewsletterStats();

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagsChange = (e) => {
    const tags = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filter changes
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setFilters(prev => ({ 
      ...prev, 
      limit: newLimit,
      page: 1 // Reset to first page when limit changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNewsletter) {
        await newsletterAPI.updateNewsletter(editingNewsletter._id, formData);
      } else {
        await newsletterAPI.createNewsletter(formData);
      }
      
      refetch();
      setShowModal(false);
      setEditingNewsletter(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save newsletter:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      status: 'active',
      source: 'admin',
      tags: []
    });
  };

  const handleCampaignChange = (e) => {
    const { name, value, files } = e.target;
    setCampaignData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    try {
      // Include selected IDs if "selected" option is chosen
      const campaignPayload = { ...campaignData };
      if (campaignData.selectedSubscribers === 'selected') {
        campaignPayload.selectedIds = selectedNewsletters;
      }
      
      const result = await newsletterAPI.sendCampaign(campaignPayload);
      setCampaignResults(result.data);
      refetch();
      setShowCampaignModal(false);
      resetCampaignForm();
    } catch (error) {
      console.error('Failed to send campaign:', error);
    }
  };

  const resetCampaignForm = () => {
    setCampaignData({
      subject: '',
      htmlContent: '',
      selectedSubscribers: 'all',
      status: 'active'
    });
    setCampaignResults(null);
  };

  const handleEdit = (newsletter) => {
    setEditingNewsletter(newsletter);
    setFormData({
      email: newsletter.email,
      name: newsletter.name || '',
      status: newsletter.status,
      source: newsletter.source,
      tags: newsletter.tags || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await newsletterAPI.deleteNewsletter(id);
        refetch();
      } catch (error) {
        console.error('Failed to delete newsletter:', error);
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedNewsletters(newsletters.map(n => n._id));
    } else {
      setSelectedNewsletters([]);
    }
  };

  const handleSelectNewsletter = (id) => {
    setSelectedNewsletters(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleBulkOperation = async (action) => {
    const selectedEmails = newsletters
      .filter(n => selectedNewsletters.includes(n._id))
      .map(n => n.email);

    if (selectedEmails.length === 0) {
      alert('Please select at least one newsletter subscription');
      return;
    }

    try {
      await newsletterAPI.bulkOperation(action, selectedEmails);
      refetch();
      setSelectedNewsletters([]);
      setShowBulkModal(false);
    } catch (error) {
      console.error('Failed to perform bulk operation:', error);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      await newsletterAPI.exportNewsletters({ 
        ...filters,
        format 
      });
    } catch (error) {
      console.error('Failed to export newsletters:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'unsubscribed': return 'status-unsubscribed';
      case 'bounced': return 'status-bounced';
      default: return '';
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'website': return 'source-website';
      case 'admin': return 'source-admin';
      case 'import': return 'source-import';
      default: return '';
    }
  };

  if (isLoading) {
    return <div className="loading">Loading newsletters...</div>;
  }

  return (
    <div className="newsletter-container">
      <div className="newsletter-header">
        <h2>Newsletter Management</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            Add Email
          </button>
          <button 
            className="btn btn-success"
            onClick={() => setShowCampaignModal(true)}
          >
            Send Campaign
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowBulkModal(true)}
            disabled={selectedNewsletters.length === 0}
          >
            Bulk Actions ({selectedNewsletters.length})
          </button>
          <button 
            className="btn btn-success"
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Subscribers</h3>
          <span className="stat-number">{stats?.stats?.total || 0}</span>
        </div>
        <div className="stat-card">
          <h3>Active</h3>
          <span className="stat-number active">{stats?.stats?.active || 0}</span>
        </div>
        <div className="stat-card">
          <h3>Unsubscribed</h3>
          <span className="stat-number unsubscribed">{stats?.stats?.unsubscribed || 0}</span>
        </div>
        <div className="stat-card">
          <h3>Bounced</h3>
          <span className="stat-number bounced">{stats?.stats?.bounced || 0}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="newsletter-filters">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by email or name..."
          />
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="bounced">Bounced</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Source</label>
          <select name="source" value={filters.source} onChange={handleFilterChange}>
            <option value="all">All Sources</option>
            <option value="website">Website</option>
            <option value="admin">Admin</option>
            <option value="import">Import</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Items per page</label>
          <select value={filters.limit} onChange={handleLimitChange}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Newsletter Table */}
      <div className="newsletter-table">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedNewsletters.length === newsletters.length && newsletters.length > 0}
                />
              </th>
              <th>Email</th>
              <th>Name</th>
              <th>Status</th>
              <th>Source</th>
              <th>Subscribed Date</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {newsletters.map(newsletter => (
              <tr key={newsletter._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedNewsletters.includes(newsletter._id)}
                    onChange={() => handleSelectNewsletter(newsletter._id)}
                  />
                </td>
                <td>
                  <div className="email-cell">
                    <strong>{newsletter.email}</strong>
                  </div>
                </td>
                <td>{newsletter.name || '-'}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(newsletter.status)}`}>
                    {newsletter.status}
                  </span>
                </td>
                <td>
                  <span className={`source-badge ${getSourceColor(newsletter.source)}`}>
                    {newsletter.source}
                  </span>
                </td>
                <td>
                  {new Date(newsletter.subscribedAt).toLocaleDateString()}
                </td>
                <td>
                  <div className="tags-container">
                    {newsletter.tags && newsletter.tags.length > 0 ? (
                      newsletter.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="no-tags">-</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleEdit(newsletter)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(newsletter._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-info">
          Showing {newsletters.length} of {pagination.total} subscribers
        </div>
        <div className="pagination-controls">
          <button
            className="btn btn-secondary"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </button>
          
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`btn ${page === pagination.page ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          
          <button
            className="btn btn-secondary"
            disabled={pagination.page === pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingNewsletter ? 'Edit Subscription' : 'Add New Subscription'}</h3>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingNewsletter(null);
                    resetForm();
                  }}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Subscriber name (optional)"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="unsubscribed">Unsubscribed</option>
                      <option value="bounced">Bounced</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Source</label>
                    <select name="source" value={formData.source} onChange={handleChange}>
                      <option value="admin">Admin</option>
                      <option value="website">Website</option>
                      <option value="import">Import</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, tags }));
                    }}
                    placeholder="e.g., premium, newsletter, updates"
                  />
                </div>
              </form>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingNewsletter(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                  {editingNewsletter ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Bulk Actions ({selectedNewsletters.length} selected)</h3>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowBulkModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="bulk-actions">
                  <button 
                    className="btn btn-warning"
                    onClick={() => handleBulkOperation('unsubscribe')}
                  >
                    Unsubscribe Selected
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleBulkOperation('delete')}
                  >
                    Delete Selected
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={() => handleBulkOperation('update')}
                  >
                    Update Selected
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowBulkModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Campaign Modal */}
      {showCampaignModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Send Email Campaign</h3>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCampaignModal(false);
                    resetCampaignForm();
                  }}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleCampaignSubmit} className="modal-body">
                <div className="form-group">
                  <label>Campaign Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={campaignData.subject}
                    onChange={handleCampaignChange}
                    placeholder="Enter campaign subject..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>HTML File (Optional)</label>
                  <input
                    type="file"
                    name="htmlFile"
                    onChange={handleCampaignChange}
                    accept=".html"
                    className="file-input"
                  />
                  <small>Upload an HTML file or paste content below</small>
                </div>

                <div className="form-group">
                  <label>HTML Content</label>
                  <textarea
                    name="htmlContent"
                    value={campaignData.htmlContent}
                    onChange={handleCampaignChange}
                    rows="10"
                    placeholder="Or paste your HTML content here..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Send To</label>
                    <select name="selectedSubscribers" value={campaignData.selectedSubscribers} onChange={handleCampaignChange}>
                      <option value="all">All Active Subscribers</option>
                      <option value="selected">Selected Subscribers ({selectedNewsletters.length})</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Subscriber Status</label>
                    <select name="status" value={campaignData.status} onChange={handleCampaignChange}>
                      <option value="active">Active Only</option>
                      <option value="all">All Status</option>
                    </select>
                  </div>
                </div>
              </form>

              {/* Campaign Results */}
              {campaignResults && (
                <div className="campaign-results">
                  <h4>Campaign Results</h4>
                  <div className="results-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Subscribers:</span>
                      <span className="stat-value">{campaignResults.totalSubscribers}</span>
                    </div>
                    <div className="stat-item success">
                      <span className="stat-label">Successful Sends:</span>
                      <span className="stat-value">{campaignResults.successfulSends}</span>
                    </div>
                    <div className="stat-item error">
                      <span className="stat-label">Failed Sends:</span>
                      <span className="stat-value">{campaignResults.failedSends}</span>
                    </div>
                  </div>
                  
                  {campaignResults.errors && campaignResults.errors.length > 0 && (
                    <div className="errors-list">
                      <h5>Failed Emails:</h5>
                      {campaignResults.errors.map((error, index) => (
                        <div key={index} className="error-item">
                          <strong>{error.email}:</strong> {error.error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCampaignModal(false);
                    resetCampaignForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" onClick={handleCampaignSubmit}>
                  Send Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Newsletter;
