import React, { useState } from 'react';
import { messageAPI } from '../services/api';
import { useMessages, useMessageStats } from '../hooks/useMessages';
import './Messages.css';

const Messages = () => {
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingMessage, setReplyingMessage] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [formData, setFormData] = useState({
    status: 'unread',
    priority: 'medium',
    assignedTo: ''
  });
  const [replyData, setReplyData] = useState({
    content: ''
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    priority: 'all',
    source: 'all',
    search: ''
  });

  // Custom hooks
  const { messages, pagination, isLoading, error, refetch } = useMessages(filters);
  const { stats, isLoading: statsLoading } = useMessageStats();

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleReplyChange = (e) => {
    const { name, value } = e.target;
    setReplyData(prev => ({
      ...prev,
      [name]: value
    }));
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
      await messageAPI.updateMessage(editingMessage._id, formData);
      refetch();
      setShowModal(false);
      setEditingMessage(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      await messageAPI.updateMessage(replyingMessage._id, {
        reply: replyData
      });
      refetch();
      setShowReplyModal(false);
      setReplyingMessage(null);
      setReplyData({ content: '' });
    } catch (error) {
      console.error('Failed to reply to message:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      status: 'unread',
      priority: 'medium',
      assignedTo: ''
    });
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setFormData({
      status: message.status,
      priority: message.priority,
      assignedTo: message.assignedTo?._id || ''
    });
    setShowModal(true);
  };

  const handleReplyClick = (message) => {
    setReplyingMessage(message);
    setReplyData({ content: '' });
    setShowReplyModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await messageAPI.deleteMessage(id);
        refetch();
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedMessages(messages.map(m => m._id));
    } else {
      setSelectedMessages([]);
    }
  };

  const handleSelectMessage = (id) => {
    setSelectedMessages(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleBulkOperation = async (action) => {
    try {
      await messageAPI.bulkOperation(action, selectedMessages);
      refetch();
      setSelectedMessages([]);
      setShowBulkModal(false);
    } catch (error) {
      console.error('Failed to perform bulk operation:', error);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      await messageAPI.exportMessages({ 
        ...filters,
        format 
      });
    } catch (error) {
      console.error('Failed to export messages:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'status-unread';
      case 'read': return 'status-read';
      case 'replied': return 'status-replied';
      case 'archived': return 'status-archived';
      default: return '';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      default: return '';
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'contact': return 'source-contact';
      case 'quote': return 'source-quote';
      case 'support': return 'source-support';
      case 'general': return 'source-general';
      default: return '';
    }
  };

  const truncateText = (text, maxLength = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (isLoading) {
    return <div className="loading">Loading messages...</div>;
  }

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h2>Messages Management</h2>
        <div className="header-actions">
          <button 
            className="btn btn-success"
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowBulkModal(true)}
            disabled={selectedMessages.length === 0}
          >
            Bulk Actions ({selectedMessages.length})
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Messages</h3>
          <span className="stat-number">{stats?.stats?.total || 0}</span>
        </div>
        <div className="stat-card">
          <h3>Unread</h3>
          <span className="stat-number unread">{stats?.stats?.unread || 0}</span>
        </div>
        <div className="stat-card">
          <h3>Read</h3>
          <span className="stat-number read">{stats?.stats?.read || 0}</span>
        </div>
        <div className="stat-card">
          <h3>Replied</h3>
          <span className="stat-number replied">{stats?.stats?.replied || 0}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="messages-filters">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by name, email, subject..."
          />
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Priority</label>
          <select name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Source</label>
          <select name="source" value={filters.source} onChange={handleFilterChange}>
            <option value="all">All Sources</option>
            <option value="contact">Contact Form</option>
            <option value="quote">Quote Request</option>
            <option value="support">Support</option>
            <option value="general">General</option>
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

      {/* Messages Table */}
      <div className="messages-table">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedMessages.length === messages.length && messages.length > 0}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Source</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(message => (
              <tr key={message._id} className={message.status}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedMessages.includes(message._id)}
                    onChange={() => handleSelectMessage(message._id)}
                  />
                </td>
                <td>
                  <div className="message-name">
                    <strong>{message.name}</strong>
                    {message.company && <small>{message.company}</small>}
                  </div>
                </td>
                <td>
                  <div className="message-email">
                    {message.email}
                  </div>
                </td>
                <td>{message.phone || '-'}</td>
                <td>
                  <div className="message-subject">
                    {truncateText(message.subject)}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(message.status)}`}>
                    {message.status}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge ${getPriorityColor(message.priority)}`}>
                    {message.priority}
                  </span>
                </td>
                <td>
                  <span className={`source-badge ${getSourceColor(message.source)}`}>
                    {message.source}
                  </span>
                </td>
                <td>
                  <div className="message-date">
                    {new Date(message.submittedAt || message.createdAt).toLocaleDateString()}
                    <small>{new Date(message.submittedAt || message.createdAt).toLocaleTimeString()}</small>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleEdit(message)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleReplyClick(message)}
                    >
                      Reply
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(message._id)}
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
          Showing {messages.length} of {pagination.total} messages
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

      {/* Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Edit Message</h3>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingMessage(null);
                    resetForm();
                  }}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select name="priority" value={formData.priority} onChange={handleChange}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Assigned To</label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    placeholder="User ID or leave empty"
                  />
                </div>
              </form>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingMessage(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && replyingMessage && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Reply to Message</h3>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyingMessage(null);
                    setReplyData({ content: '' });
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="reply-details">
                <div className="original-message">
                  <h4>Original Message</h4>
                  <p><strong>From:</strong> {replyingMessage.name} ({replyingMessage.email})</p>
                  <p><strong>Subject:</strong> {replyingMessage.subject}</p>
                  <p><strong>Date:</strong> {new Date(replyingMessage.submittedAt || replyingMessage.createdAt).toLocaleString()}</p>
                  <div className="message-content">
                    {replyingMessage.message}
                  </div>
                </div>
              </div>

              <form onSubmit={handleReply} className="modal-body">
                <div className="form-group">
                  <label>Reply</label>
                  <textarea
                    name="content"
                    value={replyData.content}
                    onChange={handleReplyChange}
                    rows="6"
                    placeholder="Type your reply here..."
                    required
                  />
                </div>
              </form>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyingMessage(null);
                    setReplyData({ content: '' });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" onClick={handleReply}>
                  Send Reply
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
                <h3>Bulk Actions ({selectedMessages.length} selected)</h3>
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
                    className="btn btn-info"
                    onClick={() => handleBulkOperation('markRead')}
                  >
                    Mark as Read
                  </button>
                  <button 
                    className="btn btn-warning"
                    onClick={() => handleBulkOperation('markUnread')}
                  >
                    Mark as Unread
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={() => handleBulkOperation('archive')}
                  >
                    Archive Selected
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleBulkOperation('delete')}
                  >
                    Delete Selected
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
    </div>
  );
};

export default Messages;
