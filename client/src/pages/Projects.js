import React, { useState, useEffect } from 'react';
import { projectAPI, serviceAPI, getImageUrl } from '../services/api';
import { useProjects, useActiveServices, useGlobalMutate } from '../hooks/useSWR';
import ImageSelector from '../components/ImageSelector';
import HTMLEditor from '../components/HTMLEditor';
import './Projects.css';

const Projects = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    coverImage: '',
    logo: '',
    description: '',
    clientName: '',
    services: [],
    completedDate: '',
    location: '',
    content: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({});

  // SWR hooks
  const { projects, pagination: swrPagination, isLoading, error, mutate: mutateProjects } = useProjects({ ...pagination, ...filters });
  const { services, mutate: mutateServices } = useActiveServices();
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

  const handleServicesChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      services: selectedOptions
    }));
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({
      ...prev,
      content: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filter changes
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
      if (editingProject) {
        await projectAPI.updateProject(editingProject._id, formData);
      } else {
        await projectAPI.createProject(formData);
      }

      // Revalidate SWR data
      mutateProjects();

      setShowModal(false);
      setEditingProject(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      coverImage: '',
      logo: '',
      description: '',
      clientName: '',
      services: [],
      completedDate: '',
      location: '',
      content: ''
    });
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      slug: project.slug || '',
      coverImage: project.coverImage || '',
      logo: project.logo || '',
      description: project.description || '',
      clientName: project.clientName || '',
      services: project.services.map(service => service._id || service),
      completedDate: project.completedDate ? new Date(project.completedDate).toISOString().split('T')[0] : '',
      location: project.location || '',
      content: project.content || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.deleteProject(id);
        // Revalidate SWR data
        mutateProjects();
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const toggleFeatured = async (id) => {
    // This function is no longer needed since we don't have featured field
    console.log('Featured toggle removed');
  };

  if (isLoading) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h2>Project Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add New Project
        </button>
      </div>

      {/* Filters - Simplified */}
      <div className="projects-filters">
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

      {/* Projects Table */}
      <div className="projects-table">
        <table>
          <thead>
            <tr>
              <th>Cover</th>
              <th>Logo</th>
              <th>Title</th>
              <th>Client</th>
              <th>Location</th>
              <th>Completed Date</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project._id}>
                <td>
                  {project.coverImage ? (
                    <img
                      src={getImageUrl(project.coverImage)}
                      alt={project.title}
                      className="table-cover-image"
                    />
                  ) : (
                    <div className="no-image-placeholder">📷</div>
                  )}
                </td>
                <td>
                  {project.logo ? (
                    <img
                      src={getImageUrl(project.logo)}
                      alt={`${project.clientName} logo`}
                      className="table-logo-image"
                    />
                  ) : (
                    <div className="no-logo-placeholder">🏢</div>
                  )}
                </td>
                <td>
                  <div className="project-title">
                    <strong>{project.title}</strong>
                    <small>{project.slug}</small>
                  </div>
                </td>
                <td>{project.clientName}</td>
                <td>{project.location}</td>
                <td>
                  {project.completedDate ? new Date(project.completedDate).toLocaleDateString() : 'N/A'}
                </td>
                <td>
                  {new Date(project.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleEdit(project)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(project._id)}
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
          Showing {projects.length} of {pagination.total} projects
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
                <h3>{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                    resetForm();
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Client Name</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Cover Image</label>
                    <ImageSelector
                      value={formData.coverImage}
                      onChange={(value) => setFormData(prev => ({ ...prev, coverImage: value }))}
                      placeholder="Select cover image"
                    />
                  </div>
                  <div className="form-group">
                    <label>Logo</label>
                    <ImageSelector
                      value={formData.logo}
                      onChange={(value) => setFormData(prev => ({ ...prev, logo: value }))}
                      placeholder="Select client logo"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Completed Date</label>
                    <input
                      type="date"
                      name="completedDate"
                      value={formData.completedDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Services</label>
                  <select
                    name="services"
                    value={formData.services}
                    onChange={handleServicesChange}
                    multiple
                    className="tags-select"
                  >
                    {services.map(service => (
                      <option key={service._id} value={service._id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  <small>Hold Ctrl/Cmd to select multiple services</small>
                </div>

                <div className="form-group">
                  <label>Content</label>
                  <HTMLEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Enter project content here..."
                  />
                </div>
              </form>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
