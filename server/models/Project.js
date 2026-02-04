const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  coverImage: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  completedDate: {
    type: Date,
    required: [true, 'Completed date is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  }
}, {
  timestamps: true
});

// Create slug from title before saving
projectSchema.pre('save', async function() {
  // Generate slug if title is modified or slug doesn't exist
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
});

module.exports = mongoose.model('Project', projectSchema);
