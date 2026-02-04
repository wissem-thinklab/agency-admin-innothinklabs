const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const router = express.Router();

// Ensure client public images directory exists
const clientImagesDir = path.join(__dirname, '../../client/public/images/blog-covers');
if (!fs.existsSync(clientImagesDir)) {
  fs.mkdirSync(clientImagesDir, { recursive: true });
}

// Configure multer for file uploads (memory storage for processing)
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload and convert image to WebP
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Generate unique filename with WebP extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `blog-${uniqueSuffix}.webp`;
    const outputPath = path.join(clientImagesDir, filename);

    // Convert image to WebP and save to client public folder
    await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .toFile(outputPath);

    res.json({
      success: true,
      message: 'Image uploaded and converted to WebP successfully',
      data: {
        filename: filename,
        originalName: req.file.originalname,
        path: filename, // Just the filename for database
        size: req.file.size,
        mimetype: 'image/webp'
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload and convert image',
      error: error.message
    });
  }
});

// Delete uploaded image
router.delete('/image/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(clientImagesDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
});

module.exports = router;
