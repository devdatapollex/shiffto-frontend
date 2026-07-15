'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { UploadCloud, Loader2, X, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUploadImages } from '@/hooks/use-upload-image';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { CreateTripValues } from '@/lib/validations/trip';

export function UploadTicketStep() {
  const { control, setValue } = useFormContext<CreateTripValues>();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadFiles } = useUploadImages();

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const file = files[0];
      if (!file) return;

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file format. Only JPG, PNG, and PDF are allowed.');
        return;
      }

      if (file.size > MAX_SIZE) {
        toast.error('File size exceeds the 10MB limit.');
        return;
      }

      setUploading(true);
      try {
        const results = await uploadFiles([file]);
        if (results && results[0]?.url) {
          setValue('ticketPhoto', results[0].url, { shouldDirty: true, shouldValidate: true });
          toast.success('Ticket uploaded successfully');
        }
      } catch {
        toast.error('Failed to upload flight ticket');
      } finally {
        setUploading(false);
      }
    },
    [setValue, uploadFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files?.length) {
        handleFiles(e.dataTransfer.files);
      }
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

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="ticketPhoto"
        render={({ field }) => {
          const isUploaded = !!field.value;
          const isPdf = field.value?.toLowerCase().endsWith('.pdf');

          return (
            <FormItem className="space-y-2">
              <FormLabel className="text-[#0B3A8E] font-semibold text-sm">
                Upload Ticket <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {/* Dropzone area */}
                  {!isUploaded && !uploading && (
                    <div
                      role="button"
                      tabIndex={0}
                      className={cn(
                        'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 p-8 text-center transition-colors cursor-pointer hover:border-orange-500 hover:bg-orange-50/10'
                      )}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                      }}
                    >
                      <div className="rounded-full bg-slate-100 p-3 text-slate-400">
                        <UploadCloud className="h-8 w-8 stroke-[1.5]" />
                      </div>
                      <div className="text-sm text-slate-500">
                        <span className="font-semibold text-orange-500">Click to upload</span> or
                        drag and drop
                      </div>
                      <div className="text-xs text-slate-400">PNG, JPG or PDF (max 10MB)</div>
                    </div>
                  )}

                  {/* Uploading loader state */}
                  {uploading && (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 p-8 text-center bg-slate-50">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                      <div className="text-sm text-slate-600 font-medium">Uploading ticket...</div>
                    </div>
                  )}

                  {/* Uploaded state preview */}
                  {isUploaded && !uploading && (
                    <div className="relative rounded-xl border border-slate-200 p-4 bg-slate-50 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {isPdf ? (
                          <div className="rounded-lg bg-red-50 p-2.5 text-red-500 shrink-0">
                            <FileText className="h-6 w-6" />
                          </div>
                        ) : (
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden border shrink-0 bg-white">
                            <Image
                              src={toRelativeImageUrl(field.value)}
                              alt="Flight Ticket"
                              className="h-full w-full object-cover"
                              width={48}
                              height={48}
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">
                            {isPdf ? 'Flight_Ticket.pdf' : 'Flight_Ticket.png'}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-0.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Successfully uploaded</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setValue('ticketPhoto', '', { shouldDirty: true, shouldValidate: true })
                        }
                        className="rounded-full bg-slate-200 hover:bg-slate-300 p-1.5 text-slate-600 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, application/pdf"
                    className="hidden"
                    onChange={handleInputChange}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
}
