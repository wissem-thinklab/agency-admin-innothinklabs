import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const HTMLEditor = ({ value, onChange, placeholder = '' }) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !editorRef.current || quillRef.current) return;

    // Initialize Quill
    quillRef.current = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link', 'image'],
          ['clean']
        ]
      },
      placeholder
    });

    // Set initial content
    if (value) {
      quillRef.current.root.innerHTML = value;
    }

    // Handle text changes
    quillRef.current.on('text-change', () => {
      const html = quillRef.current.root.innerHTML;
      onChange(html);
    });

    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change');
        quillRef.current = null;
      }
    };
  }, [isClient, placeholder]);

  // Update content when value prop changes
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="html-editor">
      <div ref={editorRef} style={{ minHeight: '200px' }} />
    </div>
  );
};

export default HTMLEditor;
