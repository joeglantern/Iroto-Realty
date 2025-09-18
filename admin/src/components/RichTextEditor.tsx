'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-md"></div>
});

// Import Quill styles
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter text...",
  className = ""
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simple toolbar configuration for property descriptions
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
  ];

  if (!mounted) {
    return <div className="h-32 bg-gray-100 animate-pulse rounded-md"></div>;
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.375rem',
          border: '1px solid #d1d5db'
        }}
      />
      
      <style jsx global>{`
        .rich-text-editor .ql-editor {
          min-height: 120px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-bottom: none;
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
        }
        
        .rich-text-editor .ql-container {
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-bottom: 1px solid #d1d5db;
          border-top: none;
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
        
        .rich-text-editor .ql-editor:focus {
          outline: none;
        }
        
        .rich-text-editor .ql-toolbar .ql-formats {
          margin-right: 15px;
        }
      `}</style>
    </div>
  );
}