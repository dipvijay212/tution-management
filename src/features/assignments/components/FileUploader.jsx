'use client';

import React, { useState } from 'react';
import { Upload, File, X, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const FileUploader = ({ bucket, folder = '', onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      toast.success('File uploaded successfully!');
      onUploadComplete({ path: filePath, url: publicUrl, name: file.name });
      setFile(null);
    } catch (error) {
      console.error('Error uploading file:', error.message);
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 transition-all group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload size={24} className="text-gray-400 group-hover:text-indigo-600 mb-2" />
            <p className="text-xs font-bold text-gray-500 group-hover:text-indigo-600 uppercase tracking-widest">
              Click to upload file
            </p>
            <p className="text-[10px] text-gray-400 mt-1">PDF, DOCX up to 10MB</p>
          </div>
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
              <File size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!uploading ? (
              <>
                <button onClick={() => setFile(null)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <X size={18} />
                </button>
                <button 
                  onClick={uploadFile}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all"
                >
                  Upload
                </button>
              </>
            ) : (
              <Loader2 size={20} className="animate-spin text-indigo-600" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
