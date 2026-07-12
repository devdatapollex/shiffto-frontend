import { useMutation } from '@tanstack/react-query';
import { uploadPhotos } from '@/services/upload.service';

export function useUploadImages() {
  return useMutation({
    mutationFn: (files: File[]) => uploadPhotos(files),
  });
}
