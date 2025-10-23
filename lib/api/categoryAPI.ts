// src/lib/api/categoryAPI.ts
import { fetchWrapper } from '@/lib/fetchWrapper';

export type CategoryDto = { id: string; name: string };

export const categoryAPI = {
  getAll: async (): Promise<CategoryDto[]> => {
    try {
      return await fetchWrapper.get('/category');
    } catch {
      return []; 
    }
  },
};