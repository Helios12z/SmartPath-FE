import { fetchWrapper } from '@/lib/fetchWrapper';
import { SystemLog } from '../types';

export const systemLogAPI = {
  recent: async (limit = 50): Promise<SystemLog[]> =>
    fetchWrapper.get(`/systemlog/recent?limit=${limit}`),

  mine: async (): Promise<SystemLog[]> => fetchWrapper.get('/systemlog/mine'),
};
