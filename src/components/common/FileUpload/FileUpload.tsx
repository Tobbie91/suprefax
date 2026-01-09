import * as React from 'react';
import { cn } from '@/utils/cn';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@/utils/formatters';

export interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  disabled?: boolean;
  value?: File | File[] | null;
  onChange: (files: File | File[] | null) => void;
  error?: string;
  helpText?: string;
}

export function FileUpload({
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  disabled = false,
  value,
  onChange,
  error,
  helpText,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const files = React.useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFiles = (fileList: FileList): File[] => {
    const validFiles: File[] = [];
    const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());

    for (const file of Array.from(fileList)) {
      // Check file type
      const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const isValidType = acceptedTypes.some(
        (type) => type === fileExt || file.type.includes(type.replace('.', ''))
      );

      if (!isValidType) {
        setUploadError(`File type not accepted: ${file.name}`);
        continue;
      }

      // Check file size
      if (file.size > maxSize) {
        setUploadError(`File too large: ${file.name} (max ${formatFileSize(maxSize)})`);
        continue;
      }

      validFiles.push(file);
    }

    return validFiles;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError(null);

    if (disabled || !e.dataTransfer.files) return;

    const validFiles = validateFiles(e.dataTransfer.files);
    if (validFiles.length > 0) {
      if (multiple) {
        onChange([...files, ...validFiles]);
      } else {
        onChange(validFiles[0]);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (!e.target.files) return;

    const validFiles = validateFiles(e.target.files);
    if (validFiles.length > 0) {
      if (multiple) {
        onChange([...files, ...validFiles]);
      } else {
        onChange(validFiles[0]);
      }
    }
  };

  const handleRemove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    if (multiple) {
      onChange(newFiles.length > 0 ? newFiles : null);
    } else {
      onChange(null);
    }
  };

  const displayError = error || uploadError;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed p-6 transition-colors',
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 hover:border-neutral-400',
          disabled && 'cursor-not-allowed opacity-50',
          displayError && 'border-error-500'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />

        <div className="flex flex-col items-center text-center">
          <Upload
            className={cn(
              'mb-3 h-10 w-10',
              dragActive ? 'text-primary-500' : 'text-neutral-400'
            )}
          />
          <p className="mb-1 text-sm font-medium text-neutral-700">
            <span className="text-primary-600">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-neutral-500">
            {accept.replace(/\./g, '').toUpperCase()} (max {formatFileSize(maxSize)})
          </p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3"
            >
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-700">{file.name}</p>
                  <p className="text-xs text-neutral-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Help text */}
      {helpText && !displayError && (
        <p className="text-xs text-neutral-500">{helpText}</p>
      )}

      {/* Error message */}
      {displayError && (
        <div className="flex items-center gap-2 text-xs text-error-600">
          <AlertCircle className="h-4 w-4" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
