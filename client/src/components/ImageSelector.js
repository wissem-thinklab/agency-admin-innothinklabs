import React, { useState, useRef } from 'react';
import { uploadAPI, getImageUrl } from '../services/api';
import './ImageSelector.css';

const ImageSelector = ({ value, onChange, placeholder = "Select cover image" }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(getImageUrl(value) || '');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      const response = await uploadAPI.uploadImage(file);
      // Store only the filename in the database
      const imageUrl = response.data.path; // Just the filename
      setPreview(getImageUrl(imageUrl)); // Show full URL for preview
      onChange(imageUrl); // Store only filename
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreview(url);
    onChange(url);
  };

  // Update preview when value changes (for edit mode)
  React.useEffect(() => {
    setPreview(getImageUrl(value) || '');
  }, [value]);

  return (
    <div className="image-selector">
      <div className="image-selector-header">
        <label>{placeholder}</label>
        <div className="image-selector-tabs">
          <button 
            type="button"
            className={`tab-btn ${!preview || preview.startsWith('http') ? 'active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <button 
            type="button"
            className={`tab-btn ${preview && !preview.startsWith('http') ? 'active' : ''}`}
          >
            URL
          </button>
        </div>
      </div>

      <div className="image-selector-content">
        {preview ? (
          <div className="image-preview">
            <img 
              src={preview} 
              alt="Preview" 
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04NSA2MEgxMTVWOTBIODVWNjBaIiBmaWxsPSIjQ0NDQ0NDIi8+CjxwYXRoIGQ9Ik03NSA3MEw4NSA2MEw5NSA3MEg3NVoiIGZpbGw9IiNDQ0NDQ0MiLz4KPHN2ZyB0ZXh0PSJJbWFnZSBub3QgZm91bmQiIHg9IjUwIiB5PSI4MCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSI+PC9zdmc+Cjwvc3ZnPgo=';
              }}
            />
            <button 
              type="button"
              className="remove-btn"
              onClick={handleRemove}
            >
              ×
            </button>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">📷</div>
            <p>Click to upload or enter image URL</p>
            <small>Supported: JPG, PNG, GIF (Max 5MB)</small>
          </div>
        )}
      </div>

      <div className="image-selector-controls">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        <input
          type="url"
          placeholder="Or enter image URL..."
          value={preview && !preview.startsWith('data:') ? preview : ''}
          onChange={handleUrlChange}
          className="url-input"
        />
      </div>
    </div>
  );
};

export default ImageSelector;
