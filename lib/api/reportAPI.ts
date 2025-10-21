import { fetchWrapper } from '@/lib/fetchWrapper';
import { ReportRequestDto } from '../types';

export const reportAPI = {
  getPending: async () => fetchWrapper.get('/report/pending'),
  getMine: async () => fetchWrapper.get('/report/mine'),
  create: async (payload: ReportRequestDto) => fetchWrapper.post('/report', payload),
  updateStatus: async (id: string, status: string) =>
    fetchWrapper.put(`/report/${id}/status?status=${status}`),
};
