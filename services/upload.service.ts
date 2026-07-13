import apiClient from '@/lib/api-client';

export interface UploadedPhoto {
  key: string;
  url: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  data: UploadedPhoto[];
}

export async function uploadPhotos(files: File[]): Promise<UploadedPhoto[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));
  const { data } = await apiClient.post<UploadResponse>('/uploads/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}
