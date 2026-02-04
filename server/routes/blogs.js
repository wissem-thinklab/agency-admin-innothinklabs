const express = require('express');
const Blog = require('../models/Blog');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const router = express.Router();

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    
    const blogs = await Blog.find(query)
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
});

// Get single blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('tags', 'name slug');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({
      success: true,
      data: { blog }
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message
    });
  }
});

// Create new blog
router.post('/', async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      tags: Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };
    
    const blog = new Blog(blogData);
    await blog.save();
    
    const populatedBlog = await Blog.findById(blog._id)
      .populate('category', 'name slug')
      .populate('tags', 'name slug');
    
    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog: populatedBlog }
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog',
      error: error.message
    });
  }
});

// Update blog
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      tags: Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      seoKeywords: Array.isArray(req.body.seoKeywords) ? req.body.seoKeywords : req.body.seoKeywords.split(',').map(keyword => keyword.trim()).filter(Boolean)
    };
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: { blog }
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: error.message
    });
  }
});

// Delete blog
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: error.message
    });
  }
});

// Toggle publish status
router.patch('/:id/toggle-publish', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    blog.published = !blog.published;
    blog.status = blog.published ? 'published' : 'draft';
    await blog.save();
    
    const populatedBlog = await Blog.findById(blog._id).populate('category', 'name');
    
    res.json({
      success: true,
      message: `Blog ${blog.published ? 'published' : 'unpublished'} successfully`,
      data: { blog: populatedBlog }
    });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle publish status',
      error: error.message
    });
  }
});

// Get blog stats
router.get('/stats/overview', async (req, res) => {
  try {
    const total = await Blog.countDocuments();
    const published = await Blog.countDocuments({ published: true });
    const drafts = await Blog.countDocuments({ status: 'draft' });
    const totalViews = await Blog.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        published,
        drafts,
        totalViews: totalViews[0]?.totalViews || 0
      }
    });
  } catch (error) {
    console.error('Get blog stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog stats',
      error: error.message
    });
  }
});

module.exports = router;
