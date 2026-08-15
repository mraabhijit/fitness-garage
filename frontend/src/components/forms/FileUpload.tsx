import React, { useRef, useState } from 'react';
import { UploadCloud, File, X } from 'lucide-react';

export interface FileUploadProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  onFileSelect: (file: File | null) => void;
  helperText?: string;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  maxSizeMB = 10,
  onFileSelect,
  helperText,
  error,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (file && file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${maxSizeMB}MB`);
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-garage-muted">
        {label}
      </label>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-garage-chrome bg-garage-chrome/5'
            : error
            ? 'border-status-expired bg-status-expired/5'
            : 'border-garage-mid hover:border-garage-chrome/50 bg-garage-black'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />

        {selectedFile ? (
          <div className="flex items-center justify-between p-3 bg-garage-dark border border-garage-mid rounded-lg">
            <div className="flex items-center gap-3 truncate">
              <File className="w-5 h-5 text-garage-chrome shrink-0" />
              <div className="text-left truncate">
                <p className="text-xs font-bold text-garage-white truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-garage-muted">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-1 rounded text-garage-muted hover:text-status-expired transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <UploadCloud className="w-8 h-8 text-garage-chrome" />
            <p className="text-xs font-semibold text-garage-white">
              Click or drag file to upload
            </p>
            <p className="text-[11px] text-garage-muted">
              {accept ? `Accepted formats: ${accept}` : `Max size ${maxSizeMB}MB`}
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-status-expired font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-garage-muted">{helperText}</p>}
    </div>
  );
};
