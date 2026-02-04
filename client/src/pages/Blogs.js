import React, { useState, useEffect } from 'react';
import { blogAPI, categoryAPI, tagAPI, getImageUrl } from '../services/api';
import { useBlogs, useCategories, useTags, useGlobalMutate } from '../hooks/useSWR';
import ImageSelector from '../components/ImageSelector';
import './Blogs.css';

const Blogs = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '',
    published: false,
    category: '',
    tags: [],
    status: 'draft'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });

  // SWR hooks
  const { blogs, pagination: swrPagination, isLoading, error, mutate: mutateBlogs } = useBlogs({ ...pagination, ...filters });
  const { categories, mutate: mutateCategories } = useCategories();
  const { tags, mutate: mutateTags } = useTags();
  const globalMutate = useGlobalMutate();

  // Update pagination state when SWR pagination changes
  useEffect(() => {
    if (swrPagination) {
      setPagination(swrPagination);
    }
  }, [swrPagination]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      tags: selectedOptions
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
      if (editingBlog) {
        await blogAPI.updateBlog(editingBlog._id, formData);
      } else {
        await blogAPI.createBlog(formData);
      }
      
      // Revalidate SWR data
      mutateBlogs();
      
      setShowModal(false);
      setEditingBlog(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save blog:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      coverImage: '',
      category: '',
      tags: [],
      metaTitle: '',
      metaDescription: '',
      seoKeywords: '',
      status: 'draft',
      published: false
    });
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage || '',
      category: blog.category._id || blog.category,
      tags: blog.tags.map(tag => tag._id || tag),
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
      seoKeywords: blog.seoKeywords.join(', '),
      status: blog.status,
      published: blog.published
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogAPI.deleteBlog(id);
        // Revalidate SWR data
        mutateBlogs();
      } catch (error) {
        console.error('Failed to delete blog:', error);
      }
    }
  };

  const togglePublish = async (id) => {
    try {
      await blogAPI.togglePublish(id);
      // Revalidate SWR data
      mutateBlogs();
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading blogs...</div>;
  }

  return (
    <div className="blogs-container">
      <div className="blogs-header">
        <h2>Blog Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + New Blog
        </button>
      </div>

      {/* Filters */}
      <div className="blogs-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Category:</label>
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Per page:</label>
          <select value={pagination.limit} onChange={handleLimitChange}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="blogs-table">
        <table>
          <thead>
            <tr>
              <th>Cover</th>
              <th>Title</th>
              <th>Status</th>
              <th>Category</th>
              <th>Tags</th>
              <th>Views</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map(blog => (
              <tr key={blog._id}>
                <td>
                  {blog.coverImage ? (
                    <img 
                      src={getImageUrl(blog.coverImage)} 
                      alt={blog.title}
                      className="table-cover-image"
                    />
                  ) : (
                    <div className="no-image-placeholder">📷</div>
                  )}
                </td>
                <td>
                  <div className="blog-title">
                    <strong>{blog.title}</strong>
                    <small>{blog.slug}</small>
                  </div>
                </td>
                <td>
                  <span className={`status ${blog.status}`}>
                    {blog.status}
                  </span>
                </td>
                <td>
                  {blog.category?.name || 'Uncategorized'}
                </td>
                <td>
                  <div className="tags-list">
                    {blog.tags.map(tag => (
                      <span key={tag._id || tag} className="tag">
                        {tag.name || tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{blog.views}</td>
                <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="actions">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(blog)}
                    >
                      Edit
                    </button>
                    <button 
                      className={`btn btn-sm ${blog.published ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => togglePublish(blog._id)}
                    >
                      {blog.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(blog._id)}
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
      {pagination.pages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} blogs
          </div>
          <div className="pagination-controls">
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`btn btn-sm ${page === pagination.page ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Blog Form Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingBlog ? 'Edit Blog' : 'Create New Blog'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  setEditingBlog(null);
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
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Cover Image</label>
                <ImageSelector
                  value={formData.coverImage}
                  onChange={(value) => setFormData(prev => ({ ...prev, coverImage: value }))}
                  placeholder="Select cover image"
                />
              </div>

              <div className="form-group">
                <label>Excerpt</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="10"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tags</label>
                  <select
                    name="tags"
                    value={formData.tags}
                    onChange={handleTagsChange}
                    multiple
                    className="tags-select"
                  >
                    {tags.map(tag => (
                      <option key={tag._id} value={tag._id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                  <small>Hold Ctrl/Cmd to select multiple tags</small>
                </div>
              </div>

              <div className="form-group">
                <label>Meta Title</label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Meta Description</label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>SEO Keywords (comma separated)</label>
                <input
                  type="text"
                  name="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={handleChange}
                  placeholder="marketing, business, growth"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                  />
                  Published
                </label>
              </div>
            </form>

            <div className="modal-footer">
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setEditingBlog(null);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                {editingBlog ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
