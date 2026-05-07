import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle } from 'lucide-react';
import api from '../api';

const ImageUpload = ({ value, onChange, label, hint }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client side validation
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        onChange(data.url);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest">{label}</label>}
      
      <div className={`relative group border-2 border-dashed rounded-3xl transition-all h-40 flex flex-col items-center justify-center overflow-hidden
        ${value ? 'border-success/30 bg-success/5' : 'border-border-light hover:border-primary/30 hover:bg-primary/5 bg-light-bg/30'}
        ${error ? 'border-error/30 bg-error/5' : ''}
      `}>
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-tighter">Uploading...</span>
          </div>
        ) : value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-dark-bg/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white text-primary rounded-2xl shadow-lg hover:scale-110 transition-transform"
              >
                <Upload className="w-5 h-5" />
              </button>
              <button 
                type="button"
                onClick={removeImage}
                className="p-3 bg-white text-error rounded-2xl shadow-lg hover:scale-110 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute top-3 right-3 p-1.5 bg-success text-white rounded-full shadow-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 w-full h-full"
          >
            <div className="p-4 bg-white rounded-full shadow-sm text-text-muted group-hover:text-primary group-hover:scale-110 transition-all">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-text-primary">Click to upload</p>
              <p className="text-[10px] text-text-muted font-medium uppercase tracking-widest mt-1">PNG, JPG, WEBP up to 5MB</p>
            </div>
          </button>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
      
      {error && <p className="text-[10px] font-bold text-error uppercase tracking-widest">{error}</p>}
      {hint && !error && <p className="text-[10px] text-text-muted font-medium uppercase tracking-widest">{hint}</p>}
    </div>
  );
};

export default ImageUpload;
