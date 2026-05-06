'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface FileUploadProps {
  label: string;
  category: string;
  customerId: string;
  onUploadComplete: (data: any) => void;
  className?: string;
}

export default function FileUpload({ label, category, customerId, onUploadComplete, className }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File too large (max 10MB)');
        return;
      }
      setFile(selectedFile);
      startUpload(selectedFile);
    }
  };

  const startUpload = async (fileToUpload: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 0. Check for duplicates
      const { data: existingDoc } = await supabase
        .from('documents')
        .select('id')
        .eq('customer_id', customerId)
        .eq('document_type', category)
        .eq('document_name', fileToUpload.name)
        .eq('archived', false)
        .maybeSingle();

      if (existingDoc) {
        toast.error('This document has already been uploaded for this customer.');
        setIsUploading(false);
        return;
      }

      // 1. Upload to Supabase Storage (High Speed & Low Latency)
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${customerId}/${category}/${Date.now()}.${fileExt}`;
      const filePath = `policy-vault/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('policy-vault')
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setUploadProgress(80);

      // 2. Register in DB
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert({
          customer_id: customerId,
          document_name: fileToUpload.name,
          storage_object_key: uploadData.path,
          file_size_bytes: fileToUpload.size,
          mime_type: fileToUpload.type,
          document_type: category,
          uploaded_by: user.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadedKey(uploadData.path);
      onUploadComplete(document);
      setUploadProgress(100);
      toast.success('File uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setUploadedKey(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>
      
      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-2xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-all">
            <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-600">Click to upload</p>
            <p className="text-xs text-slate-400 mt-1">PDF, JPG or PNG (Max 10MB)</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" 
            accept=".pdf,.jpg,.jpeg,.png,.webp"
          />
        </div>
      ) : (
        <div className="relative border border-slate-200 bg-white rounded-2xl p-4 flex items-center gap-4 group">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <FileText className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            {isUploading && (
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            {uploadedKey && !isUploading && (
              <div className="flex items-center gap-1 mt-1 text-emerald-600">
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase">Uploaded</span>
              </div>
            )}
          </div>
          <button 
            onClick={clearFile}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
