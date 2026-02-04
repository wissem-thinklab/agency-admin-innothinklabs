import React, { useState, useEffect } from 'react';
import { serviceAPI } from '../services/api';
import { useServices, useGlobalMutate } from '../hooks/useSWR';
import './Services.css';

const Services = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    active: true
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // SWR hooks
  const { services, pagination: swrPagination, isLoading, error, mutate: mutateServices } = useServices({ ...pagination });
  const globalMutate = useGlobalMutate();

  // Update pagination state when SWR pagination changes
  useEffect(() => {
    if (swrPagination) {
      setPagination(swrPagination);
    }
  }, [swrPagination]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit,
      page: 1 // Reset to first page when limit changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await serviceAPI.updateService(editingService._id, formData);
      } else {
        await serviceAPI.createService(formData);
      }
      
      // Revalidate SWR data
      mutateServices();
      
      setShowModal(false);
      setEditingService(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save service:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      active: true
    });
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      slug: service.slug || '',
      description: service.description || '',
      icon: service.icon || '',
      active: service.active !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await serviceAPI.deleteService(id);
        // Revalidate SWR data
        mutateServices();
      } catch (error) {
        console.error('Failed to delete service:', error);
      }
    }
  };

  const toggleActive = async (id) => {
    try {
      const service = services.find(s => s._id === id);
      await serviceAPI.updateService(id, { active: !service.active });
      // Revalidate SWR data
      mutateServices();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading services...</div>;
  }

  return (
    <div className="services-container">
      <div className="services-header">
        <h2>Service Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add New Service
        </button>
      </div>

      {/* Simple pagination */}
      <div className="services-filters">
        <div className="filter-group">
          <label>Items per page</label>
          <select value={pagination.limit} onChange={handleLimitChange}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Services Table */}
      <div className="services-table">
        <table>
          <thead>
            <tr>
              <th>Icon</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service._id}>
                <td>
                  {service.icon ? (
                    <span className="service-icon">{service.icon}</span>
                  ) : (
                    <div className="no-icon-placeholder">⚙️</div>
                  )}
                </td>
                <td>
                  <div className="service-name">
                    <strong>{service.name}</strong>
                  </div>
                </td>
                <td>
                  <code className="service-slug">{service.slug}</code>
                </td>
                <td>
                  <div className="service-description">
                    {service.description ? (
                      service.description.length > 50 
                        ? `${service.description.substring(0, 50)}...`
                        : service.description
                    ) : (
                      <span className="no-description">No description</span>
                    )}
                  </div>
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${service.active ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => toggleActive(service._id)}
                  >
                    {service.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>
                  {new Date(service.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleEdit(service)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(service._id)}
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
          Showing {services.length} of {pagination.total} services
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingService(null);
                    resetForm();
                  }}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Icon (emoji or text)</label>
                    <input
                      type="text"
                      name="icon"
                      value={formData.icon}
                      onChange={handleChange}
                      placeholder="🛠️ or fa-code"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="Auto-generated from name"
                  />
                  <small>Leave empty to auto-generate from name</small>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Brief description of the service"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                    />
                    Active
                  </label>
                  <small>Inactive services won't appear in project selection</small>
                </div>
              </form>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingService(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
