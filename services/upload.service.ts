import apiClient from '@/lib/api-client';

export interface UploadedPhoto {
  key: string;
  url: string;
}

export async function uploadPhotos(files: File[]): Promise<UploadedPhoto[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));
  const { data } = await apiClient.post<UploadedPhoto[]>('/uploads/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
