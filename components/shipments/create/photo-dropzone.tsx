'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ImageIcon, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useUploadImages } from '@/hooks/use-upload-image';
import { cn } from '@/lib/utils';

interface UploadingItem {
  id: string;
  previewUrl: string;
  fileName: string;
}

interface PhotoDropzoneProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function PhotoDropzone({ value, onChange }: PhotoDropzoneProps) {
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadImages } = useUploadImages();

  const MAX_FILES = 5;
  const MAX_SIZE = 5 * 1024 * 1024;

  const totalCount = value.length + uploading.length;

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      if (totalCount + fileArray.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} photos allowed`);
        return;
      }

      const valid: File[] = [];
      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > MAX_SIZE) {
          toast.error(`${file.name} exceeds 5MB limit`);
          continue;
        }
        valid.push(file);
      }

      if (valid.length === 0) return;

      const ids = valid.map(() => crypto.randomUUID());
      const previews = valid.map((f, i) => ({
        id: ids[i],
        previewUrl: URL.createObjectURL(f),
        fileName: f.name,
      }));

      setUploading((prev) => [...prev, ...previews]);

      try {
        const results = await uploadImages(valid);
        onChange([...value, ...results.map((r) => r.url)]);
      } catch {
        toast.error('Failed to upload photos');
      } finally {
        setUploading((prev) => prev.filter((u) => !ids.includes(u.id)));
        previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      }
    },
    [totalCount, value, onChange, uploadImages]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        handleFiles(e.target.files);
        e.target.value = '';
      }
    },
    [handleFiles]
  );

  const handleRemoveUploaded = useCallback(
    (url: string) => {
      onChange(value.filter((u) => u !== url));
    },
    [value, onChange]
  );

  const handleRemoveUploading = useCallback((id: string) => {
    setUploading((prev) => {
      const item = prev.find((u) => u.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((u) => u.id !== id);
    });
  }, []);

  useEffect(() => {
    return () => {
      uploading.forEach((u) => URL.revokeObjectURL(u.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors cursor-pointer hover:border-primary/50',
          totalCount >= MAX_FILES && 'pointer-events-none opacity-50'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
      >
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-primary">Click to browse</span> or drag and drop
        </div>
        <div className="text-xs text-muted-foreground">
          At least 1 image required, up to {MAX_FILES} max, 5MB each
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {(value.length > 0 || uploading.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {value.map((url) => (
            <div key={url} className="group relative">
              <img src={url} alt="Uploaded" className="h-16 w-16 rounded-md object-cover" />
              <button
                type="button"
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleRemoveUploaded(url)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {uploading.map((item) => (
            <div key={item.id} className="group relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
              <button
                type="button"
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleRemoveUploading(item.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
